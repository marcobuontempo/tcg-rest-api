import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  DeleteUserAsAdministratorSchema,
  LoginAdministratorSchema,
  UpdateAdministratorPasswordSchema,
} from "../../schemas/administrator.schema.js";
import {
  deleteUserAsAdmin,
  loginAdministrator,
  updateAdminPassword,
} from "../controllers/administrator.controller.js";
import { requireAdministrator } from "../middlewares/requireAdministrator.middleware.js";

const router = Router();

// public
router.post(
  "/login",
  validateRequest(LoginAdministratorSchema),
  loginAdministrator,
);

// protected
router.use(requireAdministrator);

router.patch(
  "/password",
  validateRequest(UpdateAdministratorPasswordSchema),
  updateAdminPassword,
);

router.delete(
  "/users/:user_id",
  validateRequest(DeleteUserAsAdministratorSchema),
  deleteUserAsAdmin,
);

export default router;
