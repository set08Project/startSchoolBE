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
exports.viewClassStudentAttendance = exports.viewStudentAttendance = exports.viewStudentAttendanceByTeacher = exports.createAttendanceAbsentMark = exports.createAttendanceAbsent = exports.createAttendancePresent = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const attendanceModel_1 = __importDefault(require("../model/attendanceModel"));
const moment_1 = __importDefault(require("moment"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const createAttendancePresent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getTeacher = yield staffModel_1.default.findById(req.params.teacherID);
        const getStudent = yield studentModel_1.default.findById(req.params.studentID);
        const getClass = yield classroomModel_1.default.findById(getStudent === null || getStudent === void 0 ? void 0 : getStudent.presentClassID);
        if (getTeacher && getStudent) {
            const code = crypto_1.default.randomBytes(2).toString("hex");
            const dater = Date.now();
            const getDateTime = yield attendanceModel_1.default.find();
            const checkDate = getDateTime.find((el) => {
                return (el.dateTime ===
                    `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}` &&
                    el.studentFirstName === getStudent.studentFirstName &&
                    el.studentLastName === getStudent.studentLastName);
            });
            if (checkDate) {
                if (!(checkDate === null || checkDate === void 0 ? void 0 : checkDate.present)) {
                    yield attendanceModel_1.default.findByIdAndUpdate(checkDate === null || checkDate === void 0 ? void 0 : checkDate._id, {
                        present: true,
                        absent: false,
                    }, { new: true });
                }
                else {
                    yield attendanceModel_1.default.findByIdAndUpdate(checkDate === null || checkDate === void 0 ? void 0 : checkDate._id, {
                        present: false,
                        absent: true,
                    }, { new: true });
                }
                return res.status(201).json({
                    message: "student has been Attendance has been updated successfully",
                    data: checkDate,
                });
            }
            else {
                const attendance = yield attendanceModel_1.default.create({
                    className: getStudent.classAssigned,
                    classToken: code,
                    present: true,
                    absent: null,
                    studentFirstName: getStudent.studentFirstName,
                    studentLastName: getStudent.studentLastName,
                    classTeacher: getTeacher.staffName,
                    dateTime: `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}`,
                    date: `${(0, moment_1.default)(dater).format("dddd")}`,
                });
                getTeacher.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.save();
                getClass.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getClass === null || getClass === void 0 ? void 0 : getClass.save();
                getStudent.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getStudent === null || getStudent === void 0 ? void 0 : getStudent.save();
                return res.status(201).json({
                    message: "student attendance has been marked for today",
                    data: attendance,
                });
            }
        }
        else {
            return res.status(404).json({ message: "student can't be found" });
        }
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
});
exports.createAttendancePresent = createAttendancePresent;
const createAttendanceAbsent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getTeacher = yield staffModel_1.default.findById(req.params.teacherID);
        const getStudent = yield studentModel_1.default.findById(req.params.studentID);
        const getClass = yield classroomModel_1.default.findById(getStudent === null || getStudent === void 0 ? void 0 : getStudent.presentClassID);
        if (getTeacher && getStudent) {
            const code = crypto_1.default.randomBytes(2).toString("hex");
            const dater = Date.now();
            const getDateTime = yield attendanceModel_1.default.find();
            const checkDate = getDateTime.find((el) => {
                return (el.dateTime ===
                    `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}` &&
                    el.studentFirstName === getStudent.studentFirstName &&
                    el.studentLastName === getStudent.studentLastName);
            });
            if (checkDate) {
                if (!(checkDate === null || checkDate === void 0 ? void 0 : checkDate.present)) {
                    yield attendanceModel_1.default.findByIdAndUpdate(checkDate === null || checkDate === void 0 ? void 0 : checkDate._id, {
                        present: true,
                        absent: false,
                    }, { new: true });
                }
                else {
                    yield attendanceModel_1.default.findByIdAndUpdate(checkDate === null || checkDate === void 0 ? void 0 : checkDate._id, {
                        present: false,
                        absent: true,
                    }, { new: true });
                }
                return res.status(201).json({
                    message: "student has been Attendance has been updated successfully",
                    data: checkDate,
                });
            }
            else {
                const attendance = yield attendanceModel_1.default.create({
                    className: getStudent.classAssigned,
                    classToken: code,
                    present: false,
                    absent: true,
                    studentFirstName: getStudent.studentFirstName,
                    studentLastName: getStudent.studentLastName,
                    classTeacher: getTeacher.staffName,
                    dateTime: `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}`,
                    date: `${(0, moment_1.default)(dater).format("dddd")}`,
                });
                getTeacher.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.save();
                getClass.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getClass === null || getClass === void 0 ? void 0 : getClass.save();
                getStudent.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                getStudent === null || getStudent === void 0 ? void 0 : getStudent.save();
                return res.status(201).json({
                    message: "student attendance has been marked Absent for today",
                    data: attendance,
                });
            }
        }
        else {
            return res.status(404).json({ message: "student can't be found" });
        }
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
});
exports.createAttendanceAbsent = createAttendanceAbsent;
const createAttendanceAbsentMark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getTeacher = yield staffModel_1.default.findById(req.params.teacherID);
        const getStudent = yield studentModel_1.default.findById(req.params.studentID);
        const getClass = yield classroomModel_1.default.findById(getStudent === null || getStudent === void 0 ? void 0 : getStudent.presentClassID);
        if (getTeacher && getStudent) {
            const code = crypto_1.default.randomBytes(2).toString("hex");
            const dater = Date.now();
            const attendance = yield attendanceModel_1.default.create({
                className: getStudent.classAssigned,
                classToken: code,
                present: null,
                absent: true,
                studentFirstName: getStudent.studentFirstName,
                studentLastName: getStudent.studentLastName,
                classTeacher: getTeacher.staffName,
                dateTime: `${(0, moment_1.default)(dater).format("dddd")}, ${(0, moment_1.default)(dater).format("MMMM Do YYYY")}`,
                date: `${(0, moment_1.default)(dater).format("dddd")}`,
            });
            getTeacher.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
            getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.save();
            getClass.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
            getClass === null || getClass === void 0 ? void 0 : getClass.save();
            getStudent.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
            getStudent === null || getStudent === void 0 ? void 0 : getStudent.save();
            return res.status(201).json({
                message: "student has been marked Present for today",
                data: attendance,
            });
        }
        else {
            return res.status(404).json({ message: "student can't be found" });
        }
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
});
exports.createAttendanceAbsentMark = createAttendanceAbsentMark;
const viewStudentAttendanceByTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attendance = yield classroomModel_1.default
            .findById(req.params.teacherID)
            .populate({
            path: "attendance",
            options: { sort: { createdAt: -1 } },
        });
        return res.status(200).json({
            message: `Viewing attendance attendance detail...!`,
            data: attendance,
        });
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
});
exports.viewStudentAttendanceByTeacher = viewStudentAttendanceByTeacher;
const viewStudentAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield studentModel_1.default.findById(req.params.studentID).populate({
            path: "attendance",
            options: { sort: { createdAt: -1 } },
        });
        return res.status(200).json({
            message: `Viewing student attendance detail...!`,
            data: student,
        });
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
});
exports.viewStudentAttendance = viewStudentAttendance;
const viewClassStudentAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield classroomModel_1.default.findById(req.params.classID).populate({
            path: "attendance",
            options: { sort: { createdAt: -1 } },
        });
        return res.status(200).json({
            message: `Viewing student attendance detail...!`,
            data: student,
        });
    }
    catch (error) {
        return res.status(404).json({ message: `Error: ${error}` });
    }
});
exports.viewClassStudentAttendance = viewClassStudentAttendance;
