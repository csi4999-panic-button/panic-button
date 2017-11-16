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

    teacherCode: String,
    taCode: String,
    studentCode: String,

    questions: [{
      user: { type: "ObjectId", ref: "User" },
      question: String,
      ts: Number,
      resolution: { type: Number, default: -1 },
      votes: {
        type: [{ type: "ObjectId", ref: "User" }],
        default: [],
      },
      answers: [{
        user: { type: "ObjectId", ref: "User" },
        answer: String,
        ts: Number,
        votes: {
          type: [{ type: "ObjectId", ref: "User" }],
          default: [],
        }
      }],
    }],
}, {
    timestamps: true,
});


classroomSchema.methods.isTeacher = function (user) {
  return this.teachers.map(t => t.toString()).includes(user.id);
}

classroomSchema.methods.sanitize = function (user) {
  const out = this.toObject();

  out.questions = out.questions.map((question) => {
    question.mine = question.user.toString() === user.id;
    question.isTeacher = this.isTeacher({ id: question.user.toString() });
    question.answers = question.answers.map((answer) => {
      answer.mine = answer.user.toString() === user.id;
      answer.isTeacher = this.isTeacher({ id: answer.user.toString() });
      return answer;
    });
    return question;
  });

  if (!this.isTeacher(user)) {
    // remove codes from classrooms where user
    // is not teacher
    delete out.teacherCode;
    delete out.taCode;
    delete out.studentCode;

    out.questions = out.questions.map((question) => {
      delete question.user;
      question.answers = question.answers.map((answer) => {
        delete answer.user;
        return answer;
      });
      return question;
    });
  }
  return out;
}

module.exports = mongoose.model("Classroom", classroomSchema);

