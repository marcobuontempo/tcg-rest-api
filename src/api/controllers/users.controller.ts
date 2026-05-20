import { NextFunction, Request, RequestHandler, Response } from "express";
import { UpdateUsernameSchema } from "../../schemas/user.schema.js";
import { TypedRequest } from "../../types/express.js";
import { UserStats } from "../../database/models/userStats.model.js";
import { ApiError } from "../../utilities/error.util.js";
import { cache } from "../../cache/index.js";

// GET: /api/user/me
export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const stats = await UserStats.findOne({
    where: { user_id: req.user.id },
    attributes: ["total_battles", "total_wins", "total_losses"],
  });
  if (!stats) {
    throw ApiError.notFound("error fetching user stats");
  }
  return res.status(200).json({
    username: req.user.username,
    balance: req.user.balance / 100,
    xp: req.user.xp,
    stats: stats,
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
    balance: req.user.balance / 100,
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

  cache.stats.total_users -= 1;

  res.status(204).send();
}
