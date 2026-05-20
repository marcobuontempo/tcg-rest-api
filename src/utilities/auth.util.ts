import bcrypt from "bcrypt";
import config from "../config/index.js";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(
    password + config.auth.passwordPepper,
    config.auth.saltRounds,
  );
};

export const comparePasswords = async (password: string, hash: string) => {
  return bcrypt.compare(password + config.auth.passwordPepper, hash);
};
