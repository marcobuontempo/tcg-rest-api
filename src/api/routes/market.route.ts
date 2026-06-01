import { Router } from "express";
import {
  buyMarketListing,
  createMarketListing,
  deleteMarketListing,
  getAllMarketListings,
  getMarketListingById,
  getOwnMarketListings,
} from "../controllers/market.controller.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  BuyMarketListingSchema,
  CreateMarketListingSchema,
  DeleteMarketListingSchema,
  GetAllMarketListingsSchema,
  GetMarketListingByIdSchema,
} from "../../schemas/marketListing.schema.js";
import { requireNoActiveBattle } from "../middlewares/requireNoActiveBattle.js";
import { requireValidUserSeed } from "../middlewares/requireValidUserSeed.js";
import { UserSeedHeadersSchema } from "../../schemas/user.schema.js";

const router = Router();

router.get(
  "/me",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  getOwnMarketListings,
);

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
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  requireNoActiveBattle,
  validateRequest(CreateMarketListingSchema),
  createMarketListing,
);

router.delete(
  "/:listing_id",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  requireNoActiveBattle,
  validateRequest(DeleteMarketListingSchema),
  deleteMarketListing,
);

router.post(
  "/:listing_id/buy",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  requireNoActiveBattle,
  validateRequest(BuyMarketListingSchema),
  buyMarketListing,
);

export default router;
