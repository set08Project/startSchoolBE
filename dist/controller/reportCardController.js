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
exports.createStudentMidReportCard = exports.createStudentreportCard = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const reportCardModel_1 = __importDefault(require("../model/reportCardModel"));
const midReportCardModel_1 = __importDefault(require("../model/midReportCardModel"));
const createStudentreportCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, staffID, studentID } = req.params;
        const { newTermDate, date, principalRemark, teachersRemark, totalGrade, totalObtainableScore, toataTage, totalObtainedScore, classAVG, remarks, position, grade, totalScore, examScore, continuousAssesment, color, clubSociety, wt, ht, age, DOB, } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const staff = yield staffModel_1.default.findById(staffID);
        const student = yield studentModel_1.default.findById(studentID);
        // const hold = ;
        const classData = yield classroomModel_1.default.findOne({
            className: staff === null || staff === void 0 ? void 0 : staff.classesAssigned,
        });
        console.log("started here!");
        if (school && school.schoolName && staff && classData) {
            const report = yield reportCardModel_1.default.create({
                teacherName: staff === null || staff === void 0 ? void 0 : staff.staffName,
                classes: staff === null || staff === void 0 ? void 0 : staff.classesAssigned,
                // name: ,
                image: student === null || student === void 0 ? void 0 : student.avatar,
                classAVG,
                newTermDate,
                date,
                principalRemark,
                teachersRemark,
                totalGrade,
                totalObtainableScore,
                totalObtainedScore,
                remarks,
                position,
                grade,
                totalScore,
                examScore,
                continuousAssesment,
                color,
                clubSociety: "JET",
                wt: student === null || student === void 0 ? void 0 : student.weight,
                ht: student === null || student === void 0 ? void 0 : student.height,
                age: student === null || student === void 0 ? void 0 : student.age,
                DOB: student === null || student === void 0 ? void 0 : student.DoB,
                session: school === null || school === void 0 ? void 0 : school.session,
                toataTage,
            });
            school === null || school === void 0 ? void 0 : school.reportCard.push(new mongoose_1.Types.ObjectId(report === null || report === void 0 ? void 0 : report._id));
            school === null || school === void 0 ? void 0 : school.save();
            staff === null || staff === void 0 ? void 0 : staff.reportCard.push(new mongoose_1.Types.ObjectId(report === null || report === void 0 ? void 0 : report._id));
            staff === null || staff === void 0 ? void 0 : staff.save();
            student === null || student === void 0 ? void 0 : student.reportCard.push(new mongoose_1.Types.ObjectId(report === null || report === void 0 ? void 0 : report._id));
            student === null || student === void 0 ? void 0 : student.save();
            return res.status(201).json({
                message: "lesson report created",
                data: report,
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
            message: "Error creating lesson report",
            status: 404,
            data: error.message,
        });
    }
});
exports.createStudentreportCard = createStudentreportCard;
const createStudentMidReportCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, staffID, studentID } = req.params;
        const { newTermDate, date, principalRemark, teachersRemark, totalGrade, totalObtainableScore, toataTage, totalObtainedScore, classAVG, remarks, position, grade, totalScore, examScore, continuousAssesment, color, clubSociety, wt, ht, age, DOB, } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const staff = yield staffModel_1.default.findById(staffID);
        const student = yield studentModel_1.default.findById(studentID);
        // const hold = ;
        const classData = yield classroomModel_1.default.findOne({
            className: staff === null || staff === void 0 ? void 0 : staff.classesAssigned,
        });
        if (school && school.schoolName && staff && classData) {
            const report = yield midReportCardModel_1.default.create({
                teacherName: staff === null || staff === void 0 ? void 0 : staff.staffName,
                classes: staff === null || staff === void 0 ? void 0 : staff.classesAssigned,
                // name: ,
                image: student === null || student === void 0 ? void 0 : student.avatar,
                classAVG,
                newTermDate,
                date,
                principalRemark,
                teachersRemark,
                totalGrade,
                totalObtainableScore,
                totalObtainedScore,
                remarks,
                position,
                grade,
                totalScore,
                examScore,
                continuousAssesment,
                color,
                clubSociety: "JET",
                wt: student === null || student === void 0 ? void 0 : student.weight,
                ht: student === null || student === void 0 ? void 0 : student.height,
                age: student === null || student === void 0 ? void 0 : student.age,
                DOB: student === null || student === void 0 ? void 0 : student.DoB,
                session: school === null || school === void 0 ? void 0 : school.session,
                toataTage,
            });
            school === null || school === void 0 ? void 0 : school.reportCard.push(new mongoose_1.Types.ObjectId(report === null || report === void 0 ? void 0 : report._id));
            school === null || school === void 0 ? void 0 : school.save();
            staff === null || staff === void 0 ? void 0 : staff.reportCard.push(new mongoose_1.Types.ObjectId(report === null || report === void 0 ? void 0 : report._id));
            staff === null || staff === void 0 ? void 0 : staff.save();
            student === null || student === void 0 ? void 0 : student.reportCard.push(new mongoose_1.Types.ObjectId(report === null || report === void 0 ? void 0 : report._id));
            student === null || student === void 0 ? void 0 : student.save();
            return res.status(201).json({
                message: "mid report created",
                data: report,
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
            message: "Error creating lesson report",
            status: 404,
            data: error.message,
        });
    }
});
exports.createStudentMidReportCard = createStudentMidReportCard;
