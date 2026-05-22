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
  // return data from local cache
  return res.status(200).json(cache.packs.information);
};

// POST: /api/packs/daily/open
export const openDailyPack = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // start transaction
  const transaction = await database.transaction();

  try {
    // get current date (and also yyyy-mm-dd string for database comparison)
    const now = new Date();
    const dateString = now.toISOString().split("T")[0];

    // update and prevent double-claim during same day
    const [updated] = await User.update(
      { last_daily_pack_at: now },
      {
        where: {
          id: req.user.id,
          [Op.or]: [
            { last_daily_pack_at: null },
            { last_daily_pack_at: { [Op.lt]: dateString } },
          ],
        },
        transaction,
      },
    );
    if (updated === 0)
      throw ApiError.forbidden("daily pack already claimed today");

    // get the lowest tier pack available
    const freePackName = cache.packs.information[0].name;
    const pack = cache.packs.data.get(freePackName);
    if (!pack) throw ApiError.badRequest("daily pack could not be processed");

    // build card insertion query (so that only a single database query is required - more performant)
    const insertQuery: string[] = [];

    // generate cards from pack pool x2 -> add to SQL query -> and store as a formatted array for the response
    const pulledCards = selectRandomCards(
      pack.cards,
      pack.cumulativeDropRate,
      2 * config.packs.cardCount,
    ).map((card) => {
      insertQuery.push(
        `('${req.user.id}', ${card.id}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      );
      return formatCardForResponse(card);
    });

    // execute the built query (i.e. insert cards into UserCards)
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

    // commit transaction
    await transaction.commit();

    // return the list of cards
    return res.status(200).json(pulledCards);
  } catch (err) {
    // rollback transaction if error, and pass error to handler middleware
    await transaction.rollback();
    return next(err);
  }
};

// POST: /api/packs/:pack_name/open
export const openPack = async (
  req: TypedRequest<typeof OpenPackSchema>,
  res: Response,
  next: NextFunction,
) => {
  // start transaction
  const transaction = await database.transaction();

  try {
    // get pack data
    const packName = req.params.pack_name;
    const pack = cache.packs.data.get(packName);
    if (!pack || pack.cards.length === 0)
      throw ApiError.badRequest(`'${packName}' could not be processed`);

    // attempt to process payment
    const [updated] = await User.update(
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
    if (updated === 0) throw ApiError.forbidden("insufficient funds");

    // build card insertion query (so that only a single database query is required - more performant)
    const insertQuery: string[] = [];

    // generate cards from pack pool -> add to SQL query -> and store as a formatted array for the response
    const pulledCards = selectRandomCards(
      pack.cards,
      pack.cumulativeDropRate,
      config.packs.cardCount,
    ).map((card) => {
      insertQuery.push(
        `('${req.user.id}', ${card.id}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      );
      return formatCardForResponse(card);
    });

    // execute the built query (i.e. insert cards into UserCards)
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

    // commit transaction
    await transaction.commit();

    // return the list of cards
    return res.status(200).json(pulledCards);
  } catch (err) {
    // rollback transaction if error, and pass error to handler middleware
    await transaction.rollback();
    return next(err);
  }
};
