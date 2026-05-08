import express from "express";
import packagejson from "../../../package.json" with { type: "json" };

const router = express.Router();

router.get("/", (req, res, next) =>
  res.send({
    name: "REST API",
    description: packagejson.description,
    author: packagejson.author,
    version: packagejson.version,
  }),
);

export default router;
