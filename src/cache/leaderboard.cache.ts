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
