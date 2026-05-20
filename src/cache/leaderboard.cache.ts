import config from "../config/index.js";
import { User } from "../database/models/user.model.js";
import { UserStats } from "../database/models/userStats.model.js";

type LeaderboardEntry = {
  rank: number;
  username: string;
  xp: number;
  total_battles: number;
  total_wins: number;
  total_losses: number;
};

export const leaderboard = {
  users: [] as LeaderboardEntry[],
  updated: null as string | null,
};

export const populateLeaderboardCache = async () => {
  // ensure clear cache
  leaderboard.users.splice(0, leaderboard.users.length);

  // get top users by xp
  const topUsers = (await User.findAll({
    order: [["xp", "DESC"]],
    limit: config.game.leaderboardLimit,
    include: {
      model: UserStats,
    },
  })) as (User & { UserStat: UserStats })[];

  // update new leaderboard
  topUsers.forEach((user, idx) =>
    leaderboard.users.push({
      rank: idx + 1,
      username: user.username,
      xp: user.xp,
      total_battles: user.UserStat.total_battles,
      total_wins: user.UserStat.total_wins,
      total_losses: user.UserStat.total_losses,
    }),
  );

  // update fetch timestamp
  leaderboard.updated = new Date().toISOString();
};
