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
const sessionModel_1 = __importDefault(require("../model/sessionModel"));
const mongoose_1 = require("mongoose");
const studentModel_1 = __importDefault(require("../model/studentModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const studentRemark_1 = __importDefault(require("../model/studentRemark"));
const createRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID, studentID } = req.params;
        const { remark } = req.body;
        const teacher = yield staffModel_1.default.findById(teacherID);
        const student = yield studentModel_1.default.findById(studentID);
        if (teacher) {
            const remarkData = yield studentRemark_1.default.create({
                remark,
            });
            teacher.remark.push(new mongoose_1.Types.ObjectId(remarkData._id));
            teacher.save();
            student.remark.push(new mongoose_1.Types.ObjectId(remarkData._id));
            student === null || student === void 0 ? void 0 : student.save();
            return res.status(201).json({
                message: "remark created successfully",
                data: remarkData,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
        });
    }
});
exports.createRemark = createRemark;
const viewStudentRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "remark",
        });
        return res.status(200).json({
            message: "viewing school remark",
            data: student === null || student === void 0 ? void 0 : student.remark,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
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
