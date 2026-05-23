import { Card } from "./models/card.model.js";
import { MarketListing } from "./models/marketListing.model.js";
import { User } from "./models/user.model.js";
import { UserCard } from "./models/userCard.model.js";
import { UserStats } from "./models/userStats.model.js";

export const initialiseAssociations = () => {
  // User has UserStats (1:1)
  UserStats.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "id",
    onDelete: "CASCADE",
  });
  User.hasOne(UserStats, { foreignKey: "user_id", sourceKey: "id" });

  // User creation automatically generates UserStats
  User.afterCreate(async (user, options) => {
    await UserStats.create({ user_id: user.id });
  });

  // User has UserCards (1:N)
  UserCard.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "id",
    onDelete: "CASCADE",
  });
  User.hasMany(UserCard, { foreignKey: "user_id", sourceKey: "id" });
  // Card has UserCards (1:N)
  UserCard.belongsTo(Card, {
    foreignKey: "card_id",
    targetKey: "id",
    onDelete: "CASCADE",
  });
  Card.hasMany(UserCard, { foreignKey: "card_id", sourceKey: "id" });

  // User has MarketListings (1:N)
  MarketListing.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "id",
    onDelete: "CASCADE",
  });
  User.hasMany(MarketListing, { foreignKey: "user_id", sourceKey: "id" });
  // Card has MarketListings (1:N)
  MarketListing.belongsTo(Card, {
    foreignKey: "card_id",
    targetKey: "id",
    onDelete: "CASCADE",
  });
  Card.hasMany(MarketListing, { foreignKey: "card_id", sourceKey: "id" });

  console.log("Model associations established...");
};
