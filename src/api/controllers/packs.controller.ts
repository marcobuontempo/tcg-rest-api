import { NextFunction, Request, Response } from "express";
import { cache } from "../../cache/index.js";
import { selectRandomCards } from "../../utilities/packs.util.js";
import { UserCard } from "../../database/models/userCard.model.js";
import { Sequelize } from "sequelize";
import { database } from "../../database/connection.js";
import { formatCardForResponse } from "../../utilities/cards.util.js";
import { Card } from "../../database/models/card.model.js";

export const getAllPacksData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res
    .status(200)
    .json(
      "TBC: return all types of packs with different rarities. e.g. [ { name: basic, cards: x,y,z, cost: 5 } ]",
    );
};

export const openPack = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user.id;

  let insertQuery: string[] = [];
  const pulledCards = selectRandomCards(
    cache.cards.data,
    cache.cards.cumulativeDropRates,
    5,
  ).map((card) => {
    insertQuery.push(
      `('${userId}', ${card.id}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    );
    return formatCardForResponse(card);
  });

  await UserCard.sequelize?.query(`
    INSERT INTO user_cards (user_id, card_id, quantity, updated_at, created_at)
    VALUES ${insertQuery.join(",")}
    ON CONFLICT(user_id, card_id)
    DO UPDATE SET quantity = quantity + 1,
                  updated_at = CURRENT_TIMESTAMP;
  `);

  return res.status(200).json({
    cards: pulledCards,
  });
};
