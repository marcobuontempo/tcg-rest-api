import express from "express";
import packagejson from "../../../package.json" with { type: "json" };
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import registerRoute from "./register.route.js";
import usersRoute from "./users.route.js";
import cardsRoute from "./cards.route.js";
import marketRoute from "./market.route.js";
import packsRoute from "./packs.route.js";
import battleRoute from "./battle.route.js";
import { validate } from "../middlewares/validate.middleware.js";
import { UserSeedHeadersSchema } from "../../schemas/user.schema.js";

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

router.use(
  "/users",
  validate(UserSeedHeadersSchema),
  authenticateUser,
  usersRoute,
);

router.use(
  "/cards",
  validate(UserSeedHeadersSchema),
  authenticateUser,
  cardsRoute,
);

router.use(
  "/market",
  validate(UserSeedHeadersSchema),
  authenticateUser,
  marketRoute,
);

router.use(
  "/packs",
  validate(UserSeedHeadersSchema),
  authenticateUser,
  packsRoute,
);

router.use(
  "/battle",
  validate(UserSeedHeadersSchema),
  authenticateUser,
  battleRoute,
);

export default router;
