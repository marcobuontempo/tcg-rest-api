import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { database } from "../index.js";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare seed_hash: string;
  declare username: CreationOptional<string>;
  declare balance: CreationOptional<number>;
  declare xp: CreationOptional<number>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    seed_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    username: {
      type: DataTypes.STRING,
      defaultValue: "anonymous",
    },

    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },

    xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    sequelize: database,
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);
