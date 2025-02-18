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
exports.termPerSession = exports.studentsPerSession = exports.viewStudentRemark = exports.createRemark = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const sessionModel_1 = __importDefault(require("../model/sessionModel"));
const mongoose_1 = require("mongoose");
const studentModel_1 = __importDefault(require("../model/studentModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const studentRemark_1 = __importDefault(require("../model/studentRemark"));
const moment_1 = __importDefault(require("moment"));
const email_1 = require("../utils/email");
const createRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID, studentID } = req.params;
        const { remark, weekPerformanceRatio, attendanceRatio, best, worst, classParticipation, sportParticipation, topicFocus, payment, announcement, generalPerformace, } = req.body;
        const teacher = yield staffModel_1.default.findById(teacherID);
        const student = yield studentModel_1.default.findById(studentID);
        const school = yield schoolModel_1.default.findById(teacher === null || teacher === void 0 ? void 0 : teacher.schoolIDs);
        if (teacher && student) {
            const fridayDate = Date.now();
            const readDate = (0, moment_1.default)(fridayDate).days();
            if (readDate === 5 || readDate === 6 || readDate === 4) {
                const remarkData = yield studentRemark_1.default.create({
                    remark,
                    weekPerformanceRatio,
                    attendanceRatio,
                    best,
                    worst,
                    classParticipation,
                    sportParticipation,
                    topicFocus,
                    payment,
                    announcement,
                    generalPerformace,
                });
                (0, email_1.sendWeeklyReport)(student, school, remarkData);
                student.remark.push(new mongoose_1.Types.ObjectId(remarkData._id));
                student === null || student === void 0 ? void 0 : student.save();
                teacher.remark.push(new mongoose_1.Types.ObjectId(remarkData._id));
                teacher.save();
                return res.status(201).json({
                    message: "remark created successfully",
                    data: remarkData,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Report can only be done on FRIDAYS or SATURDAYS",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating remake for Student",
            data: error.message,
        });
    }
});
exports.createRemark = createRemark;
const viewStudentRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "remark",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "viewing student weekly remark",
            data: student === null || student === void 0 ? void 0 : student.remark,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing students remarks",
            data: error.message,
        });
    }
});
exports.viewStudentRemark = viewStudentRemark;
const studentsPerSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionID } = req.params;
        const { totalStudents } = req.body;
        const session = yield sessionModel_1.default.findById(sessionID);
        if (session) {
            const students = yield sessionModel_1.default.findByIdAndUpdate(sessionID, { totalStudents }, { new: true });
            return res.status(200).json({
                message: "viewing session session",
                data: students,
            });
        }
        else {
            return res.status(404).json({
                message: "Error finding school session",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
});
exports.studentsPerSession = studentsPerSession;
const termPerSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionID } = req.params;
        const { term } = req.body;
        const session = yield sessionModel_1.default.findById(sessionID);
        if (session) {
            const students = yield sessionModel_1.default.findByIdAndUpdate(sessionID, { term }, { new: true });
            return res.status(200).json({
                message: "viewing session session",
                data: students,
            });
        }
        else {
            return res.status(404).json({
                message: "Error finding school session",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
});
exports.termPerSession = termPerSession;
