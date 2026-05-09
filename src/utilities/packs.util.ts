import { randomInt } from "crypto";
import { cache } from "../cache/index.js";

export const selectRandomCards = (
  cards: typeof cache.cards.data,
  cumulativeDropRates: number,
  count: number = 5,
) => {
  const cardsPulled = [];
  for (let i = 0; i < count; i++) {
    let rand = randomInt(0, cumulativeDropRates + 1);
    for (const [_key, card] of cards) {
      if (card.drop_rate >= rand) {
        cardsPulled.push(card);
        break;
      }
      rand -= card.drop_rate;
    }
  }
  return cardsPulled;
};
