import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { database } from "../connection.js";
import { User } from "./user.model.js";

export class UserStats extends Model<
  InferAttributes<UserStats>,
  InferCreationAttributes<UserStats>
> {
  declare user_id: ForeignKey<User["id"]>;
  declare total_battles: CreationOptional<number>;
  declare total_wins: CreationOptional<number>;
  declare total_losses: CreationOptional<number>;
  declare updated_at: CreationOptional<Date>;
}

UserStats.init(
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
    },

    total_battles: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    total_wins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    total_losses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    updated_at: DataTypes.DATE,
  },

  {
    sequelize: database,
    tableName: "user_stats",
    timestamps: true,
    createdAt: false,
    updatedAt: "updated_at",
    underscored: true,
  },
);
