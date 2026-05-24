import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utilities/error.util.js";
import { ZodObject, ZodType } from "zod";

type RequestSchema = ZodObject<{
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
  headers?: ZodType;
}>;

export const validateRequest =
  <T extends RequestSchema>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    // zod parse the schema
    const result = schema.safeParse(req);

    // if parse fails, pass error to handler middleware
    if (!result.success) {
      return next(
        ApiError.badRequest(
          result.error.issues.map((issue) => issue.message).join("; "),
        ),
      );
    }

    // if valid, we assign the validated and/or transformed values back to the req object
    if (result.data?.body) {
      Object.assign(req.body, result.data.body);
    }

    if (result.data?.query) {
      Object.assign(req.query, result.data.query);
    }

    if (result.data?.params) {
      Object.assign(req.params, result.data.params);
    }

    if (result.data?.headers) {
      Object.assign(req.headers, result.data.headers);
    }

    // continue middleware pipeline
    return next();
  };
