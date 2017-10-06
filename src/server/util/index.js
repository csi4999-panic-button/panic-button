"use strict";

const crypto = require("crypto");

module.exports.getKey = (size) => {
    const buffer = crypto.randomBytes(size);
    const key = buffer.toString('hex');
    return key;
}