import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utilities/error.util.js";
import config from "../../config/index.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // handle custom API errors
  if (err instanceof ApiError) {
    if (err.error) {
      console.error("Internal error:", err.error);
    }
    return res.status(err.code).json({
      message: err.message,
    });
  }

  // handle JSON parse errors from express.json()
  if (
    err instanceof SyntaxError &&
    "body" in err &&
    (err as any).status === 400
  ) {
    return res.status(400).json({
      message: "Invalid JSON in request body",
    });
  }

  // log unhandled errors when in deveelopment mode - for debugging
  if (config.server.env === "development") {
    console.error("Unhandled error:", err);
  }

  // fallback for unwanted errors
  return res.status(500).json({
    message: "Internal Server Error",
  });
};
