import { User } from "../database/models/user.model.js";
import { UserStats } from "../database/models/userStats.model.js";

const DEFAULT_STATS = {
  total_users: 0,
  total_battles: 0,
  total_wins: 0,
  total_losses: 0,
  updated_at: null,
};

export const stats = {
  total_users: 0,
  total_battles: 0,
  total_wins: 0,
  total_losses: 0,
  updated_at: null as Date | null,
};

export const populateStatsCache = async () => {
  // ensure clear cache
  Object.assign(stats, DEFAULT_STATS);

  // get total users
  stats.total_users = await User.count();

  // get battle stats
  stats.total_battles = await UserStats.sum("total_battles");
  stats.total_wins = await UserStats.sum("total_wins");
  stats.total_losses = await UserStats.sum("total_losses");

  stats.updated_at = new Date();
};
