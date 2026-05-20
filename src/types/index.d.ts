import { Request } from "express-serve-static-core";
import { User } from "../database/models/user.model.js";
import { UserStats } from "../database/models/userStats.model.js";
import { RateLimitInfo } from "express-rate-limit";

// Allows appending "user" to the Request object
declare global {
  namespace Express {
    interface Request {
      user: User;
      rateLimit: RateLimitInfo;
    }
  }
}
