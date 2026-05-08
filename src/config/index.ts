import { loadEnvFile } from "node:process";
import { server } from "./server.config.js";

loadEnvFile();

export const config = {
  server,
};

export default config;
