import { Router } from "express";
import { getAllPacksData, openPack } from "../controllers/packs.controller.js";

const router = Router();

router.get("/", getAllPacksData);

router.post("/open", openPack);

export default router;
