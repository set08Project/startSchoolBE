"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const performanceModel = new mongoose_1.Schema({
    quizID: {
        type: String,
    },
    remark: {
        type: String,
    },
    className: {
        type: String,
    },
    subjectTitle: {
        type: String,
    },
    studentName: {
        type: String,
    },
    subjectTeacher: {
        type: String,
    },
    studentGrade: {
        type: String,
    },
    studentScore: {
        type: Number,
    },
    performanceRating: {
        type: Number,
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
    quiz: {
        type: mongoose_1.Types.ObjectId,
        ref: "quizes",
    },
    subject: {
        type: mongoose_1.Types.ObjectId,
        ref: "subjects",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("performances", performanceModel);
