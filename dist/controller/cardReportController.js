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
const createReportCardEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { teacherID, studentID } = req.params;
        const { subject, test1, test2, test3, test4, exam } = req.body;
        const teacher = yield staffModel_1.default.findById(teacherID);
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
        const subjectData = yield subjectModel_1.default.findOne({ subjectTitle: subject });
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
                const read = dataFIle === null || dataFIle === void 0 ? void 0 : dataFIle.result.find((el) => {
                    return el.subject === subject;
                });
                if (data) {
                    //  = parseInt(
                    //   (!test1 ? read?.[`1st Test`] : test1 ? test1 : 0) +
                    //     (!test2 ? read?.[`2nd Test`] : test2 ? test2 : 0) +
                    //     (!test3 ? read?.[`3rd Test`] : test3 ? test3 : 0) +
                    //     (!test4 ? read?.[`4th Test`] : test4 ? test4 : 0) +
                    //     (!exam ? read?.exam : exam ? exam : 0)
                    // );
                    let x1 = !test1 ? read === null || read === void 0 ? void 0 : read.test1 : test1 ? test1 : 0;
                    let x2 = !test2 ? read === null || read === void 0 ? void 0 : read.test2 : test2 ? test2 : 0;
                    let x3 = !test3 ? read === null || read === void 0 ? void 0 : read.test3 : test3 ? test3 : 0;
                    let x4 = !test4 ? read === null || read === void 0 ? void 0 : read.test4 : test4 ? test4 : 0;
                    let x5 = !exam ? read === null || read === void 0 ? void 0 : read.exam : exam ? exam : 0;
                    let y1 = x1 !== null ? x1 : 0;
                    let y2 = x2 !== null ? x2 : 0;
                    let y3 = x3 !== null ? x3 : 0;
                    let y4 = x4 !== null ? x4 : 0;
                    let y5 = x5 !== null ? x5 : 0;
                    let mark = y1 + y2 + y3 + y4 + y5;
                    let myTest1;
                    let myTest2;
                    let myTest3;
                    let myTest4;
                    let examination;
                    if (test1 !== null && (read === null || read === void 0 ? void 0 : read.test1)) {
                        myTest1 = 10;
                    }
                    else {
                        myTest1 = 0;
                    }
                    if (test2 !== null && (read === null || read === void 0 ? void 0 : read.test2)) {
                        myTest2 = 10;
                    }
                    else {
                        myTest2 = 0;
                    }
                    if (test3 !== null && (read === null || read === void 0 ? void 0 : read.test3)) {
                        myTest3 = 10;
                    }
                    else {
                        myTest3 = 0;
                    }
                    if (test4 !== null && (read === null || read === void 0 ? void 0 : read.test4)) {
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
                    // console.log(score, mark);
                    // console.log(score, mark);
                    // console.log("hmm: ", mark / score);
                    let updated = getData.result.filter((el) => {
                        return el.subject !== subject;
                    });
                    const report = yield cardReportModel_1.default.findByIdAndUpdate(getData === null || getData === void 0 ? void 0 : getData._id, {
                        result: [
                            ...updated,
                            {
                                subject: !subject ? read === null || read === void 0 ? void 0 : read.subject : subject,
                                test1: y1,
                                test2: y2,
                                test3: y3,
                                test4: y4,
                                exam: y5,
                                mark,
                                score,
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
                    }, { new: true });
                    return res.status(201).json({
                        message: "teacher updated report successfully",
                        data: report,
                        status: 201,
                    });
                }
                else {
                    // let mark = parseInt(
                    //   (!test1 ? read?.[`1st Test`] : test1 ? test1 : 0) +
                    //     (!test2 ? read?.[`2nd Test`] : test2 ? test2 : 0) +
                    //     (!test3 ? read?.[`3rd Test`] : test3 ? test3 : 0) +
                    //     (!test4 ? read?.[`4th Test`] : test4 ? test4 : 0) +
                    //     (!exam ? read?.exam : exam ? exam : 0)
                    // );
                    let x1 = !test1 ? read === null || read === void 0 ? void 0 : read.test1 : test1 ? test1 : 0;
                    let x2 = !test2 ? read === null || read === void 0 ? void 0 : read.test2 : test2 ? test2 : 0;
                    let x3 = !test3 ? read === null || read === void 0 ? void 0 : read.test3 : test3 ? test3 : 0;
                    let x4 = !test4 ? read === null || read === void 0 ? void 0 : read.test4 : test4 ? test4 : 0;
                    let x5 = !exam ? read === null || read === void 0 ? void 0 : read.exam : exam ? exam : 0;
                    let y1 = x1 !== null ? x1 : 0;
                    let y2 = x2 !== null ? x2 : 0;
                    let y3 = x3 !== null ? x3 : 0;
                    let y4 = x4 !== null ? x4 : 0;
                    let y5 = x5 !== null ? x5 : 0;
                    let mark = y1 + y2 + y3 + y4 + y5;
                    let myTest1;
                    let myTest2;
                    let myTest3;
                    let myTest4;
                    let examination;
                    if (test1 !== null && (read === null || read === void 0 ? void 0 : read.test1)) {
                        myTest1 = 10;
                    }
                    else {
                        myTest1 = 0;
                    }
                    if (test2 !== null && (read === null || read === void 0 ? void 0 : read.test2)) {
                        myTest2 = 10;
                    }
                    else {
                        myTest2 = 0;
                    }
                    if (test3 !== null && (read === null || read === void 0 ? void 0 : read.test3)) {
                        myTest3 = 10;
                    }
                    else {
                        myTest3 = 0;
                    }
                    if (test4 !== null && (read === null || read === void 0 ? void 0 : read.test4)) {
                        myTest4 = 10;
                    }
                    else {
                        myTest4 = 0;
                    }
                    if (exam !== null && (read === null || read === void 0 ? void 0 : read.exam)) {
                        examination = 70;
                    }
                    else {
                        examination = 0;
                    }
                    let score = myTest1 + myTest2 + myTest3 + myTest4 + examination;
                    const report = yield cardReportModel_1.default.findByIdAndUpdate(getData === null || getData === void 0 ? void 0 : getData._id, {
                        result: [
                            ...getData.result,
                            {
                                subject: !subject ? read === null || read === void 0 ? void 0 : read.subject : subject,
                                test1: y1,
                                test2: y2,
                                test3: y3,
                                test4: y4,
                                exam: y5,
                                mark,
                                score,
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
                            test1,
                            test2,
                            test3,
                            test4,
                            exam,
                        },
                    ],
                    classInfo: `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_d = school === null || school === void 0 ? void 0 : school.session[0]) === null || _d === void 0 ? void 0 : _d.year}(${(_e = school === null || school === void 0 ? void 0 : school.session[0]) === null || _e === void 0 ? void 0 : _e.presentTerm})`,
                });
                student === null || student === void 0 ? void 0 : student.reportCard.push(new mongoose_1.Types.ObjectId(report._id));
                student === null || student === void 0 ? void 0 : student.save();
                subjectData === null || subjectData === void 0 ? void 0 : subjectData.reportCard.push(new mongoose_1.Types.ObjectId(report._id));
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
            var _a, _b;
            return ((el === null || el === void 0 ? void 0 : el.classInfo) ===
                `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_a = school === null || school === void 0 ? void 0 : school.session[0]) === null || _a === void 0 ? void 0 : _a.year}(${(_b = school === null || school === void 0 ? void 0 : school.session[0]) === null || _b === void 0 ? void 0 : _b.term})`);
        });
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
            message: "class Teacher report remark successfully",
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
