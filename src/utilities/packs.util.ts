import { randomInt } from "crypto";
import { Card } from "../database/models/card.model.js";

export const selectRandomCards = (
  cards: Card[],
  cumulativeDropRates: number,
  count: number = 5,
) => {
  const selectedCards = [];
  for (let i = 0; i < count; i++) {
    let rand = randomInt(0, cumulativeDropRates + 1);
    for (const card of cards) {
      if (card.drop_rate >= rand) {
        selectedCards.push(card);
        break;
      }
      rand -= card.drop_rate;
    }
  }
  return selectedCards;
};
