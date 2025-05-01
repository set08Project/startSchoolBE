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
exports.findSchoolOutGoneStudents = exports.viewSchoolOutGoneStudents = exports.createSchoolOutGoneStudent = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const outGoneStudentModel_1 = __importDefault(require("../model/outGoneStudentModel"));
const mongoose_1 = require("mongoose");
const createSchoolOutGoneStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, studentID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        const student = yield studentModel_1.default.findById(studentID);
        if (school && school.schoolName && school.status === "school-admin") {
            const checkFirst = (school === null || school === void 0 ? void 0 : school.students).some((el) => el.toString() === `${studentID}`);
            if (checkFirst) {
                const classes = yield outGoneStudentModel_1.default.create({
                    studentName: `${student === null || student === void 0 ? void 0 : student.studentFirstName} ${student === null || student === void 0 ? void 0 : student.studentLastName}`,
                    student: studentID,
                    schoolInfo: schoolID,
                });
                school.students = (school === null || school === void 0 ? void 0 : school.students).filter((id) => !id.equals(new mongoose_1.Types.ObjectId(studentID)));
                school === null || school === void 0 ? void 0 : school.outGoneStudents.push(new mongoose_1.Types.ObjectId(classes._id));
                school.save();
                return res.status(201).json({
                    message: "student added to outgoing list successfully",
                    data: classes,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "student not found",
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
            message: "Error creating school session",
            status: 404,
        });
    }
});
exports.createSchoolOutGoneStudent = createSchoolOutGoneStudent;
const viewSchoolOutGoneStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const announcement = yield schoolModel_1.default.findById(schoolID).populate({
            path: "outGoneStudents",
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
exports.viewSchoolOutGoneStudents = viewSchoolOutGoneStudents;
const findSchoolOutGoneStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { studentName } = req.body;
        const announcement = yield schoolModel_1.default
            .findById(schoolID)
            .populate({
            path: "outGoneStudents",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        })
            .find({ studentName });
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
exports.findSchoolOutGoneStudents = findSchoolOutGoneStudents;
