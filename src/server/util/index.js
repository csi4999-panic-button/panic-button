"use strict";

const crypto = require("crypto");

const inviteTypes = {
    1: "teacher",
    2: "teacherAssistant",
    3: "student"
}

module.exports.getInviteType = (n) => inviteTypes.n

module.exports.getKey = (size) => {
    const buffer = crypto.randomBytes(size);
    const key = buffer.toString('base64');
    return key;
}

module.exports.getKeyAsync = (size, cb) => {
  const p = new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer);
    });
  })
  .then((buffer) => {
    const key = buffer.toString("base64");
    if (cb) {
      return cb(null, key);
    }
    return key;
  })
  .catch((err) => {
    if (cb) {
      return cb(err);
    }
    throw err;
  });

  if (!cb) return p;
  return null;
}

