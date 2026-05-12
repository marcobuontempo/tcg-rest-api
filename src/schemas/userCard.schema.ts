import z from "zod";
import { UserSchema } from "./user.schema.js";
import { CardSchema } from "./card.schema.js";

export type UserCardAttributes = z.infer<typeof UserCardSchema>;

export const UserCardSchema = z.object({
  user_id: UserSchema.shape.id,
  card_id: CardSchema.shape.id,
  quantity: z
    .int("'quantity' must be an integer")
    .nonnegative("'quantity' must not be negative"),
  created_at: z.date("'created_at' must be a date"),
  updated_at: z.date("'updated_at' must be a date"),
});
