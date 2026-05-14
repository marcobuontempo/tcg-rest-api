import config from "../config/index.js";
import { Card } from "../database/models/card.model.js";
import { User } from "../database/models/user.model.js";

export const battle = {
  active: new Set<User["id"]>(),
  difficultyPools: new Map<number, Card["dataValues"][]>(),
};

export const populateBattleCache = async (dbCards: Card[]) => {
  // clear cache
  battle.active.clear();
  battle.difficultyPools.clear();

  // populate difficulty pools (moving window oof pooled cards, based on card strength. 1=weakest, 10=strongest)
  dbCards.sort((a, b) => a.attack + a.defense - b.attack + b.defense); // sort by power (att+def)
  const maxStart = Math.max(
    dbCards.length - config.battle.difficultyPoolSize,
    0,
  ); // use rolling-window to select n pools of size m
  for (let i = 1; i <= config.battle.difficultyPoolCount; i++) {
    const start = Math.floor(
      (i / (config.battle.difficultyPoolCount - 1)) * maxStart,
    );

    const pool = dbCards.slice(start, start + config.battle.difficultyPoolSize);

    battle.difficultyPools.set(i, pool);
  }
};
