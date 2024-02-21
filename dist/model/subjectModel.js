"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subjectModel = new mongoose_1.Schema({
    assignmentResolve: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "resolvs",
        },
    ],
    quiz: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "quizes",
        },
    ],
    assignment: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "assignments",
        },
    ],
    performance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "performances",
        },
    ],
    teacherID: {
        type: String,
    },
    schoolName: {
        type: String,
    },
    subjectTeacherName: {
        type: String,
    },
    subjectTitle: {
        type: String,
    },
    designated: {
        type: String,
    },
    classDetails: {
        type: {},
    },
    subjectPerformance: {
        type: Number,
        default: 0,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
    class: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("subjects", subjectModel);
