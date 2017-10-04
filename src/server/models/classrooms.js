"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: { unique: true } },
  password: { type: String, required: true, select: false },
  name: { type: String, required: true },
  apiToken: { type: String, default: getToken, unique: true, select: false },
}, {
  timestamps: true,
});

// invite codes need to be unique across all of them
// how to set unique for all of them?
// consider different length codes and requirements for string length?
const classroomSchema = new mongoose.Schema({
    id: { type: String, required: true, lowercase: true, index: { unique: true} },
    course_type: { type: String, required: true, lowercase: true },
    course_number: { type: String, required: true, lowercase: true },
    section_number: { type: String, required: false, lowercase: true },
    teachers: {
        ids: [String],
        code: {type: String, required: false, lowercase: true }
    },
    teacher_assistants: {
        ids: [String],
        code: {type: String, required: false, lowercase: true }
    },
    students: {
        ids: [String],
        code: {type: String, required: true, lowercase: true }
    }
}, {
    timestamps: true,
})

function getCode() {
    const buffer = crypto.randomBytes(24);
    const code = buffer.toString('hex');
    return code;
}