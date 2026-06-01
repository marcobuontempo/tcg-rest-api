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
    min_defence,
    max_defence,
    sort_by, // defined by schema
  } = req.query;

  // build query statement based on passed filters
  const searchQuery: any = {};

  if (name) searchQuery.name = name;

  if (type) searchQuery.type = type;

  if (rarity) searchQuery.rarity = rarity;

  if (min_attack || max_attack) {
    searchQuery.attack = {};
    if (min_attack) searchQuery.attack[Op.gte] = Number(min_attack);
    if (max_attack) searchQuery.attack[Op.lte] = Number(max_attack);
  }

  if (min_defence || max_defence) {
    searchQuery.defence = {};
    if (min_defence) searchQuery.defence[Op.gte] = Number(min_defence);
    if (max_defence) searchQuery.defence[Op.lte] = Number(max_defence);
  }

  // find cards matching query
  const cards = await Card.findAll({
    where: searchQuery,
    attributes: ["name", "type", "rarity", "attack", "defence"],
    order: sort_by && [[sort_by, "ASC"]],
  });

  return res.status(200).json(cards);
};
