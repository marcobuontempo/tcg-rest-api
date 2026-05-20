import config from "../config/index.js";
import { Card } from "../database/models/card.model.js";

export type PackName = keyof typeof config.packs.types;
type PackContents = (typeof config.packs.types)[PackName];

type PackData = {
  cards: Card[];
  cumulativeDropRate: number;
  cost: number;
};

type PacksInformation = {
  name: PackName;
  contents: PackContents;
  cost: PackData["cost"];
};

export const packs = {
  data: new Map<PackName, PackData>(),
  information: new Array<PacksInformation>(),
};
