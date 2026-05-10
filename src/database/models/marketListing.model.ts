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
import { MarketListingAttributes } from "../../schemas/marketListing.schema.js";

export class MarketListing extends Model<
  InferAttributes<MarketListing>,
  InferCreationAttributes<MarketListing>
> {
  declare id: CreationOptional<MarketListingAttributes["id"]>;
  declare user_id: ForeignKey<MarketListingAttributes["user_id"]>;
  declare card_id: ForeignKey<MarketListingAttributes["card_id"]>;
  declare quantity: CreationOptional<MarketListingAttributes["quantity"]>;
  declare price: MarketListingAttributes["price"];
  declare created_at: CreationOptional<MarketListingAttributes["created_at"]>;
  declare updated_at: CreationOptional<MarketListingAttributes["updated_at"]>;
}

MarketListing.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },

    card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Card,
        key: "id",
      },
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },

    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },

    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },

  {
    sequelize: database,
    tableName: "market_listings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);
