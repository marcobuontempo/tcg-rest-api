import z from "zod";
import { CardSchema } from "./card.schema.js";

export type CardMarketStatsAttributes = z.infer<typeof CardMarketStatsSchema>;

export const CardMarketStatsSchema = z.object({
  card_id: CardSchema.shape.id,
  quantity_existing: z
    .int("'quantity_existing' must be an integer")
    .nonnegative("'quantity_existing' must not be negative"),
  quantity_sold: z
    .int("'quantity_sold' must be an integer")
    .nonnegative("'quantity_sold' must not be negative"),
  average_sold_price: z
    .int("'average_sold_price' must be an integer")
    .nonnegative("'average_sold_price' must not be negative"),
  updated_at: z.date("'updated_at' must be a date"),
});
