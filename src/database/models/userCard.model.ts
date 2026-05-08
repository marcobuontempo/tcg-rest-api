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
import { Card } from "./card.model.js";

export class UserCard extends Model<
  InferAttributes<UserCard>,
  InferCreationAttributes<UserCard>
> {
  declare user_id: ForeignKey<User["id"]>;
  declare card_id: ForeignKey<Card["id"]>;
  declare quantity: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

UserCard.init(
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
    },

    card_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Card,
        key: "id",
      },
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },

  {
    sequelize: database,
    tableName: "user_cards",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);
