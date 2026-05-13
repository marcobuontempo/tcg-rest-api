import { NextFunction, Request, Response } from "express";
import { GetAllCardsSchema } from "../../schemas/card.schema.js";
import { TypedRequest } from "../../types/express.js";
import { Op } from "sequelize";
import { Card } from "../../database/models/card.model.js";

// GET: /api/cards
export const getAllCardsData = async (
  req: TypedRequest<typeof GetAllCardsSchema>,
  res: Response,
  next: NextFunction,
) => {
  const {
    name,
    type,
    rarity,
    min_attack,
    max_attack,
    min_defense,
    max_defense,
    sort_by, // defined by schema
  } = req.query;

  // build query statement
  const searchQuery: any = {};

  if (name) searchQuery.name = name;
  if (type) searchQuery.type = type;
  if (rarity) searchQuery.rarity = rarity;

  if (min_attack || max_attack) {
    searchQuery.attack = {};
    if (min_attack) searchQuery.attack[Op.gte] = Number(min_attack);
    if (max_attack) searchQuery.attack[Op.lte] = Number(max_attack);
  }

  if (min_defense || max_defense) {
    searchQuery.defense = {};
    if (min_defense) searchQuery.defense[Op.gte] = Number(min_defense);
    if (max_defense) searchQuery.defense[Op.lte] = Number(max_defense);
  }

  const cards = await Card.findAll({
    where: searchQuery,
    attributes: {
      exclude: ["id", "created_at", "updated_at"],
    },
    order: sort_by && [[sort_by, "ASC"]],
  });

  return res.status(200).json(cards);
};
