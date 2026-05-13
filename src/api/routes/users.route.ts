import { Router } from "express";
import {
  getUserData,
  updateUsername,
  deleteUser,
} from "../controllers/users.controller.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { UpdateUsernameSchema } from "../../schemas/user.schema.js";

const router = Router();

router.get("/me", getUserData);

router.patch("/me", validateRequest(UpdateUsernameSchema), updateUsername);

router.delete("/me", deleteUser);

export default router;
