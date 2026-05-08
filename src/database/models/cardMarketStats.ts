import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { database } from "../connection.js";
import { Card } from "./card.model.js";

export class CardMarketStats extends Model<
  InferAttributes<CardMarketStats>,
  InferCreationAttributes<CardMarketStats>
> {
  declare card_id: ForeignKey<Card["id"]>;
  declare quantity_existing: number;
  declare quantity_sold: number;
  declare average_sold_price: number;
  declare updated_at: CreationOptional<Date>;
}

CardMarketStats.init(
  {
    card_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Card,
        key: "id",
      },
    },

    quantity_existing: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },

    quantity_sold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },

    average_sold_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },

    updated_at: DataTypes.DATE,
  },

  {
    sequelize: database,
    tableName: "card_market_stats",
    timestamps: false,
    createdAt: false,
    underscored: true,
  },
);
