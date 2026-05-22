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
  try {
    // get authorization 'Bearer' header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      throw ApiError.unauthorised("missing Bearer token");

    // extract jwt from header
    const token = authHeader.split(" ")[1];

    // verify jwt
    const payload = jwt.verify(
      token,
      config.auth.jwtSecret,
    ) as AdministratorJwtPayload;
    if (!payload.authenticated) throw ApiError.unauthorised();

    // attach jwt data to request object
    req.administrator = payload;

    // continue middleware pipe
    return next();
  } catch {
    // pass error to handler middleware
    return next(ApiError.unauthorised("invalid or expired token"));
  }
};
