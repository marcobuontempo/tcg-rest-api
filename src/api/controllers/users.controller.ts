import { NextFunction, Request, response, Response } from "express";
import { ApiError } from "../../utilities/error.util.js";

export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, balance, xp, created_at } = req.user;

  const data = {
    username,
    balance,
    xp,
    created_at,
  };

  return res.status(200).json(data);
};

export const updateUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;

  const newUsername = req.body?.username;
  if (!newUsername) {
    return next(ApiError.badRequest("'username' field not provided."));
  }

  await user.update({ username: newUsername });

  const { username, balance, xp, created_at } = user;

  const data = {
    username,
    balance,
    xp,
    created_at,
  };

  return res.status(200).json(data);
};

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user;

  await user.destroy();

  res.status(204).send();
}
