import { NextFunction, Request, Response } from "express";
import { cache } from "../../cache/index.js";

// GET: /api/server/leaderboard
export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // return data (stored in cache)
  return res.status(200).json({
    leaderboard: cache.leaderboard.users,
    last_fetched: cache.leaderboard.updated,
  });
};

// GET: /api/server/leaderboard
export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // return data (stored in cache)
  return res.status(200).json(cache.stats);
};
