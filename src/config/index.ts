import "dotenv/config";
import { server } from "./server.config.js";
import { database } from "./database.config.js";
import { game } from "./game.config.js";

export const config = {
  server,
  database,
  game,
};

export default config;
