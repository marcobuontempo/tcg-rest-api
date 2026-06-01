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
import { User } from "../../database/models/user.model.js";
import { cache } from "../../cache/index.js";
import { formatBalanceForResponse } from "../../utilities/balance.util.js";

// POST: /api/market
export const createMarketListing = async (
  req: TypedRequest<typeof CreateMarketListingSchema>,
  res: Response,
  next: NextFunction,
) => {
  // get new market listing data
  const { name: cardName, quantity, price_per_card } = req.body;

  // get card data from cache
  const card = cache.cards.data.get(cardName);
  if (!card) throw ApiError.badRequest(`'${cardName}' card does not exist`);

  // start transaction
  const transaction = await database.transaction();

  try {
    // quick check to fail fast
    const userCard = await UserCard.findOne({
      where: {
        user_id: req.user.id,
        card_id: card.id,
        quantity: {
          [Op.gte]: quantity,
        },
      },
      transaction,
    });
    if (!userCard)
      throw ApiError.badRequest(
        `user does not own sufficient quantity (${quantity}) of '${cardName}' cards`,
      );

    // reduce quantity of card
    const [updated] = await UserCard.update(
      {
        quantity: literal(`quantity - ${quantity}`),
      },
      {
        where: {
          user_id: req.user.id,
          card_id: card.id,
          quantity: { [Op.gte]: quantity },
        },
        transaction,
      },
    );
    if (updated === 0)
      throw ApiError.badRequest(
        `user does not own sufficient quantity (${quantity}) of '${cardName}' cards`,
      );

    // create card listing
    const marketListing = await MarketListing.create(
      {
        user_id: req.user.id,
        card_id: card.id,
        quantity: quantity,
        price_per_card: price_per_card,
      },
      { transaction },
    );

    // commit transaction
    await transaction.commit();

    return res.status(200).json({ listing_id: marketListing.id });
  } catch (err) {
    // rollback on failure
    await transaction.rollback();
    return next(err);
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
      [col("Card.defence"), "defence"],
      "quantity",
      "price_per_card",
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
    min_price_per_card,
    max_price_per_card,
    sort_by, // defined by schema
  } = req.query;

  // build query statement
  const searchQuery: any = {};

  if (name) searchQuery.name = name;
  if (type) searchQuery.type = type;
  if (rarity) searchQuery.rarity = rarity;

  if (min_price_per_card || max_price_per_card) {
    searchQuery.price_per_card = {};
    if (min_price_per_card)
      searchQuery.price_per_card[Op.gte] = Number(min_price_per_card);
    if (max_price_per_card)
      searchQuery.price_per_card[Op.lte] = Number(max_price_per_card);
  }

  // default to sorting by price (and transform "newest" to actual column name: "created_at")
  let sortBy: string = sort_by || "price_per_card";
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
      [col("Card.defence"), "defence"],
      "quantity",
      [literal("price_per_card / 100.0"), "price_per_card"],
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

// GET: /api/market/:listing_id
export const getMarketListingById = async (
  req: TypedRequest<typeof GetMarketListingByIdSchema>,
  res: Response,
  next: NextFunction,
) => {
  const marketListing = await MarketListing.findOne({
    where: {
      id: req.params.listing_id,
    },
    attributes: [
      [col("MarketListing.id"), "listing_id"],
      [col("Card.name"), "name"],
      [col("Card.type"), "type"],
      [col("Card.rarity"), "rarity"],
      [col("Card.attack"), "attack"],
      [col("Card.defence"), "defence"],
      "quantity",
      [literal("price_per_card / 100.0"), "price_per_card"],
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
    // find the market listing
    const marketListing = await MarketListing.findOne({
      where: {
        id: req.params.listing_id,
      },
      transaction,
    });

    if (!marketListing) {
      throw ApiError.notFound(
        `market listing does not exist (id:${req.params.listing_id})`,
      );
    }

    if (marketListing.user_id !== req.user.id) {
      throw ApiError.forbidden(
        `market listing (id:${req.params.listing_id}) is not owned by the requested user`,
      );
    }

    // create/update UserCard entry with the card quantity in the existing market listing
    await UserCard.sequelize?.query(
      `INSERT INTO user_cards (user_id, card_id, quantity)
       VALUES (:user_id, :card_id, :quantity)
       ON CONFLICT (user_id, card_id)
       DO UPDATE SET quantity = quantity + :quantity`,
      {
        replacements: {
          user_id: marketListing.user_id,
          card_id: marketListing.card_id,
          quantity: marketListing.quantity,
        },
        transaction,
      },
    );

    // delete the market listing
    await marketListing.destroy({ transaction });

    // commit transaction
    await transaction.commit();

    return res.status(204).send();
  } catch (err) {
    // rollback if error
    await transaction.rollback();
    return next(err);
  }
};

// POST: /api/market/:listing_id/buy
export const buyMarketListing = async (
  req: TypedRequest<typeof BuyMarketListingSchema>,
  res: Response,
  next: NextFunction,
) => {
  const { quantity } = req.body;

  const transaction = await database.transaction();

  try {
    // get market listing to buy
    const marketListing = (await MarketListing.findOne({
      where: {
        id: req.params.listing_id,
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
        `market listing (id:${req.params.listing_id}) does not exist or is unavailable`,
      );
    }

    if (marketListing.quantity < quantity) {
      throw ApiError.badRequest(
        `market listing does not have sufficient quantity available (has: ${marketListing.quantity}, requested: ${quantity})`,
      );
    }

    if (marketListing.user_id === req.user.id) {
      throw ApiError.badRequest(
        "user cannot purchase their own market listing",
      );
    }

    const payment = marketListing.price_per_card * quantity;
    if (payment > req.user.balance) {
      throw ApiError.badRequest(
        `'user' does not have sufficient funds for the total payment amount (has: ${formatBalanceForResponse(req.user.balance)}, required: ${formatBalanceForResponse(payment)})`,
      );
    }

    // update the buyer's user card quantity, or create an entry if they don't own the card yet
    await UserCard.sequelize?.query(
      `INSERT INTO user_cards (user_id, card_id, quantity, created_at, updated_at)
       VALUES (:user_id, :card_id, :quantity, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, card_id)
       DO UPDATE SET 
          quantity = quantity + :quantity,
          updated_at = CURRENT_TIMESTAMP`,
      {
        replacements: {
          user_id: req.user.id,
          card_id: marketListing.card_id,
          quantity: quantity,
        },
        transaction,
      },
    );

    // reduce quantity of seller's listing
    await marketListing.decrement({ quantity: quantity }, { transaction });

    // decrease buyer's balance
    await User.decrement(
      { balance: payment },
      { where: { id: req.user.id }, transaction },
    );
    // increase seller's balance
    await User.increment(
      { balance: payment },
      { where: { id: marketListing.user_id }, transaction },
    );

    // commit transaction
    await transaction.commit();

    return res.status(200).json({
      name: marketListing.Card.name,
      quantity: quantity,
    });
  } catch (err) {
    // rollback on error
    await transaction.rollback();
    return next(err);
  }
};
