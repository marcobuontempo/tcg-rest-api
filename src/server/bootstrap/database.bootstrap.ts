import cron from "node-cron";
import { Op } from "sequelize";
import { database } from "../../database/index.js";
import { configurePRAGMA } from "../../database/index.js";
import { initialiseAssociations } from "../../database/index.js";
import { MarketListing } from "../../database/models/marketListing.model.js";
import { User } from "../../database/models/user.model.js";
import { UserCard } from "../../database/models/userCard.model.js";
import config from "../../config/index.js";

export const databaseBootstrap = async () => {
  await database.authenticate();
  console.log("SQLite connected...");

  await configurePRAGMA();

  initialiseAssociations();

  // purge redundant database info every day at midnight
  cron.schedule("0 0 * * *", async () => {
    await purgeExpiredSeeds();
    await purgeRedundantRows();
  });

  await database.sync();

  await purgeExpiredSeeds();

  await purgeRedundantRows();

  console.log("Synced all models to database...");
};

const purgeExpiredSeeds = async () => {
  const expiryDate = new Date(
    Date.now() - config.game.seedExpiryTime,
  ).toISOString();

  // removes all users that have not had an update in config specified time period
  const removedCount = await User.destroy({
    where: {
      updated_at: {
        [Op.lt]: expiryDate,
      },
    },
  });
  if (removedCount) console.log(`Purged ${removedCount} expired users...`);
};

const purgeRedundantRows = async () => {
  // removes all rows where quantity = 0
  const removedUserCardCount = await UserCard.destroy({
    where: { quantity: 0 },
  });
  const removedMarketListingCount = await MarketListing.destroy({
    where: { quantity: 0 },
  });
  if (removedUserCardCount || removedMarketListingCount)
    console.log("Purged rows where quantity=0...");
};
