"use strict";

const crypto = require("crypto");

module.exports.getKey = (size) => {
    const buffer = crypto.randomBytes(size);
    const key = buffer.toString('hex');
    return key;
}

const inviteTypes = {
    1: "teacher",
    2: "teacherAssistant",
    3: "student"
}

module.exports.getInviteType = (n) => {
    return inviteTypes.n
}