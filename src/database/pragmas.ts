import { QueryTypes } from "sequelize";
import { database } from "./connection.js";
import config from "../config/index.js";

export const configurePRAGMA = async () => {
  // manual statement to apply each pragma
  await database.query(
    `PRAGMA journal_mode=${config.database.pragmas.journalMode};`,
  );
  const walResult = await database
    .query<{
      journal_mode: string;
    }>("PRAGMA journal_mode;", { type: QueryTypes.SELECT })
    .then((r) => r[0].journal_mode.toUpperCase());
  if (
    walResult.toUpperCase() !==
    config.database.pragmas.journalMode.toUpperCase()
  ) {
    throw new Error(
      `Failed to enable PRAGMA journal_mode=${config.database.pragmas.journalMode}`,
    );
  }

  await database.query(
    `PRAGMA synchronous=${config.database.pragmas.synchronous};`,
  );
  const syncResult = await database
    .query<{
      synchronous: number;
    }>("PRAGMA synchronous;", { type: QueryTypes.SELECT })
    .then((r) => (r[0].synchronous === 1 ? "NORMAL" : "OTHER")); // 1=NORMAL, 2=FULL
  if (
    syncResult.toUpperCase() !==
    config.database.pragmas.synchronous.toUpperCase()
  ) {
    throw new Error(
      `Failed to set PRAGMA synchronous=${config.database.pragmas.synchronous}`,
    );
  }

  await database.query(
    `PRAGMA journal_size_limit=${config.database.pragmas.journalSizeLimit};`,
  );
  const journalSizeResult = await database
    .query<{
      journal_size_limit: number;
    }>("PRAGMA journal_size_limit;", { type: QueryTypes.SELECT })
    .then((r) => r[0].journal_size_limit);
  if (journalSizeResult !== config.database.pragmas.journalSizeLimit) {
    throw new Error(
      `Failed to limit journal_size_limit=${config.database.pragmas.journalSizeLimit}`,
    );
  }

  await database.query(
    `PRAGMA cache_size=${config.database.pragmas.cacheSize};`,
  );
  const cacheSizeResult = await database
    .query<{
      cache_size: number;
    }>("PRAGMA cache_size;", { type: QueryTypes.SELECT })
    .then((r) => r[0].cache_size);
  if (cacheSizeResult !== config.database.pragmas.cacheSize) {
    throw new Error(
      `Failed to set PRAGMA cache_size=${config.database.pragmas.cacheSize}`,
    );
  }

  await database.query(
    `PRAGMA busy_timeout=${config.database.pragmas.busyTimeout};`,
  );
  const timeoutResult = await database
    .query<{
      timeout: number;
    }>("PRAGMA busy_timeout;", { type: QueryTypes.SELECT })
    .then((r) => r[0].timeout);
  if (timeoutResult !== config.database.pragmas.busyTimeout) {
    throw new Error(
      `Failed to set PRAGMA busy_timeout=${config.database.pragmas.busyTimeout}`,
    );
  }

  await database.query(
    `PRAGMA mmap_size=${config.database.pragmas.memoryMapSize};`,
  );
  const memoryMappedResult = await database
    .query<{
      mmap_size: number;
    }>("PRAGMA mmap_size;", { type: QueryTypes.SELECT })
    .then((r) => r[0].mmap_size);
  if (memoryMappedResult !== config.database.pragmas.memoryMapSize) {
    throw new Error(
      `Failed to set PRAGMA mmap_size=${config.database.pragmas.memoryMapSize}`,
    );
  }

  console.log(`PRAGMA configured:
  | Journal Mode:          ${walResult}
  | Synchronous:           ${syncResult}
  | Journal Size Limit:    ${journalSizeResult / 1024 / 1024} MiB
  | Cache Size:            ${cacheSizeResult} * pagesize
  | Busy Timeout:          ${timeoutResult / 1000} seconds
  | Memory Mapped Size:    ${memoryMappedResult / 1024 / 1024} MiB`);
};
