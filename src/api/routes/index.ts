import express from "express";
import packagejson from "../../../package.json" with { type: "json" };
import { requireValidUserSeed } from "../middlewares/requireValidUserSeed.js";
import registerRoute from "./register.route.js";
import adminRoute from "./administrator.route.js";
import usersRoute from "./users.route.js";
import cardsRoute from "./cards.route.js";
import marketRoute from "./market.route.js";
import packsRoute from "./packs.route.js";
import battleRoute from "./battle.route.js";
import serverRoute from "./server.route.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { UserSeedHeadersSchema } from "../../schemas/user.schema.js";
import { requireNoActiveBattle } from "../middlewares/requireNoActiveBattle.js";
import rateLimit from "express-rate-limit";
import config from "../../config/index.js";

const router = express.Router();

// root endpoint
router.get("/", (req, res, next) =>
  res.send({
    name: packagejson.name,
    description: packagejson.description,
    author: packagejson.author,
    version: packagejson.version,
  }),
);

router.use("/register", registerRoute);

router.use("/admin", rateLimit(config.limiter.admin), adminRoute);

router.use("/users", usersRoute);

router.use("/cards", cardsRoute);

router.use("/market", marketRoute);

router.use("/packs", packsRoute);

router.use("/battle", requireNoActiveBattle, battleRoute);

router.use("/server", serverRoute);

export default router;
