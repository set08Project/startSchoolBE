"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cardRportModel = new mongoose_1.Schema({
    result: [
        {
            type: {},
        },
    ],
    approve: {
        type: Boolean,
        default: false,
    },
    points: {
        type: Number,
        default: 0,
    },
    classInfo: {
        type: String,
    },
    grade: {
        type: String,
        default: "Not Recorded Yet",
    },
    adminComment: {
        type: String,
    },
    classTeacherComment: {
        type: String,
    },
    student: {
        type: mongoose_1.Types.ObjectId,
        ref: "students",
    },
    classes: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("myReportCards", cardRportModel);
