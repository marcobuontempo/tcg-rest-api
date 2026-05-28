import { ipKeyGenerator, type Options } from "express-rate-limit";
import { ApiError } from "../utilities/error.util.js";
import { server } from "./server.config.js";

const baseLimiter: Partial<Options> = {
  // disable for development environment
  skip: (req, res) => server.env === "development",

  // set headers
  headers: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  // limit based on id (for "logged-in" users), or ip catch-all for rest of users
  keyGenerator: (req) => {
    const id = req.user?.id;
    if (id != null) {
      return `user:${id}`;
    }

    const ip = req.ip ?? req.socket.remoteAddress;

    return `ip:${ipKeyGenerator(ip ?? "unknown")}`;
  },

  handler: (req, res, next) => {
    return next(
      ApiError.tooManyRequests(
        `try again at ${req.rateLimit.resetTime?.toISOString()}`,
      ),
    );
  },
};

export const limiter: Record<
  "global" | "burst" | "admin" | "registration",
  Partial<Options>
> = {
  global: {
    // 10 requests per minute
    ...baseLimiter,
    windowMs: 60 * 1000,
    limit: 10,
  },

  burst: {
    // 1 request per second
    ...baseLimiter,
    windowMs: 1000,
    limit: 1,
  },

  registration: {
    // 1 request per minute
    ...baseLimiter,
    windowMs: 60 * 1000,
    limit: 1,
  },

  admin: {
    // 5 requests per minute
    ...baseLimiter,
    windowMs: 60 * 1000,
    limit: 5,
  },
};
