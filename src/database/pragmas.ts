import { QueryTypes } from "sequelize";
import { database } from "./connection.js";

export const configurePRAGMA = async () => {
  // Enable WAL Mode: allows concurrent reads during writes, drastically improving performance
  await database.query("PRAGMA journal_mode=WAL;");
  const walResult = await database
    .query<{
      journal_mode: string;
    }>("PRAGMA journal_mode;", { type: QueryTypes.SELECT })
    .then((r) => r[0].journal_mode.toUpperCase());
  if (walResult !== "WAL") {
    throw new Error("Failed to enable PRAGMA journal_mode=WAL");
  }

  // Set NORMAL Sync: transactions are written to disk less frequently, improving performance
  await database.query("PRAGMA synchronous=NORMAL;");
  const syncResult = await database
    .query<{
      synchronous: number;
    }>("PRAGMA synchronous;", { type: QueryTypes.SELECT })
    .then((r) => (r[0].synchronous === 1 ? "Normal" : "Other")); // 1=NORMAL, 2=FULL
  if (syncResult !== "Normal") {
    throw new Error("Failed to set PRAGMA synchronous=NORMAL");
  }

  // Limit WAL File Size (64MB): prevents WAL file from growing indefinitely, with checkpoints when exceeded
  await database.query("PRAGMA journal_size_limit=67108864;");
  const journalSizeResult = await database
    .query<{
      journal_size_limit: number;
    }>("PRAGMA journal_size_limit;", { type: QueryTypes.SELECT })
    .then((r) => r[0].journal_size_limit);
  if (journalSizeResult !== 67108864) {
    throw new Error("Failed to limit journal_size_limit=67108864");
  }

  // Checkpoint WAL every 2000 pages: control WAL growth
  await database.query("PRAGMA cache_size=2000;");
  const cacheSizeResult = await database
    .query<{
      cache_size: number;
    }>("PRAGMA cache_size;", { type: QueryTypes.SELECT })
    .then((r) => r[0].cache_size);
  if (cacheSizeResult !== 2000) {
    throw new Error("Failed to set PRAGMA cache_size=2000");
  }

  // Allow additional time (5s) until timeout is called, to reduce database lock errors
  await database.query("PRAGMA busy_timeout=10000;");
  const timeoutResult = await database
    .query<{
      timeout: number;
    }>("PRAGMA busy_timeout;", { type: QueryTypes.SELECT })
    .then((r) => r[0].timeout);
  if (timeoutResult !== 10000) {
    throw new Error("Failed to set PRAGMA busy_timeout=10000");
  }

  // Enable memory-mapped IO (small gain in performance - larger size allocation has diminishing gains)
  await database.query("PRAGMA mmap_size=134217728;");
  const memoryMappedResult = await database
    .query<{
      mmap_size: number;
    }>("PRAGMA mmap_size;", { type: QueryTypes.SELECT })
    .then((r) => r[0].mmap_size);
  if (memoryMappedResult !== 134217728) {
    throw new Error("Failed to set PRAGMA mmap_size=134217728");
  }

  console.log(`PRAGMA Configured
  | Journal Mode:          ${walResult}
  | Synchronous:           ${syncResult}
  | Journal Size Limit:    ${journalSizeResult / 1024 / 1024} MiB
  | Cache Size:            ${cacheSizeResult} * pagesize
  | Busy Timeout:          ${timeoutResult} ms
  | Memory Mapped Size:    ${memoryMappedResult / 1024 / 1024} MiB`);
};
