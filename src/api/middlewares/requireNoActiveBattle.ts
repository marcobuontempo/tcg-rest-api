import { NextFunction, Request, Response } from "express";
import { cache } from "../../cache/index.js";
import { ApiError } from "../../utilities/error.util.js";

export const requireNoActiveBattle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (cache.battle.has(req.user.id)) {
    return next(
      ApiError.conflict(
        "user is currently in an active battle; try again shortly",
      ),
    );
  }

  return next();
};
