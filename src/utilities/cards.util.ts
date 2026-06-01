import { Card } from "../database/models/card.model.js";

export const formatCardForResponse = (card: Card | Card["dataValues"]) => {
  return {
    name: card.name,
    type: card.type,
    rarity: card.rarity,
    attack: card.attack,
    defence: card.defence,
  };
};
