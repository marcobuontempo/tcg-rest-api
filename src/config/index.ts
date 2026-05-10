import "dotenv/config";
import { server } from "./server.config.js";
import { database } from "./database.config.js";
import { game } from "./game.config.js";
import { cards } from "./cards.config.js";

export const config = {
  server,
  database,
  game,
  cards,
};

export default config;
