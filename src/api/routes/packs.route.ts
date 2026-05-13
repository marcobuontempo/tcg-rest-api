import { Router } from "express";
import { getAllPacksData, openPack } from "../controllers/packs.controller.js";
import { requireNoActiveBattle } from "../middlewares/requireNoActiveBattle.js";

const router = Router();

router.get("/", getAllPacksData);

router.post("/open", requireNoActiveBattle, openPack);

export default router;
