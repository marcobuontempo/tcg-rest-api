import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utilities/error.util.js";
import { hashSeed } from "../../utilities/seed.util.js";
import { User } from "../../database/models/user.model.js";

export const requireValidUserSeed = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const seed = req.get("x-user-seed")!;

  const hashedSeed = hashSeed(seed.toUpperCase());

  const user = await User.findOne({ where: { seed_hash: hashedSeed } });

  if (!user) {
    return next(ApiError.forbidden("user seed does not exist"));
  }

  req.user = user;

  return next();
};
