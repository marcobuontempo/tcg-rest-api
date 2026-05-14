import z from "zod";
import config from "../config/index.js";

export const OpenPackSchema = z.object(
  {
    params: z.strictObject(
      {
        pack_name: z.enum(
          Object.keys(config.packs.types),
          `'pack_name' must be one of: ${Object.keys(config.packs.types).join(", ")}`,
        ),
      },
      "invalid request params fields",
    ),
  },
  "invalid request fields",
);
