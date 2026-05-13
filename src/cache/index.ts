import { battle } from "./battle.cache.js";
import { cards, populateCardCache } from "./cards.cache.js";

export const cache = {
  battle,
  cards,
};

export const cacheStart = async () => {
  await populateCardCache();

  console.log("Populated cache");
};
