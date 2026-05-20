import "dotenv/config";
import { auth } from "./auth.config.js";
import { administrator } from "./administrator.config.js";
import { battle } from "./battle.config.js";
import { cards } from "./cards.config.js";
import { database } from "./database.config.js";
import { game } from "./game.config.js";
import { limiter } from "./limiter.config.js";
import { packs } from "./packs.config.js";
import { server } from "./server.config.js";

export const config = {
  auth,
  administrator,
  battle,
  cards,
  database,
  game,
  limiter,
  packs,
  server,
};

export default config;
