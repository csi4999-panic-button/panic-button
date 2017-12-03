"use strict";

const router = require("express").Router();
const Users = require("../../models/users");
const passport = require("passport");

router.get("/", (req, res) => {
  res.status(200).send("API call");
});

// router.post("/authenticate", async (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return res.json({ token: req.user.apiToken });
//   }
//   next();
// }, passport.authenticate("local"));

router.post("/authenticate", (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.json({ success: true, firstName: req.user.firstName, lastName: req.user.lastname, token: req.user.apiToken });
  }
  passport.authenticate("local", (authErr, user, info) => {
    if (authErr) { return next(authErr); }
    if (!user) { return res.status(401).json({ success: false }); }
    req.logIn(user, (loginErr) => {
      if (loginErr) { return next(loginErr); }
      return res.json({ success: true, firstName: user.firstName, lastName: user.lastName, token: user.apiToken });
    });
  })(req, res, next);
})

router.use((req, res, next) => {
  if (req.isAuthenticated()) return next();
  passport.authenticate("bearer", { session: false })(req, res, next);
});

router.get("/users", async (req, res) => {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    console.log(req.session);
    console.log(req.user);
    const users = await Users.find();
    res.json(users);
  } else {
    res.status(401).send();
  }
});

router.get("/users/me", async (req, res) => {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    console.log(req.session);
    console.log(req.user);
    const thisUser = await Users.findById(req.user.id);
    res.json(thisUser);
  } else {
    res.status(401).send();
  }
});

router.use("/classrooms", require("./classrooms"));
router.use("/schools", require("./schools"));

module.exports = router;

