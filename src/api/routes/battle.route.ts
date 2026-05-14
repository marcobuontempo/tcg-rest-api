import { Router } from "express";
import { playBattle } from "../controllers/battle.controller.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { BattleSchema } from "../../schemas/battle.schema.js";

const router = Router();

router.post("/:difficulty", validateRequest(BattleSchema), playBattle);

export default router;
