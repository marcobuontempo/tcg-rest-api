import { Router } from "express";
import {
  getUserData,
  updateUsername,
  deleteUser,
  getUserCards,
} from "../controllers/users.controller.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  UpdateUsernameSchema,
  UserSeedHeadersSchema,
} from "../../schemas/user.schema.js";
import { requireValidUserSeed } from "../middlewares/requireValidUserSeed.middleware.js";

const router = Router();

router.get(
  "/me",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  getUserData,
);

router.get(
  "/me/cards",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  getUserCards,
);

router.patch(
  "/me",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  validateRequest(UpdateUsernameSchema),
  updateUsername,
);

router.delete(
  "/me",
  validateRequest(UserSeedHeadersSchema),
  requireValidUserSeed,
  deleteUser,
);

export default router;
