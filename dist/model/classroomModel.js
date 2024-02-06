"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const classesModel = new mongoose_1.Schema({
    className: {
        type: String,
    },
    classTeacherName: {
        type: String,
    },
    classPerformance: {
        type: Number,
        default: 0,
    },
    classSubjects: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "subjects",
        },
    ],
    classAttendence: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "attendances",
        },
    ],
    classStudents: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "students",
        },
    ],
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("classes", classesModel);
