import { NextFunction, Request, Response } from "express";
import z from "zod";
import { CreateMarketListingSchema } from "../../schemas/marketListing.schema.js";
import { UserCard } from "../../database/models/userCard.model.js";
import { Card } from "../../database/models/card.model.js";
import { database } from "../../database/connection.js";
import { Op } from "sequelize";
import { ApiError } from "../../utilities/error.util.js";
import { MarketListing } from "../../database/models/marketListing.model.js";
import { TypedRequest } from "../../types/express.js";

export const createCardListing = async (
  req: TypedRequest<typeof CreateMarketListingSchema>,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user.id;

  const { name: cardName, quantity, price } = req.body;

  // start transaction
  const transaction = await database.transaction();

  try {
    // find if user owns card with necessary quantity
    const userCard = (await UserCard.findOne({
      where: {
        user_id: userId,
        quantity: {
          [Op.gte]: quantity,
        },
      },
      include: [
        {
          model: Card,
          where: {
            name: cardName,
          },
        },
      ],
      transaction,
    })) as UserCard & { Card: Card };

    if (!userCard) {
      throw ApiError.badRequest(
        `user does not own sufficient quantity (${quantity}) of '${cardName}' cards`,
      );
    }

    // reduce quantity of card owned (or delete if quantity=0)
    userCard.quantity -= quantity;
    if (userCard.quantity === 0) {
      await userCard.destroy({ transaction });
    } else {
      await userCard.save({ transaction });
    }

    // create card listing
    const marketListing = await MarketListing.create(
      {
        user_id: userId,
        card_id: userCard.card_id,
        quantity: quantity,
        price: price,
      },
      { transaction },
    );

    // commit transaction
    await transaction.commit();

    return res.status(200).json(marketListing);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
