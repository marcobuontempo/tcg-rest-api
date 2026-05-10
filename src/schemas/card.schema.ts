import z from "zod";
import config from "../config/index.js";

export type CardAttributes = z.infer<typeof CardSchema>;

export const CardSchema = z.object({
  id: z.number().int("'id' must be an integer"),
  name: z
    .string("'name' must be a string")
    .min(1, "'name' length must be 1-32 characters")
    .max(32, "'name' length must be 1-32 characters"),
  type: z.enum(
    config.cards.types,
    `'type' must be one of: ${config.cards.types.join(",")}`,
  ),
  rarity: z.enum(
    config.cards.rarities,
    `'rarity' must be one of: ${config.cards.rarities.join(",")}`,
  ),
  drop_rate: z
    .number()
    .int("'drop_rate' must be an integer")
    .min(1, "'drop_rate' must be between 0-10000")
    .max(10000, "'drop_rate' must be between 0-10000"),
  attack: z
    .number()
    .int("'attack' must be an integer")
    .min(1, "'attack' must be between 0-10000")
    .max(10000, "'attack' must be between 0-10000"),
  defense: z
    .number()
    .int("'defense' must be an integer")
    .min(1, "'defense' must be between 0-10000")
    .max(10000, "'drop_rate' must be between 0-10000"),
  created_at: z.date("'created_at' must be a date"),
  updated_at: z.date("'updated_at' must be a date"),
});
