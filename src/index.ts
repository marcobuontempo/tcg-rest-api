import config from "./config/index.js";
import { serverBootstrap } from "./server/bootstrap/index.js";
import { serverStart } from "./server/index.js";
import bcrypt from "bcrypt"

// Set Server Timezone (default=UTC)
process.env.TZ = config.server.timezone;

(async () => {
  try {
    console.log("Starting server...");
    await serverBootstrap();
    await serverStart();
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();
