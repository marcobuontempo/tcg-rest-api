import z from "zod";
import { UserSchema } from "./user.schema.js";
import { CardSchema } from "./card.schema.js";

export type MarketListingAttributes = z.infer<typeof MarketListingSchema>;

export const MarketListingSchema = z.object({
  id: z.number().int("'id' must be an integer"),
  user_id: UserSchema.shape.id,
  card_id: CardSchema.shape.id,
  quantity: z
    .int("'quantity' must be an integer")
    .nonnegative("'quantity' must not be negative"),
  price: z
    .int("'price' must be an integer")
    .nonnegative("'price' must not be negative"),
  created_at: z.date("'created_at' must be a date"),
  updated_at: z.date("'updated_at' must be a date"),
});

export const CreateMarketListingSchema = z.object({
  body: z.strictObject(
    {
      name: CardSchema.shape.name,
      quantity: MarketListingSchema.shape.quantity,
      price: z
        .number("'price' must be a number")
        .nonnegative("'price' must not be negative")
        .refine(
          (value) => Number.isInteger(value * 100),
          "'price' must have at most 2 decimal places'",
        )
        .transform((value) => Math.round(value * 100)),
    },
    "invalid request body fields",
  ),
});
