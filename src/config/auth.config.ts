export const auth = {
  saltRounds: process.env.SALT_ROUNDS ?? 12,
  passwordPepper: process.env.PASSWORD_PEPPER ?? "",
};
