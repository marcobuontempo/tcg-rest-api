import { Router } from "express";
import { playBattle } from "../controllers/battle.controller.js";

const router = Router();

router.post("/play", playBattle);

export default router;
