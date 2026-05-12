import { Request } from "express";
import { z, ZodTypeAny } from "zod";

type Extract<T, K extends string> = T extends ZodTypeAny
  ? K extends keyof z.infer<T>
    ? z.infer<T>[K]
    : never
  : never;

// Zod Validate Request Object
export type TypedRequest<T extends ZodTypeAny> = Request<
  Extract<T, "params">,
  any,
  Extract<T, "body">,
  Extract<T, "query">
>;
