import crypto from "crypto";

export const generateSeed = (characterLength: number): string => {
  return crypto.randomBytes(characterLength / 2).toString("hex").toLocaleUpperCase();
};

export const hashSeed = (seed: string): string => {
   return crypto.createHash("sha256").update(seed).digest("hex");
};
