import { Router } from "express";
import { deleteUser, getUserData, updateUsername } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", getUserData);

router.put("/me", updateUsername);

router.delete("/me", deleteUser);

export default router;
