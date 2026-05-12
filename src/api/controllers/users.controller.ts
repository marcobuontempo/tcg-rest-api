import { NextFunction, Request, RequestHandler, Response } from "express";
import { UpdateUsernameSchema } from "../../schemas/user.schema.js";
import z from "zod";
import { TypedRequest } from "../../types/express.js";

export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200).json({
    username: req.user.username,
    balance: req.user.balance,
    xp: req.user.xp,
    created_at: req.user.created_at,
  });
};

export const updateUsername = async (
  req: TypedRequest<typeof UpdateUsernameSchema>,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;

  const updatedData = req.body;

  await user.update(updatedData);

  return res.status(200).json({
    username: user.username,
    balance: user.balance,
    xp: user.xp,
    created_at: user.created_at,
  });
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
