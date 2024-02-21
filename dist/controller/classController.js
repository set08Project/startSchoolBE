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
exports.viewClassTopStudent = exports.deleteSchoolClass = exports.updateSchoolClassTeacher = exports.viewClassRM = exports.viewSchoolClasses = exports.viewSchoolClassesByName = exports.viewClassesBySubject = exports.viewClassesByStudent = exports.viewClassesByTimeTable = exports.updateSchoolClassesPerformance = exports.createSchoolClasses = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const lodash_1 = __importDefault(require("lodash"));
const createSchoolClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { classTeacherName, className, class2ndFee, class3rdFee, class1stFee, } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "classRooms",
        });
        const checkClass = school === null || school === void 0 ? void 0 : school.classRooms.some((el) => {
            return el.className === className;
        });
        if (school && school.schoolName && school.status === "school-admin") {
            if (!checkClass) {
                const classes = yield classroomModel_1.default.create({
                    schoolName: school.schoolName,
                    classTeacherName,
                    className,
                    class2ndFee,
                    class3rdFee,
                    class1stFee,
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
                    message: "duplicated class name",
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
const viewClassesByTimeTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID } = req.params;
        const schoolClasses = yield classroomModel_1.default.findById(classID).populate({
            path: "timeTable",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "finding classes by TimeTable",
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
exports.viewClassesByTimeTable = viewClassesByTimeTable;
const viewClassesByStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID } = req.params;
        const schoolClasses = yield classroomModel_1.default.findById(classID).populate({
            path: "students",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "finding class students",
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
exports.viewClassesByStudent = viewClassesByStudent;
const viewClassesBySubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID } = req.params;
        const schoolClasses = yield classroomModel_1.default.findById(classID).populate({
            path: "classSubjects",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "finding classes by Name",
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
exports.viewClassesBySubject = viewClassesBySubject;
const viewSchoolClassesByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { className } = req.body;
        const schoolClasses = yield classroomModel_1.default.findOne({ className }).populate({
            path: "classSubjects",
        });
        return res.status(200).json({
            message: "finding classes by Name",
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
exports.viewSchoolClassesByName = viewSchoolClassesByName;
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
const viewClassRM = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID } = req.params;
        const schoolClasses = yield classroomModel_1.default.findById(classID).populate({
            path: "classSubjects",
        });
        return res.status(200).json({
            message: "School classes info found",
            status: 200,
            data: schoolClasses,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class info",
            status: 404,
            data: error.message,
        });
    }
});
exports.viewClassRM = viewClassRM;
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
                    teacherID: getTeacher._id,
                }, { new: true });
                yield staffModel_1.default.findByIdAndUpdate(getTeacher._id, {
                    classesAssigned: subjects === null || subjects === void 0 ? void 0 : subjects.className,
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
const viewClassTopStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID } = req.params;
        const schoolClasses = yield classroomModel_1.default.findById(classID).populate({
            path: "students",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        const rate = lodash_1.default.orderBy(schoolClasses === null || schoolClasses === void 0 ? void 0 : schoolClasses.students, ["totalPerformance"], ["desc"]);
        return res.status(200).json({
            message: "finding class students top performance!",
            status: 200,
            data: rate,
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
exports.viewClassTopStudent = viewClassTopStudent;
