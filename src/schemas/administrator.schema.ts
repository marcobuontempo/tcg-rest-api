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

export const LoginAdministratorSchema = z.object(
  {
    body: z.strictObject(
      {
        username: AdministratorSchema.shape.username,
        password: z.string("'password' must be a string"),
      },
      "invalid request body fields",
    ),
  },
  "invalid request fields",
);

export const UpdateAdministratorPasswordSchema = z.object(
  {
    body: z.strictObject(
      {
        current_password: z.string("'current_password' must be a string"),
        new_password: z.string("'new_password' must be a string"),
      },
      "invalid request body fields",
    ),
  },
  "invalid request fields",
);

export const DeleteUserAsAdministratorSchema = z.object(
  {
    params: z.strictObject(
      {
        user_id: z.uuid("'id' must be a uuid"),
      },
      "invalid request params fields",
    ),
  },
  "invalid request fields",
);
