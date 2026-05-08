import { Options } from "sequelize";

export const database: Options = {
  dialect: "sqlite",
  storage: process.env.DB_LOCATION ?? "./data/database.sqlite",
  logging: false,
  pool: {
    max: 5,
    min: 1,
    idle: 10000,
  },
};
