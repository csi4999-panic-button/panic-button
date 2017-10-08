"use strict";

const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    address: { type: String, index: false },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    country: { type: String, required: true, index: false },
    zip: { type: Number, index: true },
    domain: { type: String }
}, {
    timestamps: true
});

class School {
    validEmail(email){
        return email.split("@")[1] === this.domain;
    }
}

schoolSchema.loadClass(School);

module.exports = mongoose.model("School", schoolSchema);