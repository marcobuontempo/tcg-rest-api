import { Router } from "express";
import { getAllCardsData } from "../controllers/cards.controller.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { GetAllCardsSchema } from "../../schemas/card.schema.js";

const router = Router();

router.get("/", validateRequest(GetAllCardsSchema), getAllCardsData);

export default router;
