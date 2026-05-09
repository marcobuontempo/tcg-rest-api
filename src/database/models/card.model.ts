import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { database } from "../connection.js";

const CARD_TYPES = ["bug", "tree", "cloud", "shell"] as const;
type CardType = (typeof CARD_TYPES)[number];

const CARD_RARITY = ["kilo", "mega", "giga", "tera", "peta", "exa"] as const;
export type CardRarity = (typeof CARD_RARITY)[number];

export class Card extends Model<
  InferAttributes<Card>,
  InferCreationAttributes<Card>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare type: CardType;
  declare rarity: CardRarity;
  declare drop_rate: number;
  declare attack: number;
  declare defense: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
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
      validate: { max: 255 },
    },

    type: {
      type: DataTypes.ENUM(...CARD_TYPES),
      allowNull: false,
    },

    rarity: {
      type: DataTypes.ENUM(...CARD_RARITY),
      allowNull: false,
    },

    drop_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 10000 },
    },

    attack: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 999999999 },
    },

    defense: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 999999999 },
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
