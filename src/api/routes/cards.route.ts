import { Router } from "express";
import { getAllCardsData } from "../controllers/cards.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { GetAllCardsSchema } from "../../schemas/card.schema.js";

const router = Router();

router.get("/", validate(GetAllCardsSchema), getAllCardsData);

export default router;
