"use strict";

const router = require("express").Router();
const passport = require("passport");
const Users = require("../models/users");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, messagee: "Incorrect email or password" });
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.json({ success: true, firstName: user.firstName, lastName: user.lastName });
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
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
    return res.status(400).json({ success: false, message: err });
  }
});

router.use("/api/v1", require("./api"));

module.exports = router;

