"use strict";

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BearerStrategy = require("passport-http-bearer").Strategy;
const Users = require("../models/users");

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Users.findById(id, "email name apiToken", function(err, user) {
    done(err, user);
  });
});

module.exports = {};
module.exports.local = new LocalStrategy({ usernameField: "email" },
    async function (email, password, done) {
      try {
        const user = await Users.findOne({ email }, ["password", "firstName", "lastName"]);

        if (!user) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        const valid = await user.validPassword(password);
        if (!valid) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    });

module.exports.token = new BearerStrategy(async (token, done) => {
  try {
    const user = await Users.findOne({ apiToken: token });
    if (!user) return done(null, false, { message: "Invalid token" });
    return done(null, user);
  } catch (err) {
    done(err);
  }
});
