import { Router } from "express";
import { registerUser } from "../controllers/register.controller.js";
import rateLimit from "express-rate-limit";
import config from "../../config/index.js";

const router = Router();

router.post("/", rateLimit(config.limiter.registration), registerUser);

export default router;
