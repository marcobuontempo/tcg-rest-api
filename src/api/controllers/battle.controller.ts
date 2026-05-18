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
import { User } from "../../database/models/user.model.js";
import { UserStats } from "../../database/models/userStats.model.js";

// POST: /api/battle/:difficulty
export const playBattle = async (
  req: TypedRequest<typeof BattleSchema>,
  res: Response,
  next: NextFunction,
) => {
  // add user to active battles list
  cache.battle.active.add(req.user.id);

  const transaction = await database.transaction();

  try {
    // get user cards from req.body and normalise
    let cardNames = req.body.cards;

    // flatten requested names into [name] : [quantity]
    const cardNamesCount = new Map<string, number>();
    for (const name of cardNames) {
      const count = cardNamesCount.get(name) || 0;
      cardNamesCount.set(name, count + 1);
    }

    // verify all cards are actually owned by user
    // join cards -> usercards, and find all matching card names provided
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
      for (let i = 0; i < requestedCardcount; i++) {
        playerCards.push(card.Card);
      }
      if (requestedCardcount > userOwnedQuantity) {
        throw ApiError.badRequest(
          `user does not have enough copies of '${cardName}' (owned: ${userOwnedQuantity}, requested: ${requestedCardcount})`,
        );
      }
      cardNamesCount.delete(cardName);
    }

    if (cardNamesCount.size > 0) {
      throw ApiError.badRequest(
        `user does not have any copies of: '${Array.from(cardNamesCount.keys()).join(", ")}'`,
      );
    }

    const opponentCards = generateCardList(req.body.difficulty, 5);

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

      if (!randomCard) {
        return next(ApiError.badRequest("could not process card burn"));
      }

      // save reference to card values
      burnedCard = {
        name: randomCard.Card.name,
        type: randomCard.Card.type,
        rarity: randomCard.Card.rarity,
        attack: randomCard.Card.attack,
        defense: randomCard.Card.defense,
      };

      if (randomCard.quantity === 1) {
        await randomCard.destroy({ transaction });
      } else {
        await randomCard.decrement({ quantity: 1 }, { transaction });
      }
    }

    const reward =
      winner === "player"
        ? Math.floor(
            config.battle.baseReward *
              Math.pow(
                config.battle.rewardScaleFactor,
                req.body.difficulty - 1,
              ),
          )
        : 0;
    const xpGain = Math.round(reward * config.battle.xpMultiplier);

    // apply reward and xp gains
    const inc: any = {
      total_battles: 1,
    };

    if (winner === "player") inc.total_wins = 1;
    if (winner === "opponent") inc.total_losses = 1;

    await UserStats.increment(inc, {
      where: { user_id: req.user.id },
      transaction,
    });

    req.user.balance += reward;
    req.user.xp += xpGain;

    // update stats
    await UserStats.increment(
      {
        total_battles: 1,
        total_wins: winner === "player" ? 1 : 0,
        total_losses: winner === "opponent" ? 1 : 0,
      },
      {
        where: {
          user_id: req.user.id,
        },
        transaction,
      },
    );

    // commit
    await transaction.commit();

    // remove user from active battles list
    cache.battle.active.delete(req.user.id);

    return res.status(200).json({
      result: winner === "player" ? "win" : "lose",
      burned_card: burnedCard,
      win_amount: reward / 100,
      xp_gain: xpGain,
      current_balance: req.user.balance / 100,
      current_xp: req.user.xp,
      battle_log: battleLog,
    });
  } catch (err) {
    // remove user from active battles list
    cache.battle.active.delete(req.user.id);
    return next(err);
  }
};
