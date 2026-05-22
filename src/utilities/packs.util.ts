import { randomInt } from "crypto";
import { Card } from "../database/models/card.model.js";
import { formatCardForResponse } from "./cards.util.js";

export const selectRandomCardsFromPack = (
  cards: Card[],
  cumulativeDropRates: number,
  count: number = 5,
) => {
  const selectedCards = [];
  const formattedCards = [];
  const cardCounts = new Map<number, number>();
  for (let i = 0; i < count; i++) {
    let rand = randomInt(0, cumulativeDropRates + 1);
    for (const card of cards) {
      if (card.drop_rate >= rand) {
        selectedCards.push(card);
        formattedCards.push(formatCardForResponse(card));
        cardCounts.set(card.id, (cardCounts.get(card.id) || 0) + 1);
        break;
      }
      rand -= card.drop_rate;
    }
  }
  return {
    cards: selectedCards,
    formatted: formattedCards,
    counts: cardCounts,
  };
};
