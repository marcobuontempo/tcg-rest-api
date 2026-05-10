import z from "zod";
import { UserSchema } from "./user.schema.js";

export type UserStatsAttributes = z.infer<typeof UserStatsSchema>;

export const UserStatsSchema = z.object({
  user_id: UserSchema.pick({ id: true }),
  total_battles: z
    .number()
    .int("'total_battles' must be an integer")
    .nonnegative("'total_battles' must not be negative"),
  total_wins: z
    .number()
    .int("'total_wins' must be an integer")
    .nonnegative("'total_wins' must not be negative"),
  total_losses: z
    .number()
    .int("'total_losses' must be an integer")
    .nonnegative("'total_losses' must not be negative"),
  updated_at: z.date("'updated_at' must be a date"),
});
