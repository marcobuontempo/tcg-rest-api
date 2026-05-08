import { database } from "./connection.js";
import { configurePRAGMA } from "./pragmas.js";
import { initialiseAssociations } from "./associations.js";

export const startDatabase = async () => {
  await database.authenticate();
  console.log("SQLite connected");

  await configurePRAGMA();

  initialiseAssociations();

  await database.sync({ alter: true });
  console.log("Synced all models to database");
};
