import config from "../config/index.js";
import { Card } from "../database/models/card.model.js";

export const seedDefaultCards = async () => {
  const count = await Card.count();

  if (count === 0) {
    console.log("No cards in database: seeding default cards...");

    await Card.bulkCreate(config.cards.default, { validate: true });

    console.log(
      `Seeded ${config.cards.default.length} default cards into database`,
    );
  }
};
