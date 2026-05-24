import { NextFunction, Request, Response } from "express";
import { cache } from "../../cache/index.js";
import { selectRandomCardsFromPack } from "../../utilities/packs.util.js";
import { UserCard } from "../../database/models/userCard.model.js";
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
  try {
    // get current date (and also yyyy-mm-dd string for database comparison)
    const now = new Date();
    const dateString = now.toISOString().split("T")[0];

    // update user's last claimed pack - also prevent double-claim during same day by ensuring query includes "less than"
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
      },
    );
    if (updated === 0)
      throw ApiError.forbidden("daily pack already claimed today");

    // get the lowest tier pack available
    const freePackName = cache.packs.information[0].name;
    const pack = cache.packs.data.get(freePackName);
    if (!pack) throw ApiError.badRequest("daily pack could not be processed");

    // generate cards from pack pool (x2 pack size for daily pack)
    const packedCards = selectRandomCardsFromPack(
      pack.cards,
      pack.cumulativeDropRate,
      2 * config.packs.cardCount,
    );

    // convert card counts into insert query values
    const insertQuery: string[] = [];
    for (const [cardId, count] of packedCards.counts) {
      insertQuery.push(
        `('${req.user.id}', ${cardId}, ${count}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      );
    }

    // insert cards to UserCards - use raw query to ensure correct updates (can't increment with in-built sequelize methods)
    await UserCard.sequelize?.query(`
      INSERT INTO user_cards (
        user_id,
        card_id,
        quantity,
        created_at,
        updated_at
      )
      VALUES ${insertQuery.join(",")}
      ON CONFLICT(user_id, card_id)
      DO UPDATE SET
         quantity = user_cards.quantity + EXCLUDED.quantity,
         updated_at = CURRENT_TIMESTAMP;
    `);

    // return the list of cards
    return res.status(200).json(packedCards.formatted);
  } catch (err) {
    // pass error to handler middleware
    return next(err);
  }
};

// POST: /api/packs/:pack_name/open
export const openPack = async (
  req: TypedRequest<typeof OpenPackSchema>,
  res: Response,
  next: NextFunction,
) => {
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
      },
    );
    if (updated === 0) throw ApiError.forbidden("insufficient funds");

    // generate cards from pack pool (x2 pack size for daily pack)
    const packedCards = selectRandomCardsFromPack(
      pack.cards,
      pack.cumulativeDropRate,
      config.packs.cardCount,
    );

    // convert card counts into insert query values
    const insertQuery: string[] = [];
    for (const [cardId, count] of packedCards.counts) {
      insertQuery.push(
        `('${req.user.id}', ${cardId}, ${count}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      );
    }

    // insert cards to UserCards - use raw query to ensure correct updates (can't increment with in-built sequelize methods)
    await UserCard.sequelize?.query(`
      INSERT INTO user_cards (
        user_id,
        card_id,
        quantity,
        created_at,
        updated_at
      )
      VALUES ${insertQuery.join(",")}
      ON CONFLICT(user_id, card_id)
      DO UPDATE SET
        quantity = user_cards.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP;
    `);

    // return the list of cards
    return res.status(200).json(packedCards.formatted);
  } catch (err) {
    // pass error to handler middleware
    return next(err);
  }
};
