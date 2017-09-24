"use strict";

const router = require("express").Router();
const Users = require("../../models/users");
const passport = require("passport");

router.get("/", (req, res) => {
  res.status(200).send("API call");
});

router.get("/users", async (req, res) => {
  if (req.isAuthenticated()) {
    const users = await Users.find();
    res.json(users);
  } else {
    res.status(401).send();
  }
});

module.exports = router;

