import { Router } from "express";
import {
  getUserData,
  updateUsername,
  deleteUser,
} from "../controllers/users.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { UpdateUsernameSchema } from "../../schemas/user.schema.js";

const router = Router();

router.get("/me", getUserData);

router.patch("/me", validate(UpdateUsernameSchema), updateUsername);

router.delete("/me", deleteUser);

export default router;
