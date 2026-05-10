import z from "zod";

export const battleSchema = z.object({
  body: z.strictObject(
    {
      cards: z
        .array(
          z.string("'cards' must be an array of string literals"),
          "'cards' must be an array of string literals",
        )
        .length(5, "'cards' must be of length 5"),
    },
    "invalid request body fields",
  ),
});
