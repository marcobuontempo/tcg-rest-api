import z from "zod";

export const BattleSchema = z.object({
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
    },
    "invalid request body fields",
  ),
});
