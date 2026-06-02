import { NextFunction, Response } from "express";
import { ApiError } from "../../utilities/error.util.js";
import { UserCard } from "../../database/models/userCard.model.js";
import { BattleSchema } from "../../schemas/battle.schema.js";
import { TypedRequest } from "../../types/express.js";
import { literal, Op } from "sequelize";
import { cache } from "../../cache/index.js";
import {
  generateCardList,
  simulateBattle,
} from "../../utilities/battle.util.js";
import { database } from "../../database/connection.js";
import config from "../../config/index.js";
import { UserStats } from "../../database/models/userStats.model.js";
import { User } from "../../database/models/user.model.js";
import { formatCardForResponse } from "../../utilities/cards.util.js";
import { formatBalanceForResponse } from "../../utilities/balance.util.js";

// POST: /api/battle/:difficulty
export const playBattle = async (
  req: TypedRequest<typeof BattleSchema>,
  res: Response,
  next: NextFunction,
) => {
  // add user to active battles list
  cache.battle.active.add(req.user.id);

  // get player card data
  const cardNames = req.body.cards;

  const playerCards = cardNames.map((c) => {
    const data = cache.cards.data.get(c);
    if (!data) throw ApiError.badRequest(`'${c}' does not exist`);
    return data;
  });

  const playerCardCounts = new Map<number, number>();
  for (const card of playerCards) {
    playerCardCounts.set(card.id, (playerCardCounts.get(card.id) || 0) + 1);
  }

  // generate opponent's cards (based on requested difficulty)
  const opponentCards = generateCardList(
    req.body.difficulty,
    config.battle.cardCount,
  );

  // simulate the battle - returning the winner and the battle's log
  const { winner, battleLog } = simulateBattle(playerCards, opponentCards);

  // pick a random card to burn if player loses
  let cardToBurn =
    winner === "player"
      ? null
      : playerCards[Math.floor(Math.random() * playerCards.length)];

  // compute deltas
  const increments: any = {
    user: {},
    stats: {
      total_battles: 1,
    },
  };
  cache.stats.total_battles += 1; // also update local cache stats
  if (winner === "player") {
    // user: balance
    increments.user.balance = Math.floor(
      config.battle.baseReward *
        Math.pow(config.battle.rewardScaleFactor, req.body.difficulty - 1),
    );
    // user: xp
    increments.user.xp = Math.round(
      increments.user.balance * config.battle.xpMultiplier,
    );

    // user stats: total wins
    increments.stats.total_wins = 1;
    cache.stats.total_wins += 1; // also update local cache stats
  }
  if (winner === "opponent") {
    // user stats: total losses
    increments.stats.total_losses = 1;
    cache.stats.total_losses += 1; // also update local cache stats
  }

  // pre-calculate/create the conditions for card_id:quantity for sequelize array
  const conditions = Array.from(playerCardCounts.entries()).map(
    ([cardId, requiredQuantity]) => ({
      card_id: cardId,
      quantity: {
        [Op.gte]: requiredQuantity,
      },
    }),
  );

  // start transaction
  const transaction = await database.transaction();

  // bundle database operations for reduced lock times
  try {
    // get all user's cards that match the conditions
    // (i.e. where quantity for each requested card is greater-than/equal-to owned quantity)
    const userCards = await UserCard.findAll({
      where: {
        user_id: req.user.id,
        [Op.or]: conditions,
      },
      transaction,
    });
    // this check only fails if user does not actually own the required quantity of cards requested for battle
    if (userCards.length !== playerCardCounts.size)
      throw ApiError.badRequest("user does not own required card quantities");

    // burn card if necessary
    if (cardToBurn) {
      const [updated] = await UserCard.update(
        {
          quantity: literal("quantity - 1"),
        },
        {
          where: {
            user_id: req.user.id,
            card_id: cardToBurn.id,
            quantity: { [Op.gte]: 1 },
          },
          transaction,
        },
      );

      if (updated === 0)
        throw ApiError.unavailable("could not process card burn");
    }

    // apply user rewards
    if (increments.user?.balance || increments.user?.xp) {
      await User.increment(increments.user, {
        where: { id: req.user.id },
        transaction,
      });
    }

    // update user stats
    await UserStats.increment(increments.stats, {
      where: { user_id: req.user.id },
      transaction,
    });

    // commit transaction
    await transaction.commit();

    // increase req.user values to match updated database committed stats
    if (!increments.user?.balance) increments.user.balance = 0;
    if (!increments.user?.xp) increments.user.xp = 0;
    req.user.balance += increments.user.balance;
    req.user.xp += increments.user.xp;

    // remove user from active battles list
    cache.battle.active.delete(req.user.id);

    // return battle summary
    return res.status(200).json({
      result: winner === "player" ? "win" : "lose",
      burned_card: cardToBurn ? formatCardForResponse(cardToBurn) : cardToBurn,
      win_amount: formatBalanceForResponse(increments.user.balance),
      xp_gain: increments.user.xp,
      current_balance: formatBalanceForResponse(req.user.balance),
      current_xp: req.user.xp + increments.user.xp,
      battle_log: battleLog,
    });
  } catch (err) {
    // on error, remove user from active battles list
    cache.battle.active.delete(req.user.id);

    // rollback transaction
    await transaction.rollback();

    // pass error to error handler middleware
    return next(err);
  }
};
