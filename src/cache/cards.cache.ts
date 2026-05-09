import { Card } from "../database/models/card.model.js";
import { formatCardForResponse } from "../utilities/cards.util.js";

export const cards: {
  data: Map<string, Card["dataValues"]>;
  response: Array<
    Omit<Card["dataValues"], "id" | "drop_rate" | "created_at" | "updated_at">
  >;
  cumulativeDropRates: number;
} = {
  data: new Map(),
  response: [],
  cumulativeDropRates: 0,
};

export const populateCardCache = async () => {
  const dbCards = await Card.findAll();

  cards.data.clear();

  cards.response = dbCards
    .sort((a, b) => a.drop_rate - b.drop_rate)
    .map((card) => {
      cards.data.set(card.name, card.dataValues);

      cards.cumulativeDropRates += card.dataValues.drop_rate;

      return formatCardForResponse(card.dataValues);
    });
};
