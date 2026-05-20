import config from "../../config/index.js";
import { Request, Response, NextFunction } from "express";
import { generateSeed, hashSeed } from "../../utilities/seed.util.js";
import { User } from "../../database/models/user.model.js";
import { cache } from "../../cache/index.js";

// POST: /api/register
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const seed = generateSeed(config.game.userSeedLength);

  const seedHash = hashSeed(seed);

  await User.create({ seed_hash: seedHash });

  cache.stats.total_users += 1;

  return res.status(201).json({
    seed: seed,
    message: "User registered",
  });
};
