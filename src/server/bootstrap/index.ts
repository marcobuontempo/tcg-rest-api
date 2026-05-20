import { adminBootstrap } from "./administrator.bootstrap.js";
import { cacheBootstrap } from "./cache.bootstrap.js";
import { seedCardsBoostrap } from "./cards.bootstrap.js";
import { databaseBootstrap } from "./database.bootstrap.js";

export const serverBootstrap = async () => {
  await databaseBootstrap();
  await adminBootstrap();
  await seedCardsBoostrap();
  await cacheBootstrap();
};
