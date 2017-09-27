"use strict";

const router = require("express").Router();
const passport = require("passport");

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ success: true, name: req.user.name });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.use("/api/v1", require("./api"));

module.exports = router;

