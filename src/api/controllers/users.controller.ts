import { NextFunction, Request, RequestHandler, Response } from "express";
import { UpdateUsernameSchema } from "../../schemas/user.schema.js";
import z from "zod";
import { TypedRequest } from "../../types/express.js";

// GET: /api/user/me
export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200).json({
    username: req.user.username,
    balance: Math.round(req.user.balance * 100) / 100,
    xp: req.user.xp,
    created_at: req.user.created_at,
  });
};

// PATCH: /api/user/me
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
    balance: Math.round(req.user.balance * 100) / 100,
    xp: user.xp,
    created_at: user.created_at,
  });
};

// DELETE: /api/user/me
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user;

  await user.destroy();

  res.status(204).send();
}
