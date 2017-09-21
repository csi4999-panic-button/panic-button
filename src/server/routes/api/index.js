"use strict";

const router = require("express").Router();

router.get("/", (req, res) => {
  res.status(200).send("API call");
});

module.exports = router;

