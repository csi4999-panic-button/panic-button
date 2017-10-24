"use strict";

const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, index: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: Number },
    domain: { type: String }
}, {
    timestamps: true
});

class School {
    validEmail(email){
        return email.split("@", 2)[1] === this.domain;
    }
}

schoolSchema.loadClass(School);

module.exports = mongoose.model("School", schoolSchema);