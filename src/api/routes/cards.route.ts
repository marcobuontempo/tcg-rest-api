import { Router } from "express";
import { getAllCardsData } from "../controllers/cards.controller.js";

const router = Router();

router.get("/", getAllCardsData);

export default router;
