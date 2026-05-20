export const server = {
  timezone: process.env.TIMEZONE ?? "UTC",
  port: Number(process.env.PORT ?? 4000),
  env: process.env.NODE_ENV,
};
