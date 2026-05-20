import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";
import { database } from "../connection.js";
import { UserAttributes } from "../../schemas/user.schema.js";
import { UserStats } from "./userStats.model.js";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<UserAttributes["id"]>;
  declare seed_hash: UserAttributes["seed_hash"];
  declare username: CreationOptional<UserAttributes["username"]>;
  declare balance: CreationOptional<UserAttributes["balance"]>;
  declare xp: CreationOptional<UserAttributes["xp"]>;
  declare last_daily_pack_at: CreationOptional<
    UserAttributes["last_daily_pack_at"]
  >;
  declare created_at: CreationOptional<UserAttributes["created_at"]>;
  declare updated_at: CreationOptional<UserAttributes["updated_at"]>;
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
      allowNull: false,
      defaultValue: "anonymous",
      validate: { len: [3, 32] },
    },

    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },

    xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },

    last_daily_pack_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },

    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },

  {
    sequelize: database,
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);
