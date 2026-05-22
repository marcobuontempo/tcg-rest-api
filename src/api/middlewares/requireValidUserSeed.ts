import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utilities/error.util.js";
import { hashSeed } from "../../utilities/seed.util.js";
import { User } from "../../database/models/user.model.js";
import { TypedRequest } from "../../types/express.js";
import { UserSeedHeadersSchema } from "../../schemas/user.schema.js";

export const requireValidUserSeed = async (
  req: TypedRequest<typeof UserSeedHeadersSchema>,
  res: Response,
  next: NextFunction,
) => {
  const seed = req.get("x-user-seed")!;

  const normalisedSeed = seed.trim().toUpperCase();
  const hashedSeed = hashSeed(normalisedSeed);

  const user = await User.findOne({ where: { seed_hash: hashedSeed } });

  if (!user) {
    return next(ApiError.forbidden("user seed does not exist"));
  }

  req.user = user;

  return next();
};
