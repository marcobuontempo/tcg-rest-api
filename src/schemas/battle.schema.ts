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
          .length(
            config.battle.cardCount,
            `'cards' must be of length ${config.battle.cardCount}`,
          ),
        difficulty: z.coerce
          .number("'difficulty' must not be missing")
          .int("'difficulty' must be an integer")
          .min(
            1,
            `'difficulty' must be between 1-${config.battle.difficultyPoolCount}`,
          )
          .max(
            config.battle.difficultyPoolCount,
            `'difficulty' must be between 1-${config.battle.difficultyPoolCount}`,
          ),
      },
      "invalid request body fields",
    ),
  },
  "invalid request fields",
);
