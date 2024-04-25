"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSchoolPaynemtReceipt = exports.createSchoolPaynemtReceipt = exports.readSchoolEvent = exports.createSchoolEvent = exports.readSchoolAnnouncement = exports.createSchoolAnnouncement = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const announcementModel_1 = __importDefault(require("../model/announcementModel"));
const mongoose_1 = require("mongoose");
const eventModel_1 = __importDefault(require("../model/eventModel"));
const moment_1 = __importDefault(require("moment"));
const createSchoolAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { title, details, date } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "announcements",
        });
        if (school && school.schoolName && school.status === "school-admin") {
            const classes = yield announcementModel_1.default.create({
                title,
                details,
                date,
                status: "announcement",
            });
            school === null || school === void 0 ? void 0 : school.announcements.push(new mongoose_1.Types.ObjectId(classes._id));
            school.save();
            return res.status(201).json({
                message: "announcement created successfully",
                data: classes,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
});
exports.createSchoolAnnouncement = createSchoolAnnouncement;
const readSchoolAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const announcement = yield schoolModel_1.default.findById(schoolID).populate({
            path: "announcements",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "announcement read successfully",
            data: announcement,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school announcement",
            status: 404,
        });
    }
});
exports.readSchoolAnnouncement = readSchoolAnnouncement;
const createSchoolEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { title, details, date } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "events",
        });
        if (school && school.schoolName && school.status === "school-admin") {
            const event = yield eventModel_1.default.create({
                title,
                details,
                date,
                status: "event",
            });
            school === null || school === void 0 ? void 0 : school.events.push(new mongoose_1.Types.ObjectId(event._id));
            school.save();
            return res.status(201).json({
                message: "event created successfully",
                data: event,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
});
exports.createSchoolEvent = createSchoolEvent;
const readSchoolEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const announcement = yield schoolModel_1.default.findById(schoolID).populate({
            path: "events",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "events read successfully",
            data: announcement,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school announcement",
            status: 404,
        });
    }
});
exports.readSchoolEvent = readSchoolEvent;
const createSchoolPaynemtReceipt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { schoolID } = req.params;
        const { costPaid, paymentRef } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const confirm = (_a = school === null || school === void 0 ? void 0 : school.receipt) === null || _a === void 0 ? void 0 : _a.some((el) => {
            return el.paymentRef === paymentRef;
        });
        let arr = [];
        if (school && school.schoolName && school.status === "school-admin") {
            if (confirm) {
                const confirmData = (_b = school === null || school === void 0 ? void 0 : school.receipt) === null || _b === void 0 ? void 0 : _b.find((el) => el.paymentRef === paymentRef);
                return res.status(404).json({
                    message: "payment ref already used before",
                    data: confirmData,
                    status: 404,
                });
            }
            else {
                yield schoolModel_1.default.findByIdAndUpdate(school._id, {
                    receipt: [
                        ...school === null || school === void 0 ? void 0 : school.receipt,
                        { costPaid, paymentRef, date: (0, moment_1.default)(Date.now()).format("lll") },
                    ],
                }, { new: true });
                return res.status(201).json({
                    message: "paid created successfully",
                    data: school.receipt,
                    status: 201,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            data: error.message,
        });
    }
});
exports.createSchoolPaynemtReceipt = createSchoolPaynemtReceipt;
const readSchoolPaynemtReceipt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const announcement = yield schoolModel_1.default.findById(schoolID).populate({
            path: "events",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "events read successfully",
            data: announcement,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school announcement",
            status: 404,
        });
    }
});
exports.readSchoolPaynemtReceipt = readSchoolPaynemtReceipt;
