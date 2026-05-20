import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { database } from "../connection.js";
import { AdministratorAttributes } from "../../schemas/administrator.schema.js";

export class Administrator extends Model<
  InferAttributes<Administrator>,
  InferCreationAttributes<Administrator>
> {
  declare username: AdministratorAttributes["username"];
  declare password_hash: AdministratorAttributes["password_hash"];
}

Administrator.init(
  {
    username: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "administrators",
    timestamps: false,
    underscored: true,
  },
);
