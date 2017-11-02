"use strict";

const mongoose = require("mongoose");

const RE_EMAIL = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, index: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: Number },
    domain: { type: String },
  },
  {
    timestamps: true,
  },
);

class School {
  validEmail(email) {
    return RE_EMAIL.test(email);
  }
}

schoolSchema.loadClass(School);

module.exports = mongoose.model("School", schoolSchema);
