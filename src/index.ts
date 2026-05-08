import config from "./config/index.js";
import { startDatabase } from "./database/index.js";
import { serverStart } from "./server/index.js";

// Set Server Timezone (default=UTC)
process.env.TZ = config.server.timezone;

(async () => {
  try {
    console.log("Starting server...");
    await startDatabase();
    serverStart();
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();
