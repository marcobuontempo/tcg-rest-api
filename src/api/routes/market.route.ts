import { Router } from "express";
import {
  createMarketListing,
  deleteMarketListing,
  getAllMarketListings,
  getMarketListingById,
  getOwnMarketListings,
} from "../controllers/market.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  CreateMarketListingSchema,
  DeleteMarketListingSchema,
  GetAllMarketListingsSchema,
  GetMarketListingByIdSchema,
} from "../../schemas/marketListing.schema.js";

const router = Router();

router.get("/me", getOwnMarketListings);

router.get("/:id", validate(GetMarketListingByIdSchema), getMarketListingById);

router.get("/", validate(GetAllMarketListingsSchema), getAllMarketListings);

router.post("/", validate(CreateMarketListingSchema), createMarketListing);

router.delete("/:id", validate(DeleteMarketListingSchema), deleteMarketListing);

// router.patch("/:id", );

export default router;
