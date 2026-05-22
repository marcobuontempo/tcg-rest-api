import { NextFunction, Request, Response } from "express";
import { cache } from "../../cache/index.js";
import { ApiError } from "../../utilities/error.util.js";

export const requireNoActiveBattle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // ensure user is not in battle by referencing the local cache
  if (cache.battle.active.has(req.user.id))
    return next(
      ApiError.conflict(
        "user is currently in an active battle; try again shortly",
      ),
    );

  // continue middleware pipe if not in battle
  return next();
};
