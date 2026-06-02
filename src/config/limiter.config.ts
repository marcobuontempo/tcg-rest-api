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
  | "globalGET"
  | "burstGET"
  | "globalOTHER"
  | "burstOTHER"
  | "admin"
  | "registration",
  Partial<Options>
> = {
  globalGET: {
    // 30 requests per minute (GET HTTP only)
    ...baseLimiter,
    windowMs: 60 * 1000,
    limit: 30,
    skip: (req) => req.method !== "GET",
  },

  burstGET: {
    // 3 requests per second (GET HTTP only)
    ...baseLimiter,
    windowMs: 1000,
    limit: 3,
    skip: (req) => req.method !== "GET",
  },

  globalOTHER: {
    // 10 requests per minute (HTTP Other)
    ...baseLimiter,
    windowMs: 60 * 1000,
    limit: 10,
    skip: (req) => req.method === "GET",
  },

  burstOTHER: {
    // 1 request per second (HTTP Other)
    ...baseLimiter,
    windowMs: 1000,
    limit: 1,
    skip: (req) => req.method === "GET",
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
