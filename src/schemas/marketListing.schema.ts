import z from "zod";
import { UserSchema } from "./user.schema.js";
import { CardSchema } from "./card.schema.js";

export type MarketListingAttributes = z.infer<typeof MarketListingSchema>;

export const MarketListingSchema = z.object({
  id: z.int("'id' must be an integer"),
  user_id: UserSchema.shape.id,
  card_id: CardSchema.shape.id,
  quantity: z
    .int("'quantity' must be an integer")
    .min(1, "'quantity' must be more than 0"),
  price_per_card: z
    .int("'price' must be an integer")
    .min(1, "'price' must be 1-1,000,000")
    .max(1_000_000, "'price' must be 1-1,000,000"),
  created_at: z.date("'created_at' must be a date"),
  updated_at: z.date("'updated_at' must be a date"),
});

export const CreateMarketListingSchema = z.object(
  {
    body: z.strictObject(
      {
        name: CardSchema.shape.name,
        quantity: MarketListingSchema.shape.quantity,
        price_per_card: z
          .number("'price' must be a number")
          .min(1, "'price' must be 1-1,000,000")
          .max(1_000_000, "'price' must be 1-1,000,000")
          .refine(
            (value) => Number.isInteger(value * 100),
            "'price' must have at most 2 decimal places'",
          )
          .transform((value) => Math.round(value * 100)),
      },
      "invalid request body fields",
    ),
  },
  "invalid request fields",
);

const allowedSortFields = [
  "type",
  "rarity",
  "attack",
  "defense",
  "price",
  "newest",
] as const;
export const GetAllMarketListingsSchema = z.object(
  {
    query: z
      .strictObject(
        {
          name: CardSchema.shape.name,
          type: CardSchema.shape.type,
          rarity: CardSchema.shape.rarity,
          min_price_per_card: z.coerce
            .number("'min_price_per_card' must be a number")
            .nonnegative("'min_price_per_card' must not be negative")
            .refine(
              (value) => Number.isInteger(value * 100),
              "'min_price_per_card' must have at most 2 decimal places'",
            )
            .transform((value) => Math.round(value * 100)),
          max_price_per_card: z.coerce
            .number("'max_price_per_card' must be a number")
            .nonnegative("'max_price_per_card' must not be negative")
            .refine(
              (value) => Number.isInteger(value * 100),
              "'max_price_per_card' must have at most 2 decimal places'",
            )
            .transform((value) => Math.round(value * 100)),
          sort_by: z.enum(
            allowedSortFields,
            `'sort_by' must be one of: ${allowedSortFields.join(", ")}`,
          ),
        },
        "invalid request body fields",
      )
      .partial(),
  },
  "invalid request fields",
);

export const GetMarketListingByIdSchema = z.object(
  {
    params: z.strictObject(
      {
        listing_id: z.coerce
          .number("'listing_id' must be a number")
          .int("'listing_id' must be an integer"),
      },
      "invalid request params fields",
    ),
  },
  "invalid request params fields",
);

export const DeleteMarketListingSchema = z.object(
  {
    params: z.strictObject(
      {
        listing_id: z.coerce
          .number("'listing_id' must be a number")
          .int("'listing_id' must be an integer"),
      },
      "invalid request params fields",
    ),
  },
  "invalid request fields",
);

export const BuyMarketListingSchema = z.object(
  {
    params: z.strictObject(
      {
        listing_id: z.coerce
          .number("'listing_id' must be a number")
          .int("'listing_id' must be an integer"),
      },
      "invalid request params fields",
    ),
    body: z.strictObject(
      {
        quantity: MarketListingSchema.shape.quantity,
      },
      "invalid request body fields",
    ),
  },
  "invalid request fields",
);

export const AutoBuyMarketListingSchema = z.object(
  {
    body: z.strictObject(
      {
        name: CardSchema.shape.name,
        max_price_per_card: z.coerce
          .number("'max_price_per_card' must be a number")
          .nonnegative("'max_price_per_card' must not be negative")
          .refine(
            (value) => Number.isInteger(value * 100),
            "'max_price_per_card' must have at most 2 decimal places'",
          ),
      },
      "invalid request body fields",
    ),
  },
  "invalid request fields",
);
