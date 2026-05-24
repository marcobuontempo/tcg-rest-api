export const game = {
  userSeedLength: 16, // string length of the user seeds
  maxBattleTurns: 25, // number of turns (plys) to simulate in a battle
  leaderboardLimit: 10, // show top 10 users
  seedExpiryTime: 1000 * 60 * 60 * 24 * 90, // [ms] 90 days until an account is considered expired
};
