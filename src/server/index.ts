import config from "../config/index.js";
import express from "express";
import cors from "cors";
import { ApiError } from "../utilities/error.util.js";
import { errorHandler } from "../api/middlewares/errorHandler.middleware.js";
import router from "../api/routes/index.js";
import rateLimit from "express-rate-limit";

export const serverStart = async () => {
  try {
    // Initialise Express
    const app = express();

    // Rate Limiter
    app.use(rateLimit(config.limiter.burst)); // burst limit
    app.use(rateLimit(config.limiter.global)); // global limit

    // Setup CORS
    app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      }),
    );
    // Parse JSON Requests
    app.use(express.json());

    // API Routing
    app.use("/api", router);

    // All Invalid Endpoints
    app.use((req, res, next) => next(ApiError.notFound("invalid endpoint")));

    // Global Error Handler
    app.use(errorHandler);

    // Start Server
    app.listen(config.server.port, async () => {
      console.log(
        `=> SERVER STARTED - running on port ${config.server.port} <=`,
      );
    });

    return app;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Server failed to start:", error.message);
    } else {
      console.error("Unknown error occurred");
    }
    process.exit(1);
  }
};
