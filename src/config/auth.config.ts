export const auth = {
  saltRounds: Number(process.env.SALT_ROUNDS ?? 12),
  passwordPepper: process.env.PASSWORD_PEPPER ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "secret",
};
