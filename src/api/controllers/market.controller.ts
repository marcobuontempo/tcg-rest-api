import { NextFunction, Request, Response } from "express";
import {
  BuyMarketListingSchema,
  CreateMarketListingSchema,
  DeleteMarketListingSchema,
  GetAllMarketListingsSchema,
  GetMarketListingByIdSchema,
} from "../../schemas/marketListing.schema.js";
import { UserCard } from "../../database/models/userCard.model.js";
import { Card } from "../../database/models/card.model.js";
import { database } from "../../database/connection.js";
import { col, literal, Op } from "sequelize";
import { ApiError } from "../../utilities/error.util.js";
import { MarketListing } from "../../database/models/marketListing.model.js";
import { TypedRequest } from "../../types/express.js";

// POST: /api/market
export const createMarketListing = async (
  req: TypedRequest<typeof CreateMarketListingSchema>,
  res: Response,
  next: NextFunction,
) => {
  const { name: cardName, quantity, price } = req.body;

  // start transaction
  const transaction = await database.transaction();

  try {
    // find if user owns card with necessary quantity
    const userCard = await UserCard.findOne({
      where: {
        user_id: req.user.id,
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
    });

    if (!userCard) {
      throw ApiError.badRequest(
        `user does not own sufficient quantity (${quantity}) of '${cardName}' cards`,
      );
    }

    // reduce quantity of card owned (or delete if quantity=0)
    if (userCard.quantity === quantity) {
      await userCard.destroy({ transaction });
    } else {
      await userCard.decrement("quantity", {
        by: quantity,
        transaction,
      });
    }

    // create card listing
    const marketListing = await MarketListing.create(
      {
        user_id: req.user.id,
        card_id: userCard.card_id,
        quantity: quantity,
        price: price,
      },
      { transaction },
    );

    // commit transaction
    await transaction.commit();

    return res.status(200).json({
      listing_id: marketListing.id,
    });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// GET: /api/market/me
export const getOwnMarketListings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userListings = await MarketListing.findAll({
    where: {
      user_id: req.user.id,
    },
    attributes: [
      [col("MarketListing.id"), "listing_id"],
      [col("Card.name"), "name"],
      [col("Card.type"), "type"],
      [col("Card.rarity"), "rarity"],
      [col("Card.attack"), "attack"],
      [col("Card.defense"), "defense"],
      "quantity",
      "price",
    ],
    include: [
      {
        model: Card,
        attributes: [],
      },
    ],
    raw: true,
  });

  return res.status(200).json(userListings);
};

// GET: /api/market
export const getAllMarketListings = async (
  req: TypedRequest<typeof GetAllMarketListingsSchema>,
  res: Response,
  next: NextFunction,
) => {
  const {
    name,
    type,
    rarity,
    min_price,
    max_price,
    sort_by, // defined by schema
  } = req.query;

  // build query statement
  const searchQuery: any = {};

  if (name) searchQuery.name = name;
  if (type) searchQuery.type = type;
  if (rarity) searchQuery.rarity = rarity;

  if (min_price || max_price) {
    searchQuery.price = {};
    if (min_price) searchQuery.defense[Op.gte] = Number(min_price);
    if (max_price) searchQuery.defense[Op.lte] = Number(max_price);
  }

  // default to sorting by price (and transform "newest" to correct column)
  let sortBy: string = sort_by || "price";
  let sortOrder = "ASC";
  if (sortBy === "newest") {
    sortBy = "created_at";
    sortOrder = "DESC";
  }

  const marketListings = await MarketListing.findAll({
    where: searchQuery,
    attributes: [
      [col("MarketListing.id"), "listing_id"],
      [col("Card.name"), "name"],
      [col("Card.type"), "type"],
      [col("Card.rarity"), "rarity"],
      [col("Card.attack"), "attack"],
      [col("Card.defense"), "defense"],
      "quantity",
      [literal("price / 100.0"), "price"],
    ],
    include: [
      {
        model: Card,
        attributes: [],
      },
    ],
    order: [[sortBy, sortOrder]],
    limit: 10,
    raw: true,
  });

  return res.status(200).json(marketListings);
};

// GET: /api/market/:id
export const getMarketListingById = async (
  req: TypedRequest<typeof GetMarketListingByIdSchema>,
  res: Response,
  next: NextFunction,
) => {
  const marketListing = await MarketListing.findOne({
    where: {
      id: req.params.id,
    },
    attributes: [
      [col("MarketListing.id"), "listing_id"],
      [col("Card.name"), "name"],
      [col("Card.type"), "type"],
      [col("Card.rarity"), "rarity"],
      [col("Card.attack"), "attack"],
      [col("Card.defense"), "defense"],
      "quantity",
      [literal("price / 100.0"), "price"],
    ],
    include: [
      {
        model: Card,
        attributes: [],
      },
    ],
    raw: true,
  });

  if (!marketListing) {
    return next(
      ApiError.notFound(`market listing does not exist (id:${req.params.id})`),
    );
  }

  return res.status(200).json(marketListing);
};

// DELETE: /api/market/:id
export const deleteMarketListing = async (
  req: TypedRequest<typeof DeleteMarketListingSchema>,
  res: Response,
  next: NextFunction,
) => {
  const transaction = await database.transaction();

  try {
    const marketListing = await MarketListing.findOne({
      where: {
        id: req.params.id,
      },
      transaction,
    });

    if (!marketListing) {
      throw ApiError.notFound(
        `market listing does not exist (id:${req.params.id})`,
      );
    }

    if (marketListing.user_id !== req.user.id) {
      throw ApiError.forbidden(
        `market listing (id:${req.params.id}) is not owned by the requested user`,
      );
    }

    // create/update UserCard entry with quantity that was removed from market listing
    const [userCard, created] = await UserCard.findOrCreate({
      where: {
        user_id: marketListing.user_id,
        card_id: marketListing.card_id,
      },
      defaults: {
        user_id: marketListing.user_id,
        card_id: marketListing.card_id,
        quantity: marketListing.quantity,
      },
      transaction,
    });

    if (!created) {
      await userCard.increment("quantity", {
        by: marketListing.quantity,
        transaction,
      });
    }

    await marketListing.destroy({ transaction });

    await transaction.commit();

    return res.status(204).send();
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
};

// POST: /api/market/:id/buy
export const buyMarketListing = async (
  req: TypedRequest<typeof BuyMarketListingSchema>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const transaction = await database.transaction();

  try {
    // get market listing to buy
    const marketListing = (await MarketListing.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Card,
        },
      ],
      transaction,
    })) as (MarketListing & { Card: Card }) | null;

    if (!marketListing) {
      throw ApiError.notFound(
        `market listing (id:${id}) does not exist or is unavailable`,
      );
    }

    if (marketListing.quantity < quantity) {
      throw ApiError.badRequest(
        `market listing does not have sufficient quantity available (has: ${marketListing.quantity}, requested: ${quantity})`,
      );
    }

    // update the buyer's user card quantity, or create an entry if they don't own the card yet
    const [userCard, created] = await UserCard.findOrCreate({
      where: {
        user_id: req.user.id,
        card_id: marketListing.card_id,
      },
      defaults: {
        user_id: req.user.id,
        card_id: marketListing.card_id,
        quantity,
      },
      transaction,
    });

    if (!created) {
      await userCard.increment("quantity", {
        by: quantity,
        transaction,
      });
    }

    // reduce quantity of seller's listing (or delete if quantity=0)
    if (marketListing.quantity === quantity) {
      await marketListing.destroy({ transaction });
    } else {
      await marketListing.decrement("quantity", {
        by: quantity,
        transaction,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      name: marketListing.Card.name,
      quantity: quantity,
    });
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
};
