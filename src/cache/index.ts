import { Card } from "../database/models/card.model.js";
import { battle, populateBattleCache } from "./battle.cache.js";
import { cards, populateCardCache } from "./cards.cache.js";
import { leaderboard, populateLeaderboardCache } from "./leaderboard.cache.js";
import { packs, populatePacksCache } from "./packs.cache.js";
import { populateStatsCache, stats } from "./stats.cache.js";

export const cache = {
  battle,
  cards,
  packs,
  leaderboard,
  stats,
};

export const cacheStart = async () => {
  // get all cards from database
  const dbCards = await Card.findAll({ raw: true });

  await populateCardCache(dbCards);
  await populateBattleCache(dbCards);
  await populatePacksCache(dbCards);

  await populateLeaderboardCache();
  await populateStatsCache();

  console.log("Populated cache");
};
