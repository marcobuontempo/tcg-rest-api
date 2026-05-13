import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utilities/error.util.js";
import { UserCard } from "../../database/models/userCard.model.js";
import { Card } from "../../database/models/card.model.js";
import { BattleSchema } from "../../schemas/battle.schema.js";
import { TypedRequest } from "../../types/express.js";
import { Op } from "sequelize";
import { cache } from "../../cache/index.js";

// POST: /api/battle/play
export const playBattle = async (
  req: TypedRequest<typeof BattleSchema>,
  res: Response,
  next: NextFunction,
) => {
  // add user to active battles list
  cache.battle.add(req.user.id);

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
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: Card,
          where: {
            name: {
              [Op.in]: cardNames,
            },
          },
        },
      ],
    })) as (UserCard & { Card: Card })[];

    // check there user owns the valid amount of cards
    for (const card of userCards) {
      const cardName = card.Card.name;
      const userOwnedQuantity = card.quantity;
      const requestedCardcount = cardNamesCount.get(cardName)!;
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

    const result = Math.random() > 0.5 ? "win" : "loss";

    // remove user from active battles list
    cache.battle.delete(req.user.id);

    return res.status(200).json({
      result: result,
      win_amount: 0,
      balance: 0,
    });
  } catch (err) {
    // remove user from active battles list
    cache.battle.delete(req.user.id);
    return next(err);
  }
};
