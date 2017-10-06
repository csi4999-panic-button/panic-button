"use strict";

const router = require("express").Router();
const passport = require("passport");
const Users = require("../models/users");

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ success: true, name: req.user.name });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.post("/register", async (req, res) => {
  try {
    const user = await Users.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "User already exists" });
  }
});

router.use("/api/v1", require("./api"));
router.use("/api/v1/classrooms", require("./api/classrooms"));

module.exports = router;

