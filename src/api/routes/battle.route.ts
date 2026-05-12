import { Router } from "express";
import { playBattle } from "../controllers/battle.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { BattleSchema } from "../../schemas/battle.schema.js";

const router = Router();

router.post("/play", validate(BattleSchema), playBattle);

export default router;
