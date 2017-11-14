"use strict";

const crypto = require("crypto");
const Classrooms = require("../models/classrooms");

module.exports.getKey = (size) => {
    const buffer = crypto.randomBytes(size);
    const key = buffer.toString('base64');
    return key;
};

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
};

module.exports.getMongoURI = () => {
  let mongoURI;
  if(process.env.MONGODB_PORT_27017_TCP_ADDR && process.env.MONGODB_PORT_27017_TCP_PORT){
    var userPass = ''
    if(process.env.MONGODB_USER && process.env.MONGODB_PASS){
      userPass = process.env.MONGODB_USER + ":" + process.env.MONGODB_PASS + "@";
    }
    if(process.env.MONGODB_AUTH_SRC && userPass){
      userPass = userPass + "?authSource=" + process.env.MONGODB_AUTH_SRC;
    }
    mongoURI = "mongodb://" + userPass + process.env.MONGODB_PORT_27017_TCP_ADDR + ":" + process.env.MONGODB_PORT_27017_TCP_PORT + "/panic-button"
  } else {
    mongoURI = "mongodb://localhost/panic-button";
  }
  return mongoURI;
}

module.exports.joinClassroomByInviteCode = async (code, userId) => {
  try {

    console.log("Code",code);
    console.log("UserId",userId);
    const classroom = await Classrooms.findOne({
      $or: [
      { teacherCode: code },
      { taCode: code },
      { studentCode: code },
      ],
    });

    if (!code || !classroom) {
      throw new Error("Classroom not found");
    }


    if (classroom.teacherCode === code) {
      await Classrooms.findByIdAndUpdate(classroom.id,
          { $addToSet: { teachers: userId } });
    } else if (classroom.taCode === code) {
      await Classrooms.findByIdAndUpdate(classroom.id,
          { $addToSet: { teacherAssistants: userId } });
    } else if (classroom.studentCode === code) {
      await Classrooms.findByIdAndUpdate(classroom.id,
          { $addToSet: { students: userId } });
    }

    return { success: true, message: "You successfully belong to the classroom" };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports.invalidBoolean = (type, val) => {
  return (val === null || val === undefined || typeof val !== type);
}