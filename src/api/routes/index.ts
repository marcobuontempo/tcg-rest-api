import express from "express";
import packagejson from "../../../package.json" with { type: "json" };
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import registerRoutes from "./register.route.js";
import userRoutes from "./user.route.js";

const router = express.Router();

router.get("/", (req, res, next) =>
  res.send({
    name: packagejson.name,
    description: packagejson.description,
    author: packagejson.author,
    version: packagejson.version,
  }),
);

router.use("/register", registerRoutes);

router.use("/users", authenticateUser, userRoutes);

export default router;
