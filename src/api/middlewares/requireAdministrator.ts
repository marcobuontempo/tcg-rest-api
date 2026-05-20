import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config/index.js";
import { ApiError } from "../../utilities/error.util.js";
import { NextFunction, Request, Response } from "express";
import { AdministratorJwtPayload } from "../../types/jwt.js";

export const requireAdministrator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(ApiError.unauthorised("missing Bearer token"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(
      token,
      config.auth.jwtSecret,
    ) as AdministratorJwtPayload;

    if (!payload.authenticated) {
      throw ApiError.unauthorised();
    }

    req.administrator = payload;

    next();
  } catch {
    return next(ApiError.unauthorised("invalid or expired token"));
  }
};
