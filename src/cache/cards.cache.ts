import { Card } from "../database/models/card.model.js";

export const cards: {
  data: Map<string, Card["dataValues"]>;
  cumulativeDropRates: number;
} = {
  data: new Map(),
  cumulativeDropRates: 0,
};

export const populateCardCache = async () => {
  const dbCards = await Card.findAll();

  cards.data.clear();

  dbCards
    .sort((a, b) => a.drop_rate - b.drop_rate)
    .forEach((card) => {
      cards.data.set(card.name, card.dataValues);
      cards.cumulativeDropRates += card.dataValues.drop_rate;
    });
};
