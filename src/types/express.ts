import { Request } from "express";
import { z, ZodType } from "zod";

type Extract<T, K extends string> = T extends ZodType
  ? K extends keyof z.infer<T>
    ? z.infer<T>[K]
    : never
  : never;

// Zod Validate Request Object
export type TypedRequest<T extends ZodType> = Request<
  Extract<T, "params"> & Request["params"],
  any,
  Extract<T, "body">,
  Extract<T, "query">
>;
