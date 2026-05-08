import { cards, populateCardCache } from "./cards.cache.js";

export const cache = {
  cards,
};

export const cacheStart = async () => {
  await populateCardCache();
};
