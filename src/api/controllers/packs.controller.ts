import { NextFunction, Request, Response } from "express";
import { cache } from "../../cache/index.js";
import { selectRandomCards } from "../../utilities/packs.util.js";
import { UserCard } from "../../database/models/userCard.model.js";
import { formatCardForResponse } from "../../utilities/cards.util.js";
import { TypedRequest } from "../../types/express.js";
import { OpenPackSchema } from "../../schemas/packs.schema.js";
import { ApiError } from "../../utilities/error.util.js";

// GET: /api/packs
export const getAllPacksData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200).json(cache.packs.information);
};

// POST: /api/packs/open
export const openPack = async (
  req: TypedRequest<typeof OpenPackSchema>,
  res: Response,
  next: NextFunction,
) => {
  const { pack_name } = req.params;
  const pack = cache.packs.data.get(pack_name);

  if (!pack) {
    return next(ApiError.badRequest("'pack_name' parameter is invalid"));
  }

  let insertQuery: string[] = [];
  const pulledCards = selectRandomCards(
    pack.cards,
    pack.cumulitiveDropRate,
    5,
  ).map((card) => {
    insertQuery.push(
      `('${req.user.id}', ${card.id}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
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

  return res.status(200).json(pulledCards);
};
