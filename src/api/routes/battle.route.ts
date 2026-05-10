import { Router } from "express";
import { playBattle } from "../controllers/battle.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { battleSchema } from "../../schemas/battle.schema.js";

const router = Router();

router.post("/play", validate(battleSchema), playBattle);

export default router;
