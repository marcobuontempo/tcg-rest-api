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
  // generate a new user seed
  const seed = generateSeed(config.game.userSeedLength);

  // hash seed for database storage
  const seedHash = hashSeed(seed);

  // naively create user (risk of seed collision is mathematically improbable)
  const newUser = await User.create({
    seed_hash: seedHash,
    balance: config.game.userStartingBalance,
  });

  // update the local cache user count
  cache.stats.total_users += 1;

  // return data
  return res.status(201).json({
    seed: seed,
    username: newUser.username,
    message:
      "User registered - please store the seed safely as it cannot be retrieved later!",
  });
};
