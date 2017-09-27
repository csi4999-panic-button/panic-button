"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SALT_WORK_FACTOR = 12;

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  name: { type: String, required: true },
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
}

userSchema.loadClass(User);

module.exports = mongoose.model("User", userSchema);

