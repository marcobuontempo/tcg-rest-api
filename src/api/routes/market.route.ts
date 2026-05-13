import { Router } from "express";
import {
  buyMarketListing,
  createMarketListing,
  deleteMarketListing,
  getAllMarketListings,
  getMarketListingById,
  getOwnMarketListings,
} from "../controllers/market.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  BuyMarketListingSchema,
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

router.post("/:id/buy", validate(BuyMarketListingSchema), buyMarketListing);

// router.patch("/:id", );

export default router;
