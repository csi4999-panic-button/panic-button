"use strict";

const router = require("express").Router();
const passport = require("passport");
const Users = require("../models/users");

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ success: true, firstName: req.user.firstName, lastName: req.user.lastName });
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
      firstName: req.body.firstName,
      lastName: req.body.lastName
    });

    return res.json(user);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
});

router.use("/api/v1", require("./api"));

module.exports = router;

