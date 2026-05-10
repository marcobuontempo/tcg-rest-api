import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { ApiError } from "../../utilities/error.util.js";

export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req);

    if (!result.success) {
      return next(
        ApiError.badRequest(
          result.error.issues.map((issue) => issue.message).join("; "),
        ),
      );
    }

    return next();
  };
