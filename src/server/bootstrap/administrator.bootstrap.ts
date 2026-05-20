import config from "../../config/index.js";
import { Administrator } from "../../database/models/administrator.model.js";
import { comparePasswords, hashPassword } from "../../utilities/auth.util.js";

export const adminBootstrap = async () => {
  const adminCount = (await Administrator.count()) ?? 0;

  if (adminCount === 0) {
    const { username, password } = config.administrator.defaultCredentials;
    const hashedPassword = await hashPassword(password);
    await Administrator.create({
      username: username,
      password_hash: hashedPassword,
    });
    console.warn(
      `===== WARNING: no administrator account found - created default account (username: ${username}) - please login and change the password immediately! =====`,
    );
  }
};
