import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utilities/error.util.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    if (err.error) {
      console.error("Internal error:", err.error);
    }
    return res.status(err.code).json({
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    message: "Internal Server Error",
  });
};
