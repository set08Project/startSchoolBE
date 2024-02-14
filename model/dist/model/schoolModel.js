"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const schoolModel = new mongoose_2.Schema({
    started: {
        type: Boolean,
        default: false,
    },
    avatar: {
        type: String,
    },
    avatarID: {
        type: String,
    },
    address: {
        type: String,
    },
    plan: {
        type: String,
        default: "in active",
    },
    schoolName: {
        type: String,
    },
    status: {
        type: String,
    },
    enrollmentID: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    verify: {
        type: Boolean,
        default: false,
    },
    schoolTags: [
        {
            type: {},
        },
    ],
    session: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "sessions",
        },
    ],
    subjects: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "subjects",
        },
    ],
    classRooms: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "classes",
        },
    ],
    staff: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "staffs",
        },
    ],
    payments: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "payments",
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_2.model)("schools", schoolModel);
