import { Router } from "express";
import { createCardListing } from "../controllers/market.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { CreateMarketListingSchema } from "../../schemas/marketListing.schema.js";

const router = Router();

// router.get("/", );

// router.get("/:id", );

router.post("/", validate(CreateMarketListingSchema), createCardListing);

// router.patch("/:id", );

export default router;
