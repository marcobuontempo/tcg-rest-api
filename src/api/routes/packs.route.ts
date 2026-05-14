import { Router } from "express";
import { getAllPacksData, openPack } from "../controllers/packs.controller.js";
import { requireNoActiveBattle } from "../middlewares/requireNoActiveBattle.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { OpenPackSchema } from "../../schemas/packs.schema.js";

const router = Router();

router.get("/", getAllPacksData);

router.post(
  "/:pack_name/open",
  requireNoActiveBattle,
  validateRequest(OpenPackSchema),
  openPack,
);

export default router;
