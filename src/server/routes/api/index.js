"use strict";

const router = require("express").Router();
const Users = require("../../models/users");
const passport = require("passport");

router.get("/", (req, res) => {
  res.status(200).send("API call");
});

router.post("/authenticate", async (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.json({ token: req.user.apiToken });
  }
  next();
}, passport.authenticate("local"));

router.use((req, res, next) => {
  if (req.isAuthenticated()) return next();
  passport.authenticate("bearer", { session: false })(req, res, next);
});

router.get("/users", async (req, res) => {
  if (req.isAuthenticated()) {
    const users = await Users.find();
    res.json(users);
  } else {
    res.status(401).send();
  }
});

router.use("/classrooms", require("./classrooms"));
router.use("/schools", require("./schools"));

module.exports = router;

