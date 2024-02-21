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
exports.readTeacherSchedule = exports.readClassTimeTable = exports.createClassTimeTable = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const timetableModel_1 = __importDefault(require("../model/timetableModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const createClassTimeTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, classID } = req.params;
        const { subject, day, time } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const classRoom = yield classroomModel_1.default.findById(classID).populate({
            path: "classSubjects",
        });
        const checkForSubject = classRoom === null || classRoom === void 0 ? void 0 : classRoom.classSubjects.some((el) => {
            return el.subjectTitle === subject;
        });
        const findTeacher = yield staffModel_1.default.findById({
            _id: classRoom === null || classRoom === void 0 ? void 0 : classRoom.teacherID,
        });
        //  || "Assembly" || "Short Break" || "Long Break"
        if (school && school.schoolName && school.status === "school-admin") {
            if (checkForSubject) {
                const classes = yield timetableModel_1.default.create({
                    subject,
                    day,
                    time,
                });
                classRoom === null || classRoom === void 0 ? void 0 : classRoom.timeTable.push(new mongoose_1.Types.ObjectId(classes._id));
                classRoom === null || classRoom === void 0 ? void 0 : classRoom.save();
                findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.schedule.push(new mongoose_1.Types.ObjectId(classes._id));
                findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.save();
                return res.status(201).json({
                    message: "timetable entry created successfully",
                    data: classes,
                    status: 201,
                });
            }
            else if (subject === "Assembly" || "Short Break" || "Long Break") {
                const classes = yield timetableModel_1.default.create({
                    subject,
                    day,
                    time,
                });
                classRoom === null || classRoom === void 0 ? void 0 : classRoom.timeTable.push(new mongoose_1.Types.ObjectId(classes._id));
                classRoom === null || classRoom === void 0 ? void 0 : classRoom.save();
                return res.status(201).json({
                    message: "timetable entry created successfully",
                    data: classes,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Subject doesn't exist for this class",
                    status: 404,
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
            message: "Error creating class timetable",
            status: 404,
        });
    }
});
exports.createClassTimeTable = createClassTimeTable;
const readClassTimeTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID } = req.params;
        const timeTable = yield classroomModel_1.default.findById(classID).populate({
            path: "timeTable",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "timetable read successfully",
            data: timeTable,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating timetable",
            status: 404,
        });
    }
});
exports.readClassTimeTable = readClassTimeTable;
const readTeacherSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID } = req.params;
        const timeTable = yield staffModel_1.default
            .findById(teacherID)
            .populate({ path: "schedule" });
        return res.status(201).json({
            message: "scheule read successfully",
            data: timeTable,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating timetable",
            data: error.message,
            status: 404,
        });
    }
});
exports.readTeacherSchedule = readTeacherSchedule;
