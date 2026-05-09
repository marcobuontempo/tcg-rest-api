import express from "express";
import packagejson from "../../../package.json" with { type: "json" };
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import registerRoute from "./register.route.js";
import usersRoute from "./users.route.js";
import cardsRoute from "./cards.route.js";
import packsRoute from "./packs.route.js";

const router = express.Router();

router.get("/", (req, res, next) =>
  res.send({
    name: packagejson.name,
    description: packagejson.description,
    author: packagejson.author,
    version: packagejson.version,
  }),
);

router.use("/register", registerRoute);

router.use("/users", authenticateUser, usersRoute);

router.use("/cards", authenticateUser, cardsRoute);

router.use("/packs", authenticateUser, packsRoute);

export default router;
