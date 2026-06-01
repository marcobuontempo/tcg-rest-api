import { Router } from "express";
import { playBattle } from "../controllers/battle.controller.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { BattleSchema } from "../../schemas/battle.schema.js";
import { requireValidUserSeed } from "../middlewares/requireValidUserSeed.js";
import { UserSeedHeadersSchema } from "../../schemas/user.schema.js";

const router = Router();

router.post(
  "/",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  validateRequest(BattleSchema),
  playBattle,
);

export default router;
