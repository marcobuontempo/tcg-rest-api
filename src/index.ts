import express from "express";
import { errorHandler } from "./api/middlewares/errorHandler.middleware.js";
import { ApiError } from "./utilities/error.util.js";
import router from "./api/routes/index.js";

// Initialise Express
const app = express();

// Parse JSON Requests
app.use(express.json());

app.use("/api", router);

// All Invalid Endpoints
app.use((req, res, next) => next(ApiError.notFound()));

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(4000, () => {
  console.log("Server running");
});
