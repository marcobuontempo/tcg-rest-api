import { Request } from "express-serve-static-core";
import { User } from "../database/models/user.model.ts";

// Allows appending "user" to the Request object
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
