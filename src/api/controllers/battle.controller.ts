import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utilities/error.util.js";
import { UserCard } from "../../database/models/userCard.model.js";
import { Card } from "../../database/models/card.model.js";

export const playBattle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // get userid
  const userId = req.user.id;

  // get user cards from req.body
  let cardNames = req.body?.cards;

  // verify that cards array contains 5 names
  if (!cardNames || !Array.isArray(cardNames) || cardNames.length !== 5) {
    return next(ApiError.badRequest("'cards' must be an array of length 5"));
  }

  // flatten requested names into [name] : [quantity]
  const cardNamesCount: Record<string, number> = {};
  cardNames.forEach((cardName) => {
    const cardNameNormalised = cardName.toLowerCase();
    cardNamesCount[cardNameNormalised] =
      (cardNamesCount[cardNameNormalised] || 0) + 1;
  });

  // verify all cards are actually owned by user
  // join cards -> usercards, and find all matching card names provided
  const userCards = (await UserCard.findAll({
    where: {
      user_id: userId,
    },
    attributes: {
      exclude: ["created_at", "updated_at"],
    },
    include: [
      {
        model: Card,
        where: {
          name: cardNames,
        },
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
      },
    ],
  })) as (UserCard & { Card: Card })[];

  // check there user owns the valid amount of cards
  for (const card of userCards) {
    const cardName = card.Card.name;
    const userOwnedQuantity = card.quantity;
    if (cardNamesCount[cardName] > userOwnedQuantity) {
      return next(
        ApiError.badRequest(
          `user does not have enough copies of '${cardName}'`,
        ),
      );
    }
  }

  const result = Math.random() > 0.5 ? "win" : "loss";

  return res.status(200).json({
    result: result,
    win_amount: 0,
    balance: 0,
  });
};
