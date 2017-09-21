"use strict";

const router = require("express").Router();

router.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

router.use("/api/v1", require("./api"));

module.exports = router;

