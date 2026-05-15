import { NextFunction, Request, Response } from "express";
import { cache } from "../../cache/index.js";
import { selectRandomCards } from "../../utilities/packs.util.js";
import { UserCard } from "../../database/models/userCard.model.js";
import { formatCardForResponse } from "../../utilities/cards.util.js";
import { TypedRequest } from "../../types/express.js";
import { OpenPackSchema } from "../../schemas/packs.schema.js";
import { ApiError } from "../../utilities/error.util.js";
import { database } from "../../database/connection.js";
import { Op } from "sequelize";
import { User } from "../../database/models/user.model.js";
import config from "../../config/index.js";

// GET: /api/packs
export const getAllPacksData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200).json(cache.packs.information);
};

// POST: /api/packs/daily/open
export const openDailyPack = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const last = req.user.last_daily_pack_at;
  const now = new Date();

  const isSameDay =
    last &&
    last.getUTCFullYear() === now.getUTCFullYear() &&
    last.getUTCMonth() === now.getUTCMonth() &&
    last.getUTCDate() === now.getUTCDate();

  if (isSameDay) {
    throw ApiError.forbidden("daily pack already claimed today");
  }

  await req.user.update({
    last_daily_pack_at: now,
  });

  const [freePackName] = Object.keys(config.packs.types) as Array<
    keyof typeof config.packs.types
  >;
  const pack = cache.packs.data.get(freePackName);

  if (!pack) {
    throw ApiError.badRequest("'basic' pack could not be processed");
  }

  // build card insertion query
  let insertQuery: string[] = [];

  const pulledCards = [
    ...selectRandomCards(pack.cards, pack.cumulativeDropRate, 5),
    ...selectRandomCards(pack.cards, pack.cumulativeDropRate, 5),
  ].map((card) => {
    insertQuery.push(
      `('${req.user.id}', ${card.id}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    );
    return formatCardForResponse(card);
  });

  // insert cards into UserCards
  await UserCard.sequelize?.query(
    `
    INSERT INTO user_cards (user_id, card_id, quantity, updated_at, created_at)
    VALUES ${insertQuery.join(",")}
    ON CONFLICT(user_id, card_id)
    DO UPDATE SET quantity = quantity + 1,
                  updated_at = CURRENT_TIMESTAMP;
  `,
  );

  return res.status(200).json(pulledCards);
};

// POST: /api/packs/:pack_name/open
export const openPack = async (
  req: TypedRequest<typeof OpenPackSchema>,
  res: Response,
  next: NextFunction,
) => {
  const { pack_name } = req.params;
  const pack = cache.packs.data.get(pack_name);

  if (!pack) {
    throw ApiError.badRequest("'pack_name' could not be processed");
  }

  const transaction = await database.transaction();

  try {
    // attempt to process payment
    const [updatedRows] = await User.update(
      {
        balance: database.literal(`balance - ${pack.cost}`),
      },
      {
        where: {
          id: req.user.id,
          balance: {
            [Op.gte]: pack.cost,
          },
        },
        transaction,
      },
    );

    if (updatedRows === 0) {
      throw ApiError.forbidden("insufficient funds");
    }

    // build card insertion query
    let insertQuery: string[] = [];

    // generate cards from pack pool
    const pulledCards = selectRandomCards(
      pack.cards,
      pack.cumulativeDropRate,
      5,
    ).map((card) => {
      insertQuery.push(
        `('${req.user.id}', ${card.id}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      );
      return formatCardForResponse(card);
    });

    // insert cards into UserCards
    await UserCard.sequelize?.query(
      `
    INSERT INTO user_cards (user_id, card_id, quantity, updated_at, created_at)
    VALUES ${insertQuery.join(",")}
    ON CONFLICT(user_id, card_id)
    DO UPDATE SET quantity = quantity + 1,
                  updated_at = CURRENT_TIMESTAMP;
  `,
      { transaction },
    );

    await transaction.commit();

    return res.status(200).json(pulledCards);
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
};
