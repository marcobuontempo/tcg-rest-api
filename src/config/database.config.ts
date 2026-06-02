import { Options } from "sequelize";

const TIMEOUT = 5000;

export const database = {
  options: {
    dialect: "sqlite",
    storage: process.env.DB_LOCATION ?? "./data/database.sqlite",
    logging: process.env.BENCHMARK
      ? (sql: string, timing: number) => console.log(`[${timing}ms] ${sql}`)
      : false,
    benchmark: process.env.BENCHMARK,
    pool: {
      max: Number(process.env.DB_POOL_SIZE ?? 5),
      min: 1,
      idle: 10000,
    },
    timeout: TIMEOUT,
  } as Options,
  pragmas: {
    journalMode: "WAL", // [mode] Enable WAL Mode: allows concurrent reads during writes, drastically improving performance
    synchronous: "NORMAL", // [mode] Set NORMAL Sync: transactions are written to disk less frequently, improving performance
    journalSizeLimit: 67108864, // [bytes] Limit WAL File Size (64MiB): prevents WAL file from growing indefinitely, with checkpoints when exceeded
    cacheSize: 2000, // [pages] Checkpoint WAL every X pages: helps to control WAL growth
    busyTimeout: TIMEOUT, // [ms] Allow additional time until timeout is called, to reduce database lock errors
    memoryMapSize: 134217728, //[bytes] Enable memory-mapped IO (small gain in performance - larger size allocation has diminishing gains)
  },
};
