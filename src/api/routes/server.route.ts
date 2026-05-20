import { Router } from "express";
import { getLeaderboard, getStats } from "../controllers/server.controller.js";

const router = Router();

router.get("/leaderboard", getLeaderboard);

router.get("/stats", getStats);

export default router;
