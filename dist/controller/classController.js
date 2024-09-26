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
exports.studentOfWeek = exports.viewClassTopStudent = exports.deleteSchoolClass = exports.updateSchoolClass1stFee = exports.updateSchoolClassTeacher = exports.updateSchoolClassName = exports.viewClassRM = exports.viewOneClassRM = exports.viewSchoolClasses = exports.viewSchoolClassesByName = exports.viewClassesBySubject = exports.viewClassesByStudent = exports.viewClassesByTimeTable = exports.updateSchoolClassesPerformance = exports.createSchoolClasses = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const lodash_1 = __importDefault(require("lodash"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
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
        if (school && school.status === "school-admin") {
            if (!checkClass) {
                const classes = yield classroomModel_1.default.create({
                    schoolName: school.schoolName,
                    classTeacherName,
                    className,
                    class2ndFee,
                    class3rdFee,
                    class1stFee,
                    presentTerm: school === null || school === void 0 ? void 0 : school.presentTerm,
                });
                school.historys.push(new mongoose_1.Types.ObjectId(classes._id));
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
            error,
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
const viewOneClassRM = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID } = req.params;
        const schoolClasses = yield classroomModel_1.default.findById(classID);
        return res.status(200).json({
            message: "School's class info found",
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
exports.viewOneClassRM = viewOneClassRM;
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
const updateSchoolClassName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, classID } = req.params;
        const { className } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const subjects = yield classroomModel_1.default.findByIdAndUpdate(classID, {
                className,
            }, { new: true });
            for (let i of school.students) {
                let student = yield studentModel_1.default.findById(i);
                if ((student === null || student === void 0 ? void 0 : student.presentClassID) === classID) {
                    yield studentModel_1.default.findByIdAndUpdate(i, { classAssigned: className }, { new: true });
                }
            }
            for (let i of school.staff) {
                let staff = yield staffModel_1.default.findById(i);
                if ((staff === null || staff === void 0 ? void 0 : staff.presentClassID) === classID) {
                    let myClass = staff === null || staff === void 0 ? void 0 : staff.classesAssigned.find((el) => {
                        return el.classID === classID;
                    });
                    myClass = { className, classID };
                    let xx = staff === null || staff === void 0 ? void 0 : staff.classesAssigned.filter((el) => {
                        return el.classID !== classID;
                    });
                    let subj = staff === null || staff === void 0 ? void 0 : staff.subjectAssigned.find((el) => {
                        return el.classID === classID;
                    });
                    subj = Object.assign(Object.assign({}, subj), { classMeant: className });
                    let yy = staff === null || staff === void 0 ? void 0 : staff.subjectAssigned.filter((el) => {
                        return el.classID !== classID;
                    });
                    console.log(staff === null || staff === void 0 ? void 0 : staff.subjectAssigned);
                    yield staffModel_1.default.findByIdAndUpdate(i, {
                        classesAssigned: [...xx, myClass],
                        subjectAssigned: [
                            ...staff === null || staff === void 0 ? void 0 : staff.subjectAssigned.filter((el) => {
                                return el.classID !== classID;
                            }),
                            subj,
                        ],
                    }, { new: true });
                }
            }
            for (let i of school.subjects) {
                let subject = yield subjectModel_1.default.findById(i);
                if ((subject === null || subject === void 0 ? void 0 : subject.subjectClassID) === classID) {
                    yield subjectModel_1.default.findByIdAndUpdate(i, { designated: className }, { new: true });
                }
            }
            return res.status(201).json({
                message: "class name updated successfully",
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
        console.log(error);
        return res.status(404).json({
            message: "Error creating updating class name",
            status: 404,
        });
    }
});
exports.updateSchoolClassName = updateSchoolClassName;
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
                    classesAssigned: [
                        ...getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.classesAssigned,
                        { className: subjects === null || subjects === void 0 ? void 0 : subjects.className, classID },
                    ],
                    presentClassID: classID,
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
const updateSchoolClass1stFee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, classID } = req.params;
        const { class1stFee, class2ndFee, class3rdFee } = req.body;
        // console.log(class1stFee);
        const school = yield schoolModel_1.default.findById(schoolID);
        const getClass = yield classroomModel_1.default.findById(classID);
        if (school && school.schoolName && school.status === "school-admin") {
            if (getClass) {
                const update = yield classroomModel_1.default.findByIdAndUpdate(getClass._id, {
                    class1stFee,
                    class2ndFee,
                    class3rdFee,
                }, { new: true });
                return res.status(201).json({
                    message: "class term fee updated successfully",
                    data: update,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "unable to find class",
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
            data: error.message,
        });
    }
});
exports.updateSchoolClass1stFee = updateSchoolClass1stFee;
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
const studentOfWeek = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID } = req.params;
        const { studentName, remark } = req.body;
        const teacher = yield staffModel_1.default.findById(teacherID);
        const classRM = yield classroomModel_1.default
            .findById(teacher === null || teacher === void 0 ? void 0 : teacher.presentClassID)
            .populate({
            path: "students",
        });
        const getStudent = classRM === null || classRM === void 0 ? void 0 : classRM.students.find((el) => {
            return (`${el.studentFirstName}` === studentName.trim().split(" ")[0] &&
                `${el.studentLastName}` === studentName.trim().split(" ")[1]);
        });
        const studentData = yield studentModel_1.default.findById(getStudent === null || getStudent === void 0 ? void 0 : getStudent._id);
        if ((teacher === null || teacher === void 0 ? void 0 : teacher.status) === "school-teacher" && classRM && studentData) {
            const week = yield classroomModel_1.default.findByIdAndUpdate(classRM === null || classRM === void 0 ? void 0 : classRM._id, {
                weekStudent: {
                    student: studentData,
                    remark,
                },
            }, { new: true });
            return res.status(201).json({
                message: "student of the week awarded",
                status: 201,
                data: week,
            });
        }
        else {
            return res.status(404).json({
                message: "student 2nd fees not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
});
exports.studentOfWeek = studentOfWeek;
