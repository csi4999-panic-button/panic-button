"use strict";

const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
    schoolId: { type: "ObjectId", ref: "School" },
    courseType: { type: String },
    courseNumber: { type: String },
    sectionNumber: { type: String },
    courseTitle: { type: String, required: true },

    teachers: {
      type:[{ type: "ObjectId", ref: "User" }],
      required: true,
      index: true,
      default: [],
    },
    teacherAssistants: {
      type:[{ type: "ObjectId", ref: "User" }],
      index: true,
      default: [],
    },
    students: {
      type:[{ type: "ObjectId", ref: "User" }],
      index: true,
      default: [],
    },

    teacherCode: { type: "ObjectId", ref: "InviteCode" },
    taCode: { type: "ObjectId", ref: "InviteCode" },
    studentCode: { type: "ObjectId", ref: "InviteCode" }
}, {
    timestamps: true,
});


classroomSchema.methods.isTeacher = function (user) {
  return this.teachers.map(t => t.toString()).includes(user.id);
}

classroomSchema.methods.sanitize = function (user) {
  const out = this.toObject();
  if (!this.isTeacher(user)) {
    // remove codes from classrooms where user
    // is not teacher
    delete out.teacherCode;
    delete out.taCode;
    delete out.studentCode;
  } else {
    // make codes strings instead of objects
    out.teacherCode = this.teacherCode.code;
    out.taCode = this.taCode.code;
    out.studentCode = this.studentCode.code;
  }
  return out;
}

function populateCodes (next) {
  this.populate("teacherCode");
  this.populate("taCode");
  this.populate("studentCode");
  next();
}

classroomSchema.pre("find", populateCodes);
classroomSchema.pre("findOne", populateCodes);

module.exports = mongoose.model("Classroom", classroomSchema);

