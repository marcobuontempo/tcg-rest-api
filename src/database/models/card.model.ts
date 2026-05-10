import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { database } from "../connection.js";
import { CardAttributes } from "../../schemas/card.schema.js";
import config from "../../config/index.js";

export class Card extends Model<
  InferAttributes<Card>,
  InferCreationAttributes<Card>
> {
  declare id: CreationOptional<CardAttributes["id"]>;
  declare name: CardAttributes["name"];
  declare type: CardAttributes["type"];
  declare rarity: CardAttributes["rarity"];
  declare drop_rate: CardAttributes["drop_rate"];
  declare attack: CardAttributes["attack"];
  declare defense: CardAttributes["defense"];
  declare created_at: CreationOptional<CardAttributes["created_at"]>;
  declare updated_at: CreationOptional<CardAttributes["updated_at"]>;
}

Card.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.CITEXT,
      unique: true,
      allowNull: false,
      validate: { len: [1, 32] },
    },

    type: {
      type: DataTypes.ENUM(...config.cards.types),
      allowNull: false,
    },

    rarity: {
      type: DataTypes.ENUM(...config.cards.rarities),
      allowNull: false,
    },

    drop_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 10000 },
    },

    attack: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 10000 },
    },

    defense: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 10000 },
    },

    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },

  {
    sequelize: database,
    tableName: "cards",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);
