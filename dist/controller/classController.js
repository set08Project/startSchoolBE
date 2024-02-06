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
exports.deleteSchoolClass = exports.updateSchoolClassTeacher = exports.viewSchoolClasses = exports.updateSchoolClassesPerformance = exports.createSchoolClasses = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const createSchoolClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { classTeacherName, className } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const classes = yield classroomModel_1.default.create({
                schoolName: school.schoolName,
                classTeacherName,
                className,
            });
            school.classRooms.push(new mongoose_1.Types.ObjectId(classes._id));
            school.save();
            return res.status(201).json({
                message: "classes created successfully",
                data: classes,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
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
exports.createSchoolClasses = createSchoolClasses;
const updateSchoolClassesPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, subjectID } = req.params;
        const { subjectTitle } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const subjects = yield subjectModel_1.default.findByIdAndUpdate(subjectID, {
                subjectTitle,
            }, { new: true });
            return res.status(201).json({
                message: "subjects title updated successfully",
                data: subjects,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
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
exports.updateSchoolClassesPerformance = updateSchoolClassesPerformance;
const viewSchoolClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const schoolClasses = yield schoolModel_1.default.findById(schoolID).populate({
            path: "classRooms",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "School classes found",
            status: 200,
            data: schoolClasses,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class",
            status: 404,
            data: error.message,
        });
    }
});
exports.viewSchoolClasses = viewSchoolClasses;
const updateSchoolClassTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, classID } = req.params;
        const { classTeacherName } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const getTeacher = yield staffModel_1.default.findOne({
            staffName: classTeacherName,
        });
        if (school && school.schoolName && school.status === "school-admin") {
            if (getTeacher) {
                const subjects = yield classroomModel_1.default.findByIdAndUpdate(classID, {
                    classTeacherName,
                }, { new: true });
                yield staffModel_1.default.findByIdAndUpdate(getTeacher._id, {
                    classesAssigned: getTeacher.classesAssigned.push(subjects === null || subjects === void 0 ? void 0 : subjects.className),
                }, { new: true });
                return res.status(201).json({
                    message: "class teacher updated successfully",
                    data: subjects,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "unable to find school Teacher",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
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
exports.updateSchoolClassTeacher = updateSchoolClassTeacher;
const deleteSchoolClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, classID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const subjects = yield classroomModel_1.default.findByIdAndDelete(classID);
            school.classRooms.pull(new mongoose_1.Types.ObjectId(subjects === null || subjects === void 0 ? void 0 : subjects._id));
            school.save();
            return res.status(201).json({
                message: "class deleted successfully",
                data: subjects,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
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
exports.deleteSchoolClass = deleteSchoolClass;
