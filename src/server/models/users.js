"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const util = require("../util");

const SALT_WORK_FACTOR = 12;

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: { unique: true } },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  apiToken: { type: String, default: getToken, unique: true, select: false },
  verified: { type: Boolean, default: false, required: true }
}, {
  timestamps: true,
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, SALT_WORK_FACTOR, function(err, hash) {
    if (err) { return next(err); }
    user.password = hash;
    next();
  })
});

class User {
  async validPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  validToken(token) {
    return token === this.apiToken;
  }

  async rotateToken() {
    this.token = getToken();
    return this.save();
  }
}

userSchema.loadClass(User);

function getToken() {
  return util.getKey(48);
}

module.exports = mongoose.model("User", userSchema);

