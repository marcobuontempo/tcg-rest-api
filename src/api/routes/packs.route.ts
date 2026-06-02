import { Router } from "express";
import {
  getAllPacksData,
  openDailyPack,
  openPack,
} from "../controllers/packs.controller.js";
import { requireNoActiveBattle } from "../middlewares/requireNoActiveBattle.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { OpenPackSchema } from "../../schemas/packs.schema.js";
import { requireValidUserSeed } from "../middlewares/requireValidUserSeed.middleware.js";
import { UserSeedHeadersSchema } from "../../schemas/user.schema.js";

const router = Router();

router.get("/", getAllPacksData);

router.post(
  "/daily/open",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  requireNoActiveBattle,
  openDailyPack,
);

router.post(
  "/:pack_name/open",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  requireNoActiveBattle,
  validateRequest(OpenPackSchema),
  openPack,
);

export default router;
