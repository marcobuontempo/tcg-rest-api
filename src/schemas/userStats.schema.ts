import z from "zod";
import { UserSchema } from "./user.schema.js";

export type UserStatsAttributes = z.infer<typeof UserStatsSchema>;

export const UserStatsSchema = z.object({
  user_id: UserSchema.shape.id,
  total_battles: z
    .int("'total_battles' must be an integer")
    .nonnegative("'total_battles' must not be negative"),
  total_wins: z
    .int("'total_wins' must be an integer")
    .nonnegative("'total_wins' must not be negative"),
  total_losses: z
    .int("'total_losses' must be an integer")
    .nonnegative("'total_losses' must not be negative"),
  updated_at: z.date("'updated_at' must be a date"),
});
