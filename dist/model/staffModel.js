"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const staffModel = new mongoose_1.Schema({
    complain: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "complains",
        },
    ],
    schoolIDs: {
        type: String,
    },
    gender: {
        type: String,
    },
    avatar: {
        type: String,
    },
    avatarID: {
        type: String,
    },
    salary: {
        type: Number,
    },
    schoolName: {
        type: String,
    },
    enrollmentID: {
        type: String,
    },
    email: {
        type: String,
    },
    staffAddress: {
        type: String,
    },
    activeStatus: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
    },
    staffAvatar: {
        type: String,
    },
    staffAvatarID: {
        type: String,
    },
    staffName: {
        type: String,
    },
    staffRole: {
        type: String,
    },
    staffRating: {
        type: Number,
        default: 0,
    },
    classesAssigned: {
        type: String,
    },
    subjectAssigned: {
        type: [],
    },
    schedule: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "timeTables",
        },
    ],
    assignment: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "assignments",
        },
    ],
    assignmentResolve: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "resolves",
        },
    ],
    reportCard: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "myReportCards",
        },
    ],
    attendance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "attendances",
        },
    ],
    lessonNotes: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "lessonNotes",
        },
    ],
    remark: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "remarks",
        },
    ],
    quiz: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "quizes",
        },
    ],
    phone: {
        type: String,
    },
    status: {
        type: String,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("staffs", staffModel);
