"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const util = require("../util");

const classroomSchema = new mongoose.Schema({
    id: { type: String, lowercase: true, unique: true, default: getId },
    schoolName: { type: String, required: false },
    courseType: { type: String, required: false },
    courseNumber: { type: String, required: false },
    sectionNumber: { type: String, required: false },
    courseTitle: { type: String, required: true },
    teachers: { type: [String], required: true, index: true },
    teacherAssistants: { type: [String], required: false, index: true },
    students: { type: [String], required: false, index: true }
}, {
    timestamps: true,
})

function getId() {
    return util.getKey(24);
}

module.exports = mongoose.model("Classroom", classroomSchema);

