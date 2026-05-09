import { Router } from "express";
import { getUserData, updateUsername, deleteUser } from "../controllers/users.controller.js";

const router = Router();

router.get("/me", getUserData);

router.put("/me", updateUsername);

router.delete("/me", deleteUser);

export default router;
