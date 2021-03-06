"use strict";

const mongoose = require("mongoose");
const Schools = require("./schools");

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

    currentTopic: { 
      type: Number,
      default: 0,
    },
    topics: { 
      type: [String],
      default: ["General"],
    },
}, {
    timestamps: true,
});


classroomSchema.methods.isTeacher = function (user) {
  return this.teachers.map(t => t.toString()).includes(user.id);
}

classroomSchema.methods.isTeacherAssistant = function (user) {
  return this.teacherAssistants.map(t => t.toString()).includes(user.id);
}

classroomSchema.methods.isStudent = function (user) {
  return this.students.map(t => t.toString()).includes(user.id);
}

classroomSchema.methods.sanitize = async function (user) {
  const out = this.toObject();

  out.questions = out.questions.map((question) => {
    question.mine = question.user.toString() === user.id;
    question.isTeacher = this.isTeacher({ id: question.user.toString() });
    question.voted = question.votes.filter(vote => vote.toString() === user._id.toString()).length > 0;
    question.answers = question.answers.map((answer) => {
      answer.mine = answer.user.toString() === user.id;
      answer.isTeacher = this.isTeacher({ id: answer.user.toString() });
      answer.voted = answer.votes.filter(vote => vote.toString() === user._id.toString()).length > 0;
      answer.isResolution = false;
      return answer;
    });
    if(question.resolution>-1) question.answers[question.resolution].isResolution = true;
    return question;
  });

  if (out.schoolId) {
    const thisClassSchool = await Schools.findById(out.schoolId);
    out.schoolName = thisClassSchool.name;
  }

  if (!this.isTeacher(user)) {
    // remove codes from classrooms where user
    // is not teacher
    delete out.teacherCode;
    delete out.taCode;

    out.questions = out.questions.map((question) => {
      delete question.user;
      question.answers = question.answers.map((answer) => {
        delete answer.user;
        return answer;
      });
      return question;
    });
  }

  if (this.isStudent(user)) {
    delete out.studentCode;
  }

  out.role = (this.isTeacher(user)) ? "teacher" :
    (this.isTeacherAssistant(user)) ? "teacherAssistant" :
    (this.isStudent(user)) ? "student" : null;

  return out;
}

module.exports = mongoose.model("Classroom", classroomSchema);

