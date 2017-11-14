"use strict";

const router = require("express").Router();
const passport = require("passport");
const Users = require("../models/users");
const util = require("../util");

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

// adds user to the listing for a classroom based on a given invite code
router.get("/join/:inviteCode([0-9A-Za-z+/=]+)", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }
  const ret = await util.joinClassroomByInviteCode(req.params.inviteCode,req.user._id);
  return (ret.success) ? res.redirect("/user-console") : res.status(400).json(ret);
});

router.use("/api/v1", require("./api"));

module.exports = router;

