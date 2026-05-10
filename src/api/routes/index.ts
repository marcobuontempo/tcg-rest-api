import express from "express";
import packagejson from "../../../package.json" with { type: "json" };
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import registerRoute from "./register.route.js";
import usersRoute from "./users.route.js";
import cardsRoute from "./cards.route.js";
import packsRoute from "./packs.route.js";
import battleRoute from "./battle.route.js";
import { validate } from "../middlewares/validate.middleware.js";
import { userSeedHeadersSchema } from "../../schemas/user.schema.js";

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

router.use("/users", validate(userSeedHeadersSchema), authenticateUser, usersRoute);

router.use("/cards", validate(userSeedHeadersSchema), authenticateUser, cardsRoute);

router.use("/packs", validate(userSeedHeadersSchema), authenticateUser, packsRoute);

router.use("/battle", validate(userSeedHeadersSchema), authenticateUser, battleRoute);

export default router;
