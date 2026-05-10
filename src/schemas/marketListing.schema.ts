import z from "zod";
import { UserSchema } from "./user.schema.js";
import { CardSchema } from "./card.schema.js";

export type MarketListingAttributes = z.infer<typeof MarketListingSchema>;

export const MarketListingSchema = z.object({
  id: z.number().int("'id' must be an integer"),
  user_id: UserSchema.pick({ id: true }),
  card_id: CardSchema.pick({ id: true }),
  quantity: z
    .number()
    .int("'quantity' must be an integer")
    .nonnegative("'quantity' must not be negative"),
  price: z
    .number()
    .int("'price' must be an integer")
    .nonnegative("'price' must not be negative"),
  created_at: z.date("'created_at' must be a date"),
  updated_at: z.date("'updated_at' must be a date"),
});
