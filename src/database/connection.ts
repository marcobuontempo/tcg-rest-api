import config from "../config/index.js";
import { Sequelize } from "sequelize";

export const database = new Sequelize(config.database);
