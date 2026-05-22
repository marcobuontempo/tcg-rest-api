import z from "zod";
import config from "../config/index.js";

const packTypes = Object.keys(config.packs.types).map((v) =>
  v.toLowerCase(),
) as [keyof typeof config.packs.types, ...(keyof typeof config.packs.types)[]];

export const OpenPackSchema = z.object(
  {
    params: z.strictObject(
      {
        pack_name: z.preprocess(
          (val) => (typeof val === "string" ? val.toLowerCase() : val),
          z.enum(
            packTypes,
            `'pack_name' must be one of: ${packTypes.join(", ")}`,
          ),
        ),
      },
      "invalid request params fields",
    ),
  },
  "invalid request fields",
);
