import { Router } from "express";
import { getCardInfo } from "../controllers/card.controller.js";

const router = Router();

router.get("/", getCardInfo);

export default router;
