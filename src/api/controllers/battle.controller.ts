import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utilities/error.util.js";
import { UserCard } from "../../database/models/userCard.model.js";
import { Card } from "../../database/models/card.model.js";
import { BattleSchema } from "../../schemas/battle.schema.js";
import { TypedRequest } from "../../types/express.js";
import { Op } from "sequelize";
import { cache } from "../../cache/index.js";
import {
  generateCardList,
  simulateBattle,
} from "../../utilities/battle.util.js";
import { database } from "../../database/connection.js";
import config from "../../config/index.js";
import { UserStats } from "../../database/models/userStats.model.js";
import { User } from "../../database/models/user.model.js";

// POST: /api/battle/:difficulty
export const playBattle = async (
  req: TypedRequest<typeof BattleSchema>,
  res: Response,
  next: NextFunction,
) => {
  // add user to active battles list
  cache.battle.active.add(req.user.id);

  // start transaction
  const transaction = await database.transaction();

  try {
    // get user cards from req.body
    let cardNames = req.body.cards;

    // flatten requested names into [name]:[quantity]
    const cardNamesCount = new Map<string, number>();
    for (const name of cardNames) {
      const count = cardNamesCount.get(name) || 0;
      cardNamesCount.set(name, count + 1);
    }

    // find all matching user cards based on names provided
    const userCards = (await UserCard.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Card,
          where: { name: { [Op.in]: cardNames } },
        },
      ],
      transaction,
    })) as (UserCard & { Card: Card })[];

    // check the user owns the valid amount of cards
    let playerCards: Card[] = [];
    for (const card of userCards) {
      const cardName = card.Card.name;
      const userOwnedQuantity = card.quantity;
      const requestedCardcount = cardNamesCount.get(cardName)!;

      // ensure user owns the expected amount
      if (requestedCardcount > userOwnedQuantity)
        throw ApiError.badRequest(
          `user does not have enough copies of '${cardName}' (owned: ${userOwnedQuantity}, requested: ${requestedCardcount})`,
        );

      // add each requested card into the player cards (for battle)
      for (let i = 0; i < requestedCardcount; i++) {
        playerCards.push(card.Card);
      }

      // remove the card from the card count
      cardNamesCount.delete(cardName);
    }

    // cardNamesCount should be empty as we have removed all valid names
    if (cardNamesCount.size > 0)
      throw ApiError.badRequest(
        `user does not have any copies of: '${Array.from(cardNamesCount.keys()).join("")}'`,
      );

    // generate opponent's cards (based on requested difficulty)
    const opponentCards = generateCardList(
      req.body.difficulty,
      config.battle.cardCount,
    );

    // simulate the battle - returning the winner and the battle's log
    const { winner, battleLog } = simulateBattle(playerCards, opponentCards);

    // burn random card if player loses
    let burnedCard = null;
    if (winner === "opponent") {
      // pick a random card
      const randomCardName =
        playerCards[Math.floor(Math.random() * playerCards.length)].name;
      const randomCard = userCards.find(
        (card) => card.Card.name === randomCardName,
      );

      if (!randomCard)
        return next(ApiError.badRequest("could not process card burn"));

      // save reference to burned card values
      burnedCard = {
        name: randomCard.Card.name,
        type: randomCard.Card.type,
        rarity: randomCard.Card.rarity,
        attack: randomCard.Card.attack,
        defense: randomCard.Card.defense,
      };

      // decrement card count (or destroy if none left)
      if (randomCard.quantity === 1) {
        await randomCard.destroy({ transaction });
      } else {
        await randomCard.decrement({ quantity: 1 }, { transaction });
      }
    }

    // caluclate balance and xp gains
    const balanceGain =
      winner === "player"
        ? Math.floor(
            config.battle.baseReward *
              Math.pow(
                config.battle.rewardScaleFactor,
                req.body.difficulty - 1,
              ),
          )
        : 0;
    const xpGain = Math.round(balanceGain * config.battle.xpMultiplier);

    // apply reward gains
    await User.increment(
      {
        xp: xpGain,
        balance: balanceGain,
      },
      {
        where: { id: req.user.id },
        transaction,
      },
    );

    // store increases to user stats -> also increase these values in the local cache
    const statsIncrements: any = {
      total_battles: 1,
    };
    cache.stats.total_battles += 1;
    if (winner === "player") {
      statsIncrements.total_wins = 1;
      cache.stats.total_wins += 1;
    }
    if (winner === "opponent") {
      statsIncrements.total_losses = 1;
      cache.stats.total_losses += 1;
    }

    // incremement the user's stats based on previous calculations
    await UserStats.increment(statsIncrements, {
      where: { user_id: req.user.id },
      transaction,
    });

    // commit transaction
    await transaction.commit();

    // remove user from active battles list
    cache.battle.active.delete(req.user.id);

    // return battle summary
    return res.status(200).json({
      result: winner === "player" ? "win" : "lose",
      burned_card: burnedCard,
      win_amount: balanceGain / 100,
      xp_gain: xpGain,
      current_balance: (req.user.balance + balanceGain) / 100,
      current_xp: req.user.xp + xpGain,
      battle_log: battleLog,
    });
  } catch (err) {
    // on error, remove user from active battles list
    await transaction.rollback();

    // rollback transaction
    cache.battle.active.delete(req.user.id);

    // pass error to error handler middleware
    return next(err);
  }
};
