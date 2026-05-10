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
import { CardMarketStatsAttributes } from "../../schemas/cardMarketStats.schema.js";

export class CardMarketStats extends Model<
  InferAttributes<CardMarketStats>,
  InferCreationAttributes<CardMarketStats>
> {
  declare card_id: ForeignKey<CardMarketStatsAttributes["card_id"]>;
  declare quantity_existing: CardMarketStatsAttributes["quantity_existing"];
  declare quantity_sold: CardMarketStatsAttributes["quantity_sold"];
  declare average_sold_price: CardMarketStatsAttributes["average_sold_price"];
  declare updated_at: CreationOptional<CardMarketStatsAttributes["updated_at"]>;
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
    updatedAt: "updated_at",
    underscored: true,
  },
);
