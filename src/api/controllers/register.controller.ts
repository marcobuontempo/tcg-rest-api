import config from "../../config/index.js";
import { Request, Response, NextFunction } from "express";
import { generateSeed, hashSeed } from "../../utilities/seed.util.js";
import { User } from "../../database/models/user.model.js";

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const seed = generateSeed(config.game.userSeedLength);

  const seedHash = hashSeed(seed);

  await User.create({ seed_hash: seedHash });

  return res.status(201).json({
    seed: seed,
    message: "User registered",
  });
}
