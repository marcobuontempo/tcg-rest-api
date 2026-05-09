import { NextFunction, Request, Response } from "express";
import { cache } from "../../cache/index.js";

export const getAllCardsData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200).json(cache.cards.response);
};
