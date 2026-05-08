import "dotenv/config";
import { server } from "./server.config.js";
import { database } from "./database.config.js";

export const config = {
  server,
  database,
};

export default config;
