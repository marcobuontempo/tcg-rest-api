import config from "../config/index.js";
import { Card } from "../database/models/card.model.js";

type PackName = keyof typeof config.packs.types;
type PackContents = (typeof config.packs.types)[PackName];

type PackData = {
  cards: Card[];
  cumulitiveDropRate: number;
  cost: number;
};

type PacksInformation = {
  name: PackName;
  contents: PackContents;
  cost: PackData["cost"];
};

export const packs = {
  data: new Map<PackName, PackData>(),
  information: new Array<PacksInformation>(),
};

export const populatePacksCache = async (dbCards: Card[]) => {
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
      packs.data.set(name as PackName, {
        cards: filteredCards,
        cumulitiveDropRate: cumulativeDropRate,
        cost: Math.round(scaledPrice / 500) * 500,
      });
    }
    packsProcessed += 1;
  }

  for (const [name, data] of packs.data) {
    packs.information.push({
      name: name,
      contents: config.packs.types[name],
      cost: Math.round(data.cost / 100),
    });
  }
};
