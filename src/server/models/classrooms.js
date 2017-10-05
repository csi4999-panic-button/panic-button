"use strict";

const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
    id: { type: String, required: true, lowercase: true, index: { unique: true} },
    schoolName: { type: String, required: false },
    courseType: { type: String, required: false, lowercase: true },
    courseNumber: { type: String, required: false, lowercase: true },
    sectionNumber: { type: String, required: false, lowercase: true },
    courseTitle: { type: String, required: true },
    teachers: { type: [String], required: true, index: true },
    teacherAssistants: { type: [String], required: false, index: true },
    students: { type: [String], required: false, index: true }
}, {
    timestamps: true,
})

module.exports = mongoose.model("Classroom", classroomSchema);