import { NextFunction, Request, RequestHandler, Response } from "express";
import { UpdateUsernameSchema } from "../../schemas/user.schema.js";
import { TypedRequest } from "../../types/express.js";
import { UserStats } from "../../database/models/userStats.model.js";
import { ApiError } from "../../utilities/error.util.js";
import { cache } from "../../cache/index.js";
import { formatBalanceForResponse } from "../../utilities/balance.util.js";

// GET: /api/user/me
export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // find user's matching stats
  const stats = await UserStats.findOne({
    where: { user_id: req.user.id },
    attributes: ["total_battles", "total_wins", "total_losses"],
  });
  if (!stats) throw ApiError.notFound("could not fetch user's stats");

  // return data
  return res.status(200).json({
    username: req.user.username,
    balance: formatBalanceForResponse(req.user.balance),
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
  // get authenticated user data
  const user = req.user;

  // refetch verified seed from the headers - ensure it is not being set as the usrename
  const seed = req.get("x-user-seed");
  if (!seed || req.body.username.toUpperCase().includes(seed.toUpperCase()))
    throw ApiError.badRequest("'username' cannot contain user seed");

  // update username in database
  await user.update({ username: req.body.username });

  // return data
  return res.status(200).json({
    username: user.username,
    balance: formatBalanceForResponse(req.user.balance),
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
  // get authenticated user data
  const user = req.user;

  // delete user from database
  await user.destroy();

  // update the local cache user count
  cache.stats.total_users -= 1;

  // return success response
  res.status(204).send();
}
