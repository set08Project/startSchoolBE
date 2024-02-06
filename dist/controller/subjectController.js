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
exports.deleteSchoolSubject = exports.viewSchoolSubjects = exports.updateSchoolSubjectTeacher = exports.updateSchoolSubjectTitle = exports.createSchoolSubject = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const mongoose_1 = require("mongoose");
const staffModel_1 = __importDefault(require("../model/staffModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const createSchoolSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { designated, subjectTeacherName, subjectTitle } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "classRooms",
        });
        const schoolSubj = yield schoolModel_1.default.findById(schoolID).populate({
            path: "subjects",
        });
        const getClassRooms = school === null || school === void 0 ? void 0 : school.classRooms.find((el) => {
            return el.className === designated;
        });
        const getClassRoomsSubj = schoolSubj === null || schoolSubj === void 0 ? void 0 : schoolSubj.subjects.some((el) => {
            return el.subjectTitle === subjectTitle;
        });
        const getClassRM = yield classroomModel_1.default.findOne({ className: designated });
        if (getClassRooms) {
            if (school && school.schoolName && school.status === "school-admin") {
                if (!getClassRoomsSubj) {
                    const subjects = yield subjectModel_1.default.create({
                        schoolName: school.schoolName,
                        subjectTeacherName,
                        subjectTitle,
                        designated,
                        classDetails: getClassRooms,
                    });
                    school.subjects.push(new mongoose_1.Types.ObjectId(subjects._id));
                    school.save();
                    getClassRM === null || getClassRM === void 0 ? void 0 : getClassRM.classSubjects.push(new mongoose_1.Types.ObjectId(subjects._id));
                    getClassRM === null || getClassRM === void 0 ? void 0 : getClassRM.save();
                    return res.status(201).json({
                        message: "subjects created successfully",
                        data: subjects,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "duplicate subject",
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
        else {
            return res.status(404).json({
                message: "Error finding school classroom",
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
exports.createSchoolSubject = createSchoolSubject;
const updateSchoolSubjectTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.updateSchoolSubjectTitle = updateSchoolSubjectTitle;
const updateSchoolSubjectTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, subjectID } = req.params;
        const { subjectTeacherName } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const getTeacher = yield staffModel_1.default.findOne({
            staffName: subjectTeacherName,
        });
        if (school && school.schoolName && school.status === "school-admin") {
            if (getTeacher) {
                const subjects = yield subjectModel_1.default.findByIdAndUpdate(subjectID, {
                    subjectTeacherName,
                }, { new: true });
                yield staffModel_1.default.findByIdAndUpdate(getTeacher._id, {
                    classesAssigned: getTeacher.subjectAssigned.push(subjects === null || subjects === void 0 ? void 0 : subjects.subjectTitle),
                }, { new: true });
                return res.status(201).json({
                    message: "subjects teacher updated successfully",
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
exports.updateSchoolSubjectTeacher = updateSchoolSubjectTeacher;
const viewSchoolSubjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const schoolSubject = yield schoolModel_1.default.findById(schoolID).populate({
            path: "subjects",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "School Subject found",
            status: 200,
            data: schoolSubject,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
});
exports.viewSchoolSubjects = viewSchoolSubjects;
const deleteSchoolSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, subjectID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const subjects = yield subjectModel_1.default.findByIdAndDelete(subjectID);
            school.subjects.pull(new mongoose_1.Types.ObjectId(subjects === null || subjects === void 0 ? void 0 : subjects._id));
            school.save();
            return res.status(201).json({
                message: "subjects  deleted successfully",
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
exports.deleteSchoolSubject = deleteSchoolSubject;
