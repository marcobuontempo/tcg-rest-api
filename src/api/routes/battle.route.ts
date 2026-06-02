import { Router } from "express";
import { playBattle } from "../controllers/battle.controller.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { BattleSchema } from "../../schemas/battle.schema.js";
import { requireValidUserSeed } from "../middlewares/requireValidUserSeed.middleware.js";
import { UserSeedHeadersSchema } from "../../schemas/user.schema.js";
import { requireNoActiveBattle } from "../middlewares/requireNoActiveBattle.middleware.js";

const router = Router();

router.post(
  "/",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  requireNoActiveBattle,
  validateRequest(BattleSchema),
  playBattle,
);

export default router;
