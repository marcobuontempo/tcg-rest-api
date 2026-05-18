import { Router } from "express";
import {
  autoBuyMarketListing,
  buyMarketListing,
  createMarketListing,
  deleteMarketListing,
  getAllMarketListings,
  getMarketListingById,
  getOwnMarketListings,
} from "../controllers/market.controller.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  AutoBuyMarketListingSchema,
  BuyMarketListingSchema,
  CreateMarketListingSchema,
  DeleteMarketListingSchema,
  GetAllMarketListingsSchema,
  GetMarketListingByIdSchema,
} from "../../schemas/marketListing.schema.js";
import { requireNoActiveBattle } from "../middlewares/requireNoActiveBattle.js";

const router = Router();

router.get("/me", getOwnMarketListings);

router.get(
  "/:listing_id",
  validateRequest(GetMarketListingByIdSchema),
  getMarketListingById,
);

router.get(
  "/",
  validateRequest(GetAllMarketListingsSchema),
  getAllMarketListings,
);

router.post(
  "/",
  requireNoActiveBattle,
  validateRequest(CreateMarketListingSchema),
  createMarketListing,
);

router.delete(
  "/:listing_id",
  requireNoActiveBattle,
  validateRequest(DeleteMarketListingSchema),
  deleteMarketListing,
);

router.post(
  "/:listing_id/buy",
  requireNoActiveBattle,
  validateRequest(BuyMarketListingSchema),
  buyMarketListing,
);

router.post(
  "/auto-buy",
  requireNoActiveBattle,
  validateRequest(AutoBuyMarketListingSchema),
  autoBuyMarketListing,
);

export default router;
