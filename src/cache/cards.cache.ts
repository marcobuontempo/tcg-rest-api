import { Card } from "../database/models/card.model.js";

export const cards = {
  data: new Map<string, Card>(),
  typeAdvantages: new Map<string, number>(),
};
