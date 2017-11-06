"use strict";

const router = require("express").Router();
const passport = require("passport");
const Users = require("../models/users");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.json({ success: false });
    return res.json({ success: true, firstName: user.firstName, lastName: user.lastName });
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
    return res.status(400).json({ message: err });
  }
});

router.use("/api/v1", require("./api"));

module.exports = router;

