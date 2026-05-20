import z from "zod";
import config from "../config/index.js";

export type AdministratorAttributes = z.infer<typeof AdministratorSchema>;

export const AdministratorSchema = z.object({
  username: z
    .string("'username' must be a string")
    .min(3, "'username' length must be 3-32 characters")
    .max(32, "'username' length must be 3-32 characters"),
  password_hash: z.string("'password_hash' must be a string"),
});
