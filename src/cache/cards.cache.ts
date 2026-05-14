import config from "../config/index.js";
import { Card } from "../database/models/card.model.js";

export const cards = {
  data: new Map<string, Card["dataValues"]>(),

  cumulativeDropRates: 0,

  pools: new Map<number, Card["dataValues"][]>(),

  typeAdvantages: new Map<string, number>(),
};

export const populateCardCache = async () => {
  // get all cards from database (sorted by drop_rate for future weighted calculations)
  const dbCards = await Card.findAll({
    order: [["drop_rate", "ASC"]],
    raw: true,
  });

  // reset cache
  cards.data.clear();
  cards.cumulativeDropRates = 0;
  cards.pools.clear();

  // populate data
  for (const card of dbCards) {
    const data = card;

    cards.data.set(data.name, data);

    cards.cumulativeDropRates += data.drop_rate;
  }

  // populate pools
  dbCards.sort((a, b) => a.attack + a.defense - b.attack + b.defense); // sort by power (att+def)
  const maxStart = Math.max(dbCards.length - config.cards.poolsize, 0); // use rolling-window to select n pools of size m
  for (let i = 1; i <= config.cards.poolcount; i++) {
    const start = Math.floor((i / (config.cards.poolcount - 1)) * maxStart);

    const pool = dbCards.slice(start, start + config.cards.poolsize);

    cards.pools.set(i, pool);
  }

  // pre-calculate type advantages
  config.cards.types.forEach((typeA, idxA) => {
    config.cards.types.forEach((typeB, idxB) => {
      const typeNames = `${typeA}:${typeB}`;
      // same type is normal effective
      if (idxA === idxB) {
        cards.typeAdvantages.set(typeNames, config.cards.typeAdvantageEffects["normal"]);
      }

      if (idxB === (idxA + 1) % config.cards.types.length) {
        cards.typeAdvantages.set(
          typeNames,
          config.cards.typeAdvantageEffects["superEffective"],
        );
      }

      if (
        idxB ===
        (idxA - 1 + config.cards.types.length) % config.cards.types.length
      ) {
        cards.typeAdvantages.set(
          typeNames,
          config.cards.typeAdvantageEffects["notEffective"],
        );
      }
    });
  });
};
