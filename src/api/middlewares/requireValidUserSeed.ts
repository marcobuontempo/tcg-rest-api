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
  // get user seed from headers
  const seed = req.get("x-user-seed")!;

  // normalise and hash seed for database lookup
  const normalisedSeed = seed.trim().toUpperCase();
  const hashedSeed = hashSeed(normalisedSeed);

  // find user
  const user = await User.findOne({ where: { seed_hash: hashedSeed } });
  if (!user) return next(ApiError.forbidden("user seed does not exist"));

  // attach valid user to request object
  req.user = user;

  // continue middleware pipe
  return next();
};
