import z from "zod";
import config from "../config/index.js";

export type UserAttributes = z.infer<typeof UserSchema>;

export const UserSchema = z.object({
  id: z.uuid("'id' must be a uuid"),
  seed_hash: z.hash("sha256", { message: "'seed_hash' must be a SHA256 hash" }),
  username: z
    .string("'username' must be a string")
    .min(3, "'username' length must be 3-32 characters")
    .max(32, "'username' length must be 3-32 characters"),
  balance: z
    .int("'balance' must be an integer")
    .nonnegative("'balance' must not be negative"),
  xp: z.int("'xp' must be an integer").nonnegative("'xp' must not be negative"),
  last_daily_pack_at: z.date("'last_daily_pack_at' must be a date").nullable(),
  created_at: z.date("'created_at' must be a date"),
  updated_at: z.date("'updated_at' must be a date"),
});

export const UserSeedHeadersSchema = z.object({
  headers: z.object({
    "x-user-seed": z
      .string("missing 'x-user-seed' from request headers")
      .length(
        config.game.userSeedLength,
        `'x-user-seed' must be of length ${config.game.userSeedLength}`,
      ),
  }),
});

export const UpdateUsernameSchema = z.object({
  body: z.strictObject(
    {
      username: UserSchema.shape.username,
    },
    "invalid request body fields",
  ),
});
