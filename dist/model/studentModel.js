"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const studentModel = new mongoose_1.Schema({
    feesPaid1st: {
        type: Boolean,
        default: false,
    },
    monitor: {
        type: Boolean,
        default: false,
    },
    records: {
        type: (Array),
    },
    classTermFee: {
        type: Number,
    },
    feesPaid2nd: {
        type: Boolean,
        default: false,
    },
    feesPaid3rd: {
        type: Boolean,
        default: false,
    },
    schoolIDs: {
        type: String,
    },
    presentClassID: {
        type: String,
    },
    avatar: {
        type: String,
    },
    avatarID: {
        type: String,
    },
    password: {
        type: String,
    },
    studentFirstName: {
        type: String,
    },
    studentLastName: {
        type: String,
    },
    totalPerformance: {
        type: Number,
    },
    classAssigned: {
        type: String,
    },
    gender: {
        type: String,
    },
    email: {
        type: String,
    },
    parentEmail: {
        type: String,
        default: "",
    },
    schoolName: {
        type: String,
    },
    started: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
    },
    enrollmentID: {
        type: String,
    },
    schoolID: {
        type: String,
    },
    studentAddress: {
        type: String,
    },
    studentAvatar: {
        type: String,
    },
    studentAvatarID: {
        type: String,
    },
    phone: {
        type: String,
    },
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
    classroom: {
        type: mongoose_1.Types.ObjectId,
        ref: "classes",
    },
    attendance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "attendances",
        },
    ],
    history: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "historys",
        },
    ],
    performance: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "performances",
            default: [],
        },
    ],
    assignmentResolve: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "resolvs",
        },
    ],
    remark: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "remakes",
        },
    ],
    articles: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "articles",
        },
    ],
    complain: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "complains",
        },
    ],
    reportCard: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "myReportCards",
        },
    ],
    pastQuestionHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "pquestions",
        },
    ],
    purchaseHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "purchasedHistories",
        },
    ],
    schoolFeesHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "schoolFeesHistories",
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("students", studentModel);
