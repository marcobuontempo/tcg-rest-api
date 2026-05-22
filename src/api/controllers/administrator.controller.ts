import { NextFunction, Response } from "express";
import {
  DeleteUserAsAdministratorSchema,
  LoginAdministratorSchema,
  UpdateAdministratorPasswordSchema,
} from "../../schemas/administrator.schema.js";
import { TypedRequest } from "../../types/express.js";
import { comparePasswords, hashPassword } from "../../utilities/auth.util.js";
import { Administrator } from "../../database/models/administrator.model.js";
import { ApiError } from "../../utilities/error.util.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import { User } from "../../database/models/user.model.js";
import { cache } from "../../cache/index.js";

// POST: /api/admin/login
export const loginAdministrator = async (
  req: TypedRequest<typeof LoginAdministratorSchema>,
  res: Response,
  next: NextFunction,
) => {
  // find matching admin account
  const admin = await Administrator.findOne({
    where: { username: req.body.username },
  });
  if (!admin) throw ApiError.forbidden("username/password is incorrect");

  // ensure login credentials match
  const passwordsMatch = await comparePasswords(
    req.body.password,
    admin.password_hash,
  );
  if (!passwordsMatch)
    throw ApiError.forbidden("username/password is incorrect");

  // generate JWT
  const token = jwt.sign(
    {
      username: admin.username,
      authenticated: true,
    },
    config.auth.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: "10m",
    },
  );

  // return token
  return res.status(200).json({ token });
};

// PUT: /api/admin/password
export const updateAdminPassword = async (
  req: TypedRequest<typeof UpdateAdministratorPasswordSchema>,
  res: Response,
  next: NextFunction,
) => {
  // find matching admin account
  const admin = await Administrator.findOne({
    where: { username: req.administrator.username },
  });

  // if admin does't exist (uncommon - but may have been deleted between auth operations while jwt still valid)
  if (!admin) throw ApiError.forbidden("admin account does not exist");

  // ensure current password matches
  const passwordsMatch = await comparePasswords(
    req.body.current_password,
    admin.password_hash,
  );
  if (!passwordsMatch)
    throw ApiError.forbidden("current password is incorrect");

  // hash new password for database storage
  const newPasswordHash = await hashPassword(req.body.new_password);

  // update admin credentials in database
  await admin.update({
    password_hash: newPasswordHash,
  });

  // return success message
  return res.status(200).json({ message: "password updated" });
};

// DELETE: /api/admin/users/:user_id
export const deleteUserAsAdmin = async (
  req: TypedRequest<typeof DeleteUserAsAdministratorSchema>,
  res: Response,
  next: NextFunction,
) => {
  // find user to destroy
  await User.destroy({
    where: {
      id: req.params.user_id,
    },
  });

  // reduce the local cache user count
  cache.stats.total_users -= 1;

  // return success code
  res.status(204).send();
};
