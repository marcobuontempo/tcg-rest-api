import { Options } from "sequelize";

export const database: Options = {
  dialect: "sqlite",
  storage: process.env.DB_LOCATION ?? "./data/database.sqlite",
  logging: false,
  pool: {
    max: Number(process.env.DB_POOL_SIZE ?? 5),
    min: 1,
    idle: 10000,
  },
};
