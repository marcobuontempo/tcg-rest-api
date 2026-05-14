import z from "zod";
import config from "../config/index.js";

export const BattleSchema = z.object(
  {
    body: z.strictObject(
      {
        cards: z
          .array(
            z
              .string("'cards' entries must be strings")
              .transform((value) => value.toLowerCase()),
            "'cards' must be an array of strings",
          )
          .length(5, "'cards' must be of length 5"),
        difficulty: z.coerce
          .number("'difficulty' must not be missing")
          .int("'difficulty' must be an integer")
          .min(1, `'difficulty' must be between 1-${config.cards.poolcount}`)
          .max(
            config.cards.poolcount,
            `'difficulty' must be between 1-${config.cards.poolcount}`,
          ),
      },
      "invalid request body fields",
    ),
  },
  "invalid request fields",
);
