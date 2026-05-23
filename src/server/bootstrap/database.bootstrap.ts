import config from "../../config/index.js";
import { database } from "../../database/index.js";
import { configurePRAGMA } from "../../database/index.js";
import { initialiseAssociations } from "../../database/index.js";

export const databaseBootstrap = async () => {
  await database.authenticate();
  console.log("SQLite connected...");

  await configurePRAGMA();

  initialiseAssociations();

  await database.sync();
  console.log("Synced all models to database...");
};
