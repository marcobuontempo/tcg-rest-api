import express from "express";
import packagejson from "../../../package.json" with { type: "json" };
import { requireValidUserSeed } from "../middlewares/requireValidUserSeed.js";
import registerRoute from "./register.route.js";
import usersRoute from "./users.route.js";
import cardsRoute from "./cards.route.js";
import marketRoute from "./market.route.js";
import packsRoute from "./packs.route.js";
import battleRoute from "./battle.route.js";
import serverRoute from "./server.route.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { UserSeedHeadersSchema } from "../../schemas/user.schema.js";
import { requireNoActiveBattle } from "../middlewares/requireNoActiveBattle.js";

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
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  usersRoute,
);

router.use(
  "/cards",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  cardsRoute,
);

router.use(
  "/market",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  marketRoute,
);

router.use(
  "/packs",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  packsRoute,
);

router.use(
  "/battle",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  requireNoActiveBattle,
  battleRoute,
);

router.use(
  "/server",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  serverRoute,
);

export default router;
