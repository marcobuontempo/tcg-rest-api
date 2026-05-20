import config from "../config/index.js";
import { Card } from "../database/models/card.model.js";
import { User } from "../database/models/user.model.js";

export const battle = {
  active: new Set<User["id"]>(),
  difficultyPools: new Map<number, Card["dataValues"][]>(),
};

