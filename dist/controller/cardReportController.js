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
exports.studentReportRemark = exports.classTeacherReportRemark = exports.adminReportRemark = exports.updateReportScores = exports.createReportCardEntry = void 0;
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const mongoose_1 = require("mongoose");
const cardReportModel_1 = __importDefault(require("../model/cardReportModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const lodash_1 = __importDefault(require("lodash"));
const createReportCardEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { teacherID, studentID } = req.params;
        const { subject, test1, test2, test3, test4, exam } = req.body;
        const teacher = yield staffModel_1.default.findById(teacherID);
        const subjectData = yield subjectModel_1.default.findOne({
            subjectTitle: subject,
        });
        const school = yield schoolModel_1.default
            .findById(teacher === null || teacher === void 0 ? void 0 : teacher.schoolIDs)
            .populate({
            path: "session",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "reportCard",
        });
        const studentCheck = student === null || student === void 0 ? void 0 : student.reportCard.some((el) => {
            var _a, _b;
            return (el.classInfo ===
                `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_a = school === null || school === void 0 ? void 0 : school.session[0]) === null || _a === void 0 ? void 0 : _a.year}(${(_b = school === null || school === void 0 ? void 0 : school.session[0]) === null || _b === void 0 ? void 0 : _b.presentTerm})`);
        });
        // console.log(studentCheck);
        if (teacher && student) {
            if (studentCheck) {
                // check
                const getReportSubject = yield studentModel_1.default
                    .findById(studentID)
                    .populate({
                    path: "reportCard",
                });
                // console.log("read: ", getReportSubject);
                const getData = (_a = getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject.reportCard) === null || _a === void 0 ? void 0 : _a.find((el) => {
                    var _a, _b;
                    return (el.classInfo ===
                        `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_a = school === null || school === void 0 ? void 0 : school.session[0]) === null || _a === void 0 ? void 0 : _a.year}(${(_b = school === null || school === void 0 ? void 0 : school.session[0]) === null || _b === void 0 ? void 0 : _b.presentTerm})`);
                });
                const data = (_b = getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject.reportCard) === null || _b === void 0 ? void 0 : _b.find((el) => {
                    return el.result.find((el) => {
                        return el.subject === subject;
                    });
                });
                const dataFIle = (_c = getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject.reportCard) === null || _c === void 0 ? void 0 : _c.find((el) => {
                    return el.result.find((el) => {
                        return el.subject === subject;
                    });
                });
                const read = (_d = dataFIle === null || dataFIle === void 0 ? void 0 : dataFIle.result) === null || _d === void 0 ? void 0 : _d.find((el) => {
                    return el.subject === subject;
                });
                if (data) {
                    let mark = parseInt((!test1 ? read === null || read === void 0 ? void 0 : read[`1st Test`] : test1 ? test1 : 0) +
                        (!test2 ? read === null || read === void 0 ? void 0 : read[`2nd Test`] : test2 ? test2 : 0) +
                        (!test3 ? read === null || read === void 0 ? void 0 : read[`3rd Test`] : test3 ? test3 : 0) +
                        (!test4 ? read === null || read === void 0 ? void 0 : read[`4th Test`] : test4 ? test4 : 0) +
                        (!exam ? read === null || read === void 0 ? void 0 : read.exam : exam ? exam : 0));
                    let myTest1 = 0;
                    let myTest2 = 0;
                    let myTest3 = 0;
                    let myTest4 = 0;
                    let examination = 0;
                    // let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
                    // let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
                    // let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
                    // let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
                    // let w5 = x5 !== 0 ? (examination = 60) : 0;
                    if (test2 !== null && (read === null || read === void 0 ? void 0 : read[`2nd Test`])) {
                        myTest2 = 10;
                    }
                    else {
                        myTest2 = 0;
                    }
                    if (test3 !== null && (read === null || read === void 0 ? void 0 : read[`3rd Test`])) {
                        myTest3 = 10;
                    }
                    else {
                        myTest3 = 0;
                    }
                    if (test4 !== null && (read === null || read === void 0 ? void 0 : read[`4th Test`])) {
                        myTest4 = 10;
                    }
                    else {
                        myTest4 = 0;
                    }
                    if (exam !== null && (read === null || read === void 0 ? void 0 : read.exam)) {
                        examination = 60;
                    }
                    else {
                        examination = 0;
                    }
                    let score = myTest1 + myTest2 + myTest3 + myTest4 + examination;
                    console.log(score);
                    let updated = getData.result.filter((el) => {
                        return el.subject !== subject;
                    });
                    let total = lodash_1.default.sumBy(getData === null || getData === void 0 ? void 0 : getData.result, (el) => {
                        return el.mark;
                    });
                    let totalScore = lodash_1.default.sumBy(getData === null || getData === void 0 ? void 0 : getData.result, (el) => {
                        return el.score;
                    });
                    let sum = getData === null || getData === void 0 ? void 0 : getData.result.length;
                    let mainPoints = total / sum;
                    console.log(mainPoints, sum, totalScore, total);
                    let myGrade = (total / totalScore) * 100;
                    const report = yield cardReportModel_1.default.findByIdAndUpdate(getData === null || getData === void 0 ? void 0 : getData._id, {
                        result: [
                            ...updated,
                            {
                                subject: !subject ? read === null || read === void 0 ? void 0 : read.subject : subject,
                                "1st Test": !test1 ? read === null || read === void 0 ? void 0 : read[`1st Test`] : test1,
                                "2nd Test": !test2 ? read === null || read === void 0 ? void 0 : read[`2nd Test`] : test2,
                                "3rd Test": !test3 ? read === null || read === void 0 ? void 0 : read[`3rd Test`] : test3,
                                "4th Test": !test4 ? read === null || read === void 0 ? void 0 : read[`4th Test`] : test4,
                                exam: !exam ? read === null || read === void 0 ? void 0 : read.exam : exam,
                                points: parseFloat(((mark / score) * 100).toFixed(2)),
                                grade: (mark / score) * 100 >= 0 && (mark / score) * 100 <= 39
                                    ? "F"
                                    : (mark / score) * 100 >= 40 && (mark / score) * 100 <= 49
                                        ? "E"
                                        : (mark / score) * 100 >= 50 && (mark / score) * 100 <= 59
                                            ? "D"
                                            : (mark / score) * 100 >= 60 && (mark / score) * 100 <= 69
                                                ? "C"
                                                : (mark / score) * 100 >= 70 && (mark / score) * 100 <= 79
                                                    ? "B"
                                                    : (mark / score) * 100 >= 80 &&
                                                        (mark / score) * 100 <= 100
                                                        ? "A"
                                                        : null,
                            },
                        ],
                        points: parseFloat((lodash_1.default.sumBy(getData === null || getData === void 0 ? void 0 : getData.result, (el) => {
                            return el.points;
                        }) / (getData === null || getData === void 0 ? void 0 : getData.result.length)).toFixed(2)),
                        grade: myGrade >= 0 && myGrade <= 39
                            ? "F"
                            : myGrade >= 40 && myGrade <= 49
                                ? "E"
                                : myGrade >= 50 && myGrade <= 59
                                    ? "D"
                                    : myGrade >= 60 && myGrade <= 69
                                        ? "C"
                                        : myGrade >= 70 && myGrade <= 79
                                            ? "B"
                                            : myGrade >= 80 && myGrade <= 100
                                                ? "A"
                                                : null,
                    }, { new: true });
                    return res.status(201).json({
                        message: "teacher updated report successfully",
                        data: report,
                        status: 201,
                    });
                }
                else {
                    let mark = parseInt((!test1 ? read === null || read === void 0 ? void 0 : read[`1st Test`] : test1 ? test1 : 0) +
                        (!test2 ? read === null || read === void 0 ? void 0 : read[`2nd Test`] : test2 ? test2 : 0) +
                        (!test3 ? read === null || read === void 0 ? void 0 : read[`3rd Test`] : test3 ? test3 : 0) +
                        (!test4 ? read === null || read === void 0 ? void 0 : read[`4th Test`] : test4 ? test4 : 0) +
                        (!exam ? read === null || read === void 0 ? void 0 : read.exam : exam ? exam : 0));
                    let myTest1 = 0;
                    let myTest2 = 0;
                    let myTest3 = 0;
                    let myTest4 = 0;
                    let examination = 0;
                    // let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
                    // let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
                    // let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
                    // let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
                    // let w5 = x5 !== 0 ? (examination = 60) : 0;
                    // let score = w1 + w2 + w3 + w4 + w5;
                    let total = lodash_1.default.sumBy(getData === null || getData === void 0 ? void 0 : getData.result, (el) => {
                        return el.mark;
                    });
                    if (test4 !== null && (read === null || read === void 0 ? void 0 : read[`4th Test`])) {
                        myTest4 = 10;
                    }
                    else {
                        myTest4 = 0;
                    }
                    if (exam !== null && (read === null || read === void 0 ? void 0 : read[`exam`])) {
                        examination = 60;
                    }
                    else {
                        examination = 0;
                    }
                    let totalScore = lodash_1.default.sumBy(getData === null || getData === void 0 ? void 0 : getData.result, (el) => {
                        return el.score;
                    });
                    let score = myTest1 + myTest2 + myTest3 + myTest4 + examination;
                    let myGrade = (total / totalScore) * 100;
                    const report = yield cardReportModel_1.default.findByIdAndUpdate(getData === null || getData === void 0 ? void 0 : getData._id, {
                        result: [
                            ...getData.result,
                            {
                                subject: !subject ? read === null || read === void 0 ? void 0 : read.subject : subject,
                                "1st Test": !test1 ? read === null || read === void 0 ? void 0 : read[`1st Test`] : test1,
                                "2nd Test": !test2 ? read === null || read === void 0 ? void 0 : read[`2nd Test`] : test2,
                                "3rd Test": !test3 ? read === null || read === void 0 ? void 0 : read[`3rd Test`] : test3,
                                "4th Test": !test4 ? read === null || read === void 0 ? void 0 : read[`4th Test`] : test4,
                                exam: !exam ? read === null || read === void 0 ? void 0 : read.exam : exam,
                                points: parseFloat(((mark / score) * 100).toFixed(2)),
                                grade: (mark / score) * 100 >= 0 && (mark / score) * 100 <= 39
                                    ? "F"
                                    : (mark / score) * 100 >= 40 && (mark / score) * 100 <= 49
                                        ? "E"
                                        : (mark / score) * 100 >= 50 && (mark / score) * 100 <= 59
                                            ? "D"
                                            : (mark / score) * 100 >= 60 && (mark / score) * 100 <= 69
                                                ? "C"
                                                : (mark / score) * 100 >= 70 && (mark / score) * 100 <= 79
                                                    ? "B"
                                                    : (mark / score) * 100 >= 80 &&
                                                        (mark / score) * 100 <= 100
                                                        ? "A"
                                                        : null,
                            },
                        ],
                        points: parseFloat((lodash_1.default.sumBy(getData === null || getData === void 0 ? void 0 : getData.result, (el) => {
                            return el.points;
                        }) / (getData === null || getData === void 0 ? void 0 : getData.result.length)).toFixed(2)),
                        grade: myGrade >= 0 && myGrade <= 39
                            ? "F"
                            : myGrade >= 40 && myGrade <= 49
                                ? "E"
                                : myGrade >= 50 && myGrade <= 59
                                    ? "D"
                                    : myGrade >= 60 && myGrade <= 69
                                        ? "C"
                                        : myGrade >= 70 && myGrade <= 79
                                            ? "B"
                                            : myGrade >= 80 && myGrade <= 100
                                                ? "A"
                                                : null,
                    }, { new: true });
                    return res.status(201).json({
                        message: "can't report entry created successfully",
                        data: report,
                        status: 201,
                    });
                }
            }
            else {
                const report = yield cardReportModel_1.default.create({
                    result: [
                        {
                            subject,
                            "1st Test": test1,
                            "2nd Test": test2,
                            "3rd Test": test3,
                            "4th Test": test4,
                            exam,
                        },
                    ],
                    classInfo: `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_e = school === null || school === void 0 ? void 0 : school.session[0]) === null || _e === void 0 ? void 0 : _e.year}(${(_f = school === null || school === void 0 ? void 0 : school.session[0]) === null || _f === void 0 ? void 0 : _f.presentTerm})`,
                });
                student === null || student === void 0 ? void 0 : student.reportCard.push(new mongoose_1.Types.ObjectId(report._id));
                student === null || student === void 0 ? void 0 : student.save();
                subjectData === null || subjectData === void 0 ? void 0 : subjectData.recordData.push(new mongoose_1.Types.ObjectId(report._id));
                subjectData === null || subjectData === void 0 ? void 0 : subjectData.save();
                // school?.reportCard.push(new Types.ObjectId(report._id));
                // school?.save();
                return res.status(201).json({
                    message: "report entry created successfully",
                    data: { report, student },
                    status: 201,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "student and teacher doesn't exist for this class",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject report",
            data: error.message,
            status: 404,
        });
    }
});
exports.createReportCardEntry = createReportCardEntry;
const updateReportScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID, teacherID } = req.params;
        const { subject, test1, test2, test3, exam } = req.body;
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "reportCard",
        });
        const getReportSubject = student === null || student === void 0 ? void 0 : student.reportCard.find((el) => {
            var _a;
            return (_a = el === null || el === void 0 ? void 0 : el.result) === null || _a === void 0 ? void 0 : _a.find((el) => {
                return (el === null || el === void 0 ? void 0 : el.subject) === subject;
            });
        });
        const teacher = yield staffModel_1.default.findById(teacherID);
        if (teacher && student) {
            if (teacher) {
                const data = getReportSubject.result.find((el) => {
                    return el.subject === subject;
                });
                const report = yield cardReportModel_1.default.findByIdAndUpdate(getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject._id, {
                    result: [
                        {
                            subject: !subject ? data === null || data === void 0 ? void 0 : data.subject : subject,
                            "1st Test": !test1 ? data === null || data === void 0 ? void 0 : data[`1st Test`] : test1,
                            "2nd Test": !test2 ? data === null || data === void 0 ? void 0 : data[`2nd Test`] : test2,
                            "3rd Test": !test3 ? data === null || data === void 0 ? void 0 : data[`3rd Test`] : test3,
                            Exam: !exam ? exam : data === null || data === void 0 ? void 0 : data.exam,
                        },
                    ],
                }, { new: true });
                return res.status(201).json({
                    message: "teacher updated report successfully",
                    data: report,
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
exports.updateReportScores = updateReportScores;
const adminReportRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID, schoolID } = req.params;
        const { adminComment } = req.body;
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "reportCard",
        });
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "session",
        });
        const getReportSubject = student === null || student === void 0 ? void 0 : student.reportCard.find((el) => {
            var _a, _b;
            return ((el === null || el === void 0 ? void 0 : el.classInfo) ===
                `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_a = school === null || school === void 0 ? void 0 : school.session[0]) === null || _a === void 0 ? void 0 : _a.year}(${(_b = school === null || school === void 0 ? void 0 : school.session[0]) === null || _b === void 0 ? void 0 : _b.term})`);
        });
        if (school) {
            const report = yield cardReportModel_1.default.findByIdAndUpdate(getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject._id, {
                approve: true,
                adminComment,
            }, { new: true });
            return res.status(201).json({
                message: "admin report remark successfully",
                data: report,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to find school",
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
exports.adminReportRemark = adminReportRemark;
const classTeacherReportRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID, studentID, classID } = req.params;
        const { teacherComment } = req.body;
        const student = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "reportCard" });
        const classRM = yield classroomModel_1.default.findById(classID);
        const school = yield schoolModel_1.default
            .findById(student === null || student === void 0 ? void 0 : student.schoolIDs)
            .populate({
            path: "session",
        });
        const getReportSubject = student === null || student === void 0 ? void 0 : student.reportCard.find((el) => {
            return (el === null || el === void 0 ? void 0 : el.classInfo) === `JSS 1A session: 2024/2025(Second Term)`;
        });
        //  `${student?.classAssigned} session: ${school?.session[0]
        //           ?.year!}(${school?.session[0]?.presentTerm!})`
        const teacher = yield staffModel_1.default.findById(teacherID);
        if ((teacher === null || teacher === void 0 ? void 0 : teacher.classesAssigned) === (student === null || student === void 0 ? void 0 : student.classAssigned)) {
            const report = yield cardReportModel_1.default.findByIdAndUpdate(getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject._id, {
                classTeacherComment: teacherComment,
            }, { new: true });
            return res.status(201).json({
                message: "class Teacher report remark successfully",
                data: report,
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
            data: error.message,
        });
    }
});
exports.classTeacherReportRemark = classTeacherReportRemark;
const studentReportRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const student = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "reportCard" });
        return res.status(201).json({
            message: "class Teacher report grade",
            data: student,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            data: error.message,
        });
    }
});
exports.studentReportRemark = studentReportRemark;
