"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const SALT_WORK_FACTOR = 12;

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: { unique: true } },
  password: { type: String, required: true, select: false },
  name: { type: String, required: true },
  apiToken: { type: String, default: getToken, unique: true, select: false },
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
  const buffer = crypto.randomBytes(48);
  const token = buffer.toString('hex');
  return token;
}

module.exports = mongoose.model("User", userSchema);

