import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utilities/error.util.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Handle custom API errors
  if (err instanceof ApiError) {
    if (err.error) {
      console.error("Internal error:", err.error);
    }
    return res.status(err.code).json({
      message: err.message,
    });
  }

  // Handle JSON parse errors from express.json()
  if (
    err instanceof SyntaxError &&
    "body" in err &&
    (err as any).status === 400
  ) {
    return res.status(400).json({
      message: "Invalid JSON in request body",
    });
  }

  // Fallback for unwanted errors
  // console.error("Unhandled error:", err);
  return res.status(500).json({
    message: "Internal Server Error",
  });
};
