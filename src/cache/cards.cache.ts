import { Card } from "../database/models/card.model.js";

export const cards: {
  data: Map<string, Omit<Card["dataValues"], "created_at" | "updated_at">>;
  response: Array<
    Omit<Card["dataValues"], "id" | "drop_rate" | "created_at" | "updated_at">
  >;
} = {
  data: new Map(),
  response: [],
};

export const populateCardCache = async () => {
  const dbCards = await Card.findAll();

  // Clear old cache
  cards.data.clear();
  cards.response = dbCards.map((card) => {
    const { id, drop_rate, created_at, updated_at, ...cardData } =
      card.dataValues;

    cards.data.set(card.name, card.dataValues);

    return { ...cardData };
  });
};
