import config from "../config/index.js";
import { Card } from "../database/models/card.model.js";

export const cards = {
  data: new Map<string, Card>(),
  typeAdvantages: new Map<string, number>(),
};

export const populateCardCache = async (dbCards: Card[]) => {
  // reset cache
  cards.data.clear();
  cards.typeAdvantages.clear();

  // populate actual card data
  for (const card of dbCards) {
    const data = card;
    cards.data.set(data.name, data);
  }

  // pre-calculate type advantages
  config.cards.types.forEach((typeA, idxA) => {
    config.cards.types.forEach((typeB, idxB) => {
      const typeNames = `${typeA}:${typeB}`;
      // same type is normal effective
      if (idxA === idxB) {
        cards.typeAdvantages.set(
          typeNames,
          config.cards.typeAdvantageEffects["normal"],
        );
      }

      if (idxB === (idxA + 1) % config.cards.types.length) {
        cards.typeAdvantages.set(
          typeNames,
          config.cards.typeAdvantageEffects["superEffective"],
        );
      }

      if (
        idxB ===
        (idxA - 1 + config.cards.types.length) % config.cards.types.length
      ) {
        cards.typeAdvantages.set(
          typeNames,
          config.cards.typeAdvantageEffects["notEffective"],
        );
      }
    });
  });
};
