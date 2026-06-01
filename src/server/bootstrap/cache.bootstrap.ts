import cron from "node-cron";
import { cache } from "../../cache/index.js";
import { Card } from "../../database/models/card.model.js";
import config from "../../config/index.js";
import { User } from "../../database/models/user.model.js";
import { UserStats } from "../../database/models/userStats.model.js";
import { PackName } from "../../cache/packs.cache.js";
import { formatBalanceForResponse } from "../../utilities/balance.util.js";

export const cacheBootstrap = async () => {
  // get all cards from database
  const dbCards = await Card.findAll({ raw: true });

  await populateCardCache(dbCards);
  await populateBattleCache(dbCards);
  await populatePacksCache(dbCards);

  await populateStatsCache();

  await populateLeaderboardCache();
  // warm leaderboard cache 60seconds (at minute start)
  cron.schedule("0 * * * * *", async () => {
    await populateLeaderboardCache();
  });

  console.log("Populated cache...");
};

const populateCardCache = async (dbCards: Card[]) => {
  // reset cache
  cache.cards.data.clear();
  cache.cards.typeAdvantages.clear();

  // populate actual card data
  for (const card of dbCards) {
    const data = card;
    cache.cards.data.set(data.name, data);
  }

  // pre-calculate type advantages
  config.cards.types.forEach((typeA, idxA) => {
    config.cards.types.forEach((typeB, idxB) => {
      const typeNames = `${typeA}:${typeB}`;
      // same type is normal effective
      if (idxA === idxB) {
        cache.cards.typeAdvantages.set(
          typeNames,
          config.cards.typeAdvantageEffects["normal"],
        );
      }

      if (idxB === (idxA + 1) % config.cards.types.length) {
        cache.cards.typeAdvantages.set(
          typeNames,
          config.cards.typeAdvantageEffects["superEffective"],
        );
      }

      if (
        idxB ===
        (idxA - 1 + config.cards.types.length) % config.cards.types.length
      ) {
        cache.cards.typeAdvantages.set(
          typeNames,
          config.cards.typeAdvantageEffects["notEffective"],
        );
      }
    });
  });
};

const populateBattleCache = async (dbCards: Card[]) => {
  // clear cache
  cache.battle.active.clear();
  cache.battle.difficultyPools.clear();

  // populate difficulty pools (moving window oof pooled cards, based on card strength. 1=weakest, 10=strongest)
  dbCards.sort((a, b) => a.attack + a.defence - b.attack + b.defence); // sort by power (att+def)
  const maxStart = Math.max(
    dbCards.length - config.battle.difficultyPoolSize,
    0,
  ); // use rolling-window to select n pools of size m
  for (let i = 1; i <= config.battle.difficultyPoolCount; i++) {
    const start = Math.floor(
      (i / (config.battle.difficultyPoolCount - 1)) * maxStart,
    );

    const pool = dbCards.slice(start, start + config.battle.difficultyPoolSize);

    cache.battle.difficultyPools.set(i, pool);
  }
};

const populateLeaderboardCache = async () => {
  // ensure clear cache
  cache.leaderboard.users.splice(0, cache.leaderboard.users.length);

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
    cache.leaderboard.users.push({
      rank: idx + 1,
      username: user.username,
      xp: user.xp,
      total_battles: user.UserStat.total_battles,
      total_wins: user.UserStat.total_wins,
      total_losses: user.UserStat.total_losses,
    }),
  );

  // update fetch timestamp
  cache.leaderboard.updated = new Date().toISOString();
};

const populatePacksCache = async (dbCards: Card[]) => {
  // sort by drop rate
  dbCards.sort((a, b) => a.drop_rate - b.drop_rate);

  let packsProcessed = 0;
  for (const [name, contents] of Object.entries(config.packs.types)) {
    for (const rarity of contents) {
      const filteredCards = dbCards.filter((card) => card.rarity === rarity);

      const cumulativeDropRate = filteredCards.reduce(
        (prev, curr) => prev + curr.drop_rate,
        0,
      );

      const scaledPrice = Math.round(
        config.packs.minPrice +
          (config.packs.maxPrice - config.packs.minPrice) *
            Math.pow(
              Math.min(
                1,
                Math.max(
                  0,
                  packsProcessed / (Object.keys(config.packs.types).length - 1),
                ),
              ),
              2.3,
            ),
      );
      cache.packs.data.set(name.toLowerCase() as PackName, {
        cards: filteredCards,
        cumulativeDropRate: cumulativeDropRate,
        cost: Math.round(scaledPrice / 500) * 500, // calculation to scale the cost according to popularity
      });
    }
    packsProcessed += 1;
  }

  for (const [name, data] of cache.packs.data) {
    cache.packs.information.push({
      name: name,
      contents: config.packs.types[name],
      cost: formatBalanceForResponse(data.cost),
    });
  }
};

const populateStatsCache = async () => {
  // ensure clear cache
  Object.assign(cache.stats, {
    total_users: 0,
    total_battles: 0,
    total_wins: 0,
    total_losses: 0,
    updated_at: null,
  });

  // populate values:

  // get total users
  cache.stats.total_users = (await User.count()) ?? 0;

  // get battle stats
  cache.stats.total_battles = (await UserStats.sum("total_battles")) ?? 0;
  cache.stats.total_wins = (await UserStats.sum("total_wins")) ?? 0;
  cache.stats.total_losses = (await UserStats.sum("total_losses")) ?? 0;

  // current fetch datetime
  cache.stats.updated_at = new Date();
};
