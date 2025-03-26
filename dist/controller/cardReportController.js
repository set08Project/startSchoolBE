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
exports.studentPsychoReport = exports.studentMidReportRemark = exports.studentReportRemark = exports.adminMidReportRemark = exports.classTeacherMidReportRemark = exports.classTeacherReportRemark = exports.adminReportRemark = exports.classTeacherPhychoReportRemark = exports.updateReportScores = exports.createMidReportCardEntry = exports.createReportCardEntry = void 0;
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const mongoose_1 = require("mongoose");
const cardReportModel_1 = __importDefault(require("../model/cardReportModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const midReportCardModel_1 = __importDefault(require("../model/midReportCardModel"));
const createReportCardEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
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
        if (teacher && student) {
            if (studentCheck) {
                // check
                const getReportSubject = yield studentModel_1.default
                    .findById(studentID)
                    .populate({
                    path: "reportCard",
                });
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
                    let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
                    let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
                    let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
                    let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
                    let w5 = x5 !== 0 ? (examination = 60) : 0;
                    let score = w1 + w2 + w3 + w4 + w5;
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
                                score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
                                points: mark,
                                // y1 > 10
                                //   ? parseFloat(((mark / score) * 100).toFixed(2))
                                //   : parseFloat(((mark / score) * 100).toFixed(2)),
                                grade: mark >= 0 && mark <= 39
                                    ? "F9"
                                    : mark >= 39 && mark <= 44
                                        ? "E8"
                                        : mark >= 44 && mark <= 49
                                            ? "D7"
                                            : mark >= 49 && mark <= 54
                                                ? "C6"
                                                : mark >= 54 && mark <= 59
                                                    ? "C5"
                                                    : mark >= 59 && mark <= 64
                                                        ? "C4"
                                                        : mark >= 64 && mark <= 69
                                                            ? "B3"
                                                            : mark >= 69 && mark <= 74
                                                                ? "B2"
                                                                : mark >= 74 && mark <= 100
                                                                    ? "A1"
                                                                    : null,
                            },
                        ],
                    }, { new: true });
                    let genPoint = parseFloat((((_d = report === null || report === void 0 ? void 0 : report.result) === null || _d === void 0 ? void 0 : _d.map((el) => {
                        return el.points;
                    }).reduce((a, b) => {
                        return a + b;
                    }, 0)) / ((_e = report === null || report === void 0 ? void 0 : report.result) === null || _e === void 0 ? void 0 : _e.length)).toFixed(2));
                    let grade = genPoint >= 0 && genPoint <= 39
                        ? "F9"
                        : genPoint >= 39 && genPoint <= 44
                            ? "E8"
                            : genPoint >= 44 && genPoint <= 49
                                ? "D7"
                                : genPoint >= 49 && genPoint <= 54
                                    ? "C6"
                                    : genPoint >= 54 && genPoint <= 59
                                        ? "C5"
                                        : genPoint >= 59 && genPoint <= 64
                                            ? "C4"
                                            : genPoint >= 64 && genPoint <= 69
                                                ? "B3"
                                                : genPoint >= 69 && genPoint <= 74
                                                    ? "B2"
                                                    : genPoint >= 74 && genPoint <= 100
                                                        ? "A1"
                                                        : null;
                    let x = genPoint >= 0 && genPoint <= 5
                        ? "This is a very poor result."
                        : genPoint >= 6 && genPoint <= 11
                            ? "This result is poor; it's not satisfactory."
                            : genPoint >= 11 && genPoint <= 15
                                ? "Below average; needs significant improvement."
                                : genPoint >= 16 && genPoint <= 21
                                    ? "Below average; more effort required."
                                    : genPoint >= 21 && genPoint <= 25
                                        ? "Fair but not satisfactory; strive harder."
                                        : genPoint >= 26 && genPoint <= 31
                                            ? "Fair performance; potential for improvement."
                                            : genPoint >= 31 && genPoint <= 35
                                                ? "Average; a steady effort is needed."
                                                : genPoint >= 36 && genPoint <= 41
                                                    ? "Average; showing gradual improvement."
                                                    : genPoint >= 41 && genPoint <= 45
                                                        ? "Slightly above average; keep it up."
                                                        : genPoint >= 46 && genPoint <= 51
                                                            ? "Decent work; shows potential."
                                                            : genPoint >= 51 && genPoint <= 55
                                                                ? "Passable; satisfactory effort."
                                                                : genPoint >= 56 && genPoint <= 61
                                                                    ? "Satisfactory; good progress."
                                                                    : genPoint >= 61 && genPoint <= 65
                                                                        ? "Good work; keep striving for excellence."
                                                                        : genPoint >= 66 && genPoint <= 71
                                                                            ? "Commendable effort; very good."
                                                                            : genPoint >= 71 && genPoint <= 75
                                                                                ? "Very good; consistent effort is visible."
                                                                                : genPoint >= 76 && genPoint <= 81
                                                                                    ? "Excellent performance; well done!"
                                                                                    : genPoint >= 81 && genPoint <= 85
                                                                                        ? "Exceptional result; keep up the great work!"
                                                                                        : genPoint >= 86 && genPoint <= 91
                                                                                            ? "Outstanding achievement; impressive work!"
                                                                                            : genPoint >= 91 && genPoint <= 95
                                                                                                ? "Brilliant performance; you’re a star!"
                                                                                                : genPoint >= 96 && genPoint <= 100
                                                                                                    ? "Outstanding achievement; impressive work!"
                                                                                                    : ``;
                    let xx = genPoint >= 0 && genPoint <= 5
                        ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
                        : genPoint >= 6 && genPoint <= 11
                            ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
                            : genPoint >= 11 && genPoint <= 15
                                ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
                                : genPoint >= 16 && genPoint <= 21
                                    ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
                                    : genPoint >= 21 && genPoint <= 25
                                        ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
                                        : genPoint >= 26 && genPoint <= 31
                                            ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
                                            : genPoint >= 31 && genPoint <= 35
                                                ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
                                                : genPoint >= 36 && genPoint <= 41
                                                    ? "You are starting to grasp the material, but more depth and accuracy are needed."
                                                    : genPoint >= 41 && genPoint <= 45
                                                        ? "An acceptable effort, but there is room for improvement in clarity and depth"
                                                        : genPoint >= 46 && genPoint <= 51
                                                            ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
                                                            : genPoint >= 51 && genPoint <= 55
                                                                ? "You are making progress but need to develop your analysis further to meet the standard"
                                                                : genPoint >= 56 && genPoint <= 61
                                                                    ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
                                                                    : genPoint >= 61 && genPoint <= 65
                                                                        ? "Good work; keep striving for excellence."
                                                                        : genPoint >= 66 && genPoint <= 71
                                                                            ? "A solid understanding is evident, though there are areas to refine."
                                                                            : genPoint >= 71 && genPoint <= 75
                                                                                ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
                                                                                : genPoint >= 76 && genPoint <= 81
                                                                                    ? "Strong work overall! A little more attention to detail could make it exceptional!"
                                                                                    : genPoint >= 81 && genPoint <= 85
                                                                                        ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
                                                                                        : genPoint >= 86 && genPoint <= 91
                                                                                            ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
                                                                                            : genPoint >= 91 && genPoint <= 95
                                                                                                ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
                                                                                                : genPoint >= 96 && genPoint <= 100
                                                                                                    ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
                                                                                                    : ``;
                    let nice = yield cardReportModel_1.default.findByIdAndUpdate(report === null || report === void 0 ? void 0 : report.id, {
                        points: genPoint,
                        adminComment: x,
                        classTeacherComment: xx,
                        grade,
                    }, { new: true });
                    console.log("here12");
                    return res.status(201).json({
                        message: "teacher updated report successfully",
                        data: nice,
                        status: 201,
                    });
                }
                else {
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
                    let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
                    let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
                    let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
                    let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
                    let w5 = x5 !== 0 ? (examination = 60) : 0;
                    let score = w1 + w2 + w3 + w4 + w5;
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
                                score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
                                points: y1 > 10
                                    ? parseFloat(((mark / score) * 100).toFixed(2))
                                    : parseFloat(((mark / score) * 100).toFixed(2)),
                                grade: mark >= 0 && mark <= 39
                                    ? "F9"
                                    : mark >= 39 && mark <= 44
                                        ? "E8"
                                        : mark >= 44 && mark <= 49
                                            ? "D7"
                                            : mark >= 49 && mark <= 54
                                                ? "C6"
                                                : mark >= 54 && mark <= 59
                                                    ? "C5"
                                                    : mark >= 59 && mark <= 64
                                                        ? "C4"
                                                        : mark >= 64 && mark <= 69
                                                            ? "B3"
                                                            : mark >= 69 && mark <= 74
                                                                ? "B2"
                                                                : mark >= 74 && mark <= 100
                                                                    ? "A1"
                                                                    : null,
                            },
                        ],
                    }, { new: true });
                    let genPoint = parseFloat((((_f = report === null || report === void 0 ? void 0 : report.result) === null || _f === void 0 ? void 0 : _f.map((el) => {
                        return el.points;
                    }).reduce((a, b) => {
                        return a + b;
                    }, 0)) / ((_g = report === null || report === void 0 ? void 0 : report.result) === null || _g === void 0 ? void 0 : _g.length)).toFixed(2));
                    let grade = genPoint >= 0 && genPoint <= 39
                        ? "F9"
                        : genPoint >= 39 && genPoint <= 44
                            ? "E8"
                            : genPoint >= 44 && genPoint <= 49
                                ? "D7"
                                : genPoint >= 49 && genPoint <= 54
                                    ? "C6"
                                    : genPoint >= 54 && genPoint <= 59
                                        ? "C5"
                                        : genPoint >= 59 && genPoint <= 64
                                            ? "C4"
                                            : genPoint >= 64 && genPoint <= 69
                                                ? "B3"
                                                : genPoint >= 69 && genPoint <= 74
                                                    ? "B2"
                                                    : genPoint >= 74 && genPoint <= 100
                                                        ? "A1"
                                                        : null;
                    let nice = yield cardReportModel_1.default.findByIdAndUpdate(report === null || report === void 0 ? void 0 : report.id, {
                        points: genPoint,
                        grade,
                    }, { new: true });
                    console.log("here2");
                    return res.status(201).json({
                        message: "can't report entry created successfully",
                        data: nice,
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
                    classInfo: `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_h = school === null || school === void 0 ? void 0 : school.session[0]) === null || _h === void 0 ? void 0 : _h.year}(${(_j = school === null || school === void 0 ? void 0 : school.session[0]) === null || _j === void 0 ? void 0 : _j.presentTerm})`,
                    studentID,
                });
                let genPoint = parseFloat((((_k = report === null || report === void 0 ? void 0 : report.result) === null || _k === void 0 ? void 0 : _k.map((el) => {
                    return el.points;
                }).reduce((a, b) => {
                    return a + b;
                }, 0)) / ((_l = report === null || report === void 0 ? void 0 : report.result) === null || _l === void 0 ? void 0 : _l.length)).toFixed(2));
                let numb = [test1, test2, test3, test4, exam];
                let count = 0;
                let resultNumb = 0;
                let resultNumbAva = 0;
                for (let i = 0; i < numb.length; i++) {
                    if (numb[i] > 0) {
                        resultNumb += numb[i];
                        count++;
                    }
                }
                resultNumbAva = resultNumb / count;
                let grade = genPoint >= 0 && genPoint <= 39
                    ? "F"
                    : genPoint >= 40 && genPoint <= 49
                        ? "E"
                        : genPoint >= 50 && genPoint <= 59
                            ? "D"
                            : genPoint >= 60 && genPoint <= 69
                                ? "C"
                                : genPoint >= 70 && genPoint <= 79
                                    ? "B"
                                    : genPoint >= 80 && genPoint <= 100
                                        ? "A"
                                        : null;
                const nice = yield cardReportModel_1.default.findByIdAndUpdate(report === null || report === void 0 ? void 0 : report.id, {
                    points: resultNumb,
                    grade: "Nill",
                }, { new: true });
                (_m = student === null || student === void 0 ? void 0 : student.reportCard) === null || _m === void 0 ? void 0 : _m.push(new mongoose_1.Types.ObjectId(nice === null || nice === void 0 ? void 0 : nice._id));
                student === null || student === void 0 ? void 0 : student.save();
                (_o = subjectData === null || subjectData === void 0 ? void 0 : subjectData.reportCard) === null || _o === void 0 ? void 0 : _o.push(new mongoose_1.Types.ObjectId(nice === null || nice === void 0 ? void 0 : nice._id));
                subjectData === null || subjectData === void 0 ? void 0 : subjectData.save();
                // school?.reportCard.push(new Types.ObjectId(report._id));
                // school?.save();
                return res.status(201).json({
                    message: "report entry created successfully",
                    data: { nice, student },
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
const createMidReportCardEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
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
            path: "midReportCard",
        });
        const subjectData = yield subjectModel_1.default.findOne({ subjectTitle: subject });
        const studentCheck = student === null || student === void 0 ? void 0 : student.midReportCard.some((el) => {
            var _a, _b;
            return (el.classInfo ===
                `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_a = school === null || school === void 0 ? void 0 : school.session[0]) === null || _a === void 0 ? void 0 : _a.year}(${(_b = school === null || school === void 0 ? void 0 : school.session[0]) === null || _b === void 0 ? void 0 : _b.presentTerm})`);
        });
        if (teacher && student) {
            if (studentCheck) {
                // check
                const getReportSubject = yield studentModel_1.default
                    .findById(studentID)
                    .populate({
                    path: "midReportCard",
                });
                const getData = (_a = getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject.midReportCard) === null || _a === void 0 ? void 0 : _a.find((el) => {
                    var _a, _b;
                    return (el.classInfo ===
                        `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_a = school === null || school === void 0 ? void 0 : school.session[0]) === null || _a === void 0 ? void 0 : _a.year}(${(_b = school === null || school === void 0 ? void 0 : school.session[0]) === null || _b === void 0 ? void 0 : _b.presentTerm})`);
                });
                const data = (_b = getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject.midReportCard) === null || _b === void 0 ? void 0 : _b.find((el) => {
                    return el.result.find((el) => {
                        return el.subject === subject;
                    });
                });
                const dataFIle = (_c = getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject.midReportCard) === null || _c === void 0 ? void 0 : _c.find((el) => {
                    return el.result.find((el) => {
                        return el.subject === subject;
                    });
                });
                const read = dataFIle === null || dataFIle === void 0 ? void 0 : dataFIle.result.find((el) => {
                    return el.subject === subject;
                });
                if (data) {
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
                    let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
                    let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
                    let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
                    let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
                    let w5 = x5 !== 0 ? (examination = 60) : 0;
                    let score = w1 + w2 + w3 + w4 + w5;
                    let updated = getData.result.filter((el) => {
                        return el.subject !== subject;
                    });
                    yield midReportCardModel_1.default.create({
                        result: [
                            {
                                subject,
                                test1,
                                test2,
                                test3,
                                test4,
                                exam,
                                total: exam,
                                grade: exam >= 0 && exam <= 39
                                    ? "F9"
                                    : exam >= 39 && exam <= 44
                                        ? "E8"
                                        : exam >= 44 && exam <= 49
                                            ? "D7"
                                            : exam >= 49 && exam <= 54
                                                ? "C6"
                                                : exam >= 54 && exam <= 59
                                                    ? "C5"
                                                    : exam >= 59 && exam <= 64
                                                        ? "C4"
                                                        : exam >= 64 && exam <= 69
                                                            ? "B3"
                                                            : exam >= 69 && exam <= 74
                                                                ? "B2"
                                                                : exam >= 74 && exam <= 100
                                                                    ? "A1"
                                                                    : null,
                            },
                        ],
                        classInfo: `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_d = school === null || school === void 0 ? void 0 : school.session[0]) === null || _d === void 0 ? void 0 : _d.year}(${(_e = school === null || school === void 0 ? void 0 : school.session[0]) === null || _e === void 0 ? void 0 : _e.presentTerm})`,
                        studentID,
                    });
                    const report = yield midReportCardModel_1.default.findByIdAndUpdate(getData === null || getData === void 0 ? void 0 : getData._id, {
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
                                score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
                                points: mark,
                                // y1 > 10
                                //   ? parseFloat(((mark / score) * 100).toFixed(2))
                                //   : parseFloat(((mark / score) * 100).toFixed(2)),
                                grade: mark >= 0 && mark <= 39
                                    ? "F9"
                                    : mark >= 39 && mark <= 44
                                        ? "E8"
                                        : mark >= 44 && mark <= 49
                                            ? "D7"
                                            : mark >= 49 && mark <= 54
                                                ? "C6"
                                                : mark >= 54 && mark <= 59
                                                    ? "C5"
                                                    : mark >= 59 && mark <= 64
                                                        ? "C4"
                                                        : mark >= 64 && mark <= 69
                                                            ? "B3"
                                                            : mark >= 69 && mark <= 74
                                                                ? "B2"
                                                                : mark >= 74 && mark <= 100
                                                                    ? "A1"
                                                                    : null,
                            },
                        ],
                    }, { new: true });
                    let genPoint = parseFloat((((_f = report === null || report === void 0 ? void 0 : report.result) === null || _f === void 0 ? void 0 : _f.map((el) => {
                        return el.points;
                    }).reduce((a, b) => {
                        return a + b;
                    }, 0)) / ((_g = report === null || report === void 0 ? void 0 : report.result) === null || _g === void 0 ? void 0 : _g.length)).toFixed(2));
                    let grade = genPoint >= 0 && genPoint <= 39
                        ? "F9"
                        : genPoint >= 39 && genPoint <= 44
                            ? "E8"
                            : genPoint >= 44 && genPoint <= 49
                                ? "D7"
                                : genPoint >= 49 && genPoint <= 54
                                    ? "C6"
                                    : genPoint >= 54 && genPoint <= 59
                                        ? "C5"
                                        : genPoint >= 59 && genPoint <= 64
                                            ? "C4"
                                            : genPoint >= 64 && genPoint <= 69
                                                ? "B3"
                                                : genPoint >= 69 && genPoint <= 74
                                                    ? "B2"
                                                    : genPoint >= 74 && genPoint <= 100
                                                        ? "A1"
                                                        : null;
                    let x = genPoint >= 0 && genPoint <= 5
                        ? "This is a very poor result."
                        : genPoint >= 6 && genPoint <= 11
                            ? "This result is poor; it's not satisfactory."
                            : genPoint >= 11 && genPoint <= 15
                                ? "Below average; needs significant improvement."
                                : genPoint >= 16 && genPoint <= 21
                                    ? "Below average; more effort required."
                                    : genPoint >= 21 && genPoint <= 25
                                        ? "Fair but not satisfactory; strive harder."
                                        : genPoint >= 26 && genPoint <= 31
                                            ? "Fair performance; potential for improvement."
                                            : genPoint >= 31 && genPoint <= 35
                                                ? "Average; a steady effort is needed."
                                                : genPoint >= 36 && genPoint <= 41
                                                    ? "Average; showing gradual improvement."
                                                    : genPoint >= 41 && genPoint <= 45
                                                        ? "Slightly above average; keep it up."
                                                        : genPoint >= 46 && genPoint <= 51
                                                            ? "Decent work; shows potential."
                                                            : genPoint >= 51 && genPoint <= 55
                                                                ? "Passable; satisfactory effort."
                                                                : genPoint >= 56 && genPoint <= 61
                                                                    ? "Satisfactory; good progress."
                                                                    : genPoint >= 61 && genPoint <= 65
                                                                        ? "Good work; keep striving for excellence."
                                                                        : genPoint >= 66 && genPoint <= 71
                                                                            ? "Commendable effort; very good."
                                                                            : genPoint >= 71 && genPoint <= 75
                                                                                ? "Very good; consistent effort is visible."
                                                                                : genPoint >= 76 && genPoint <= 81
                                                                                    ? "Excellent performance; well done!"
                                                                                    : genPoint >= 81 && genPoint <= 85
                                                                                        ? "Exceptional result; keep up the great work!"
                                                                                        : genPoint >= 86 && genPoint <= 91
                                                                                            ? "Outstanding achievement; impressive work!"
                                                                                            : genPoint >= 91 && genPoint <= 95
                                                                                                ? "Brilliant performance; you’re a star!"
                                                                                                : genPoint >= 96 && genPoint <= 100
                                                                                                    ? "Outstanding achievement; impressive work!"
                                                                                                    : ``;
                    let xx = genPoint >= 0 && genPoint <= 5
                        ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
                        : genPoint >= 6 && genPoint <= 11
                            ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
                            : genPoint >= 11 && genPoint <= 15
                                ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
                                : genPoint >= 16 && genPoint <= 21
                                    ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
                                    : genPoint >= 21 && genPoint <= 25
                                        ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
                                        : genPoint >= 26 && genPoint <= 31
                                            ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
                                            : genPoint >= 31 && genPoint <= 35
                                                ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
                                                : genPoint >= 36 && genPoint <= 41
                                                    ? "You are starting to grasp the material, but more depth and accuracy are needed."
                                                    : genPoint >= 41 && genPoint <= 45
                                                        ? "An acceptable effort, but there is room for improvement in clarity and depth"
                                                        : genPoint >= 46 && genPoint <= 51
                                                            ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
                                                            : genPoint >= 51 && genPoint <= 55
                                                                ? "You are making progress but need to develop your analysis further to meet the standard"
                                                                : genPoint >= 56 && genPoint <= 61
                                                                    ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
                                                                    : genPoint >= 61 && genPoint <= 65
                                                                        ? "Good work; keep striving for excellence."
                                                                        : genPoint >= 66 && genPoint <= 71
                                                                            ? "A solid understanding is evident, though there are areas to refine."
                                                                            : genPoint >= 71 && genPoint <= 75
                                                                                ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
                                                                                : genPoint >= 76 && genPoint <= 81
                                                                                    ? "Strong work overall! A little more attention to detail could make it exceptional!"
                                                                                    : genPoint >= 81 && genPoint <= 85
                                                                                        ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
                                                                                        : genPoint >= 86 && genPoint <= 91
                                                                                            ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
                                                                                            : genPoint >= 91 && genPoint <= 95
                                                                                                ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
                                                                                                : genPoint >= 96 && genPoint <= 100
                                                                                                    ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
                                                                                                    : ``;
                    let nice = yield midReportCardModel_1.default.findByIdAndUpdate(report === null || report === void 0 ? void 0 : report.id, {
                        points: genPoint,
                        adminComment: x,
                        classTeacherComment: xx,
                        grade,
                    }, { new: true });
                    return res.status(201).json({
                        message: "teacher updated report successfully",
                        data: nice,
                        status: 201,
                    });
                }
                else {
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
                    let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
                    let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
                    let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
                    let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
                    let w5 = x5 !== 0 ? (examination = 60) : 0;
                    let score = w1 + w2 + w3 + w4 + w5;
                    const report = yield midReportCardModel_1.default.findByIdAndUpdate(getData === null || getData === void 0 ? void 0 : getData._id, {
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
                                score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
                                points: y1 > 10
                                    ? parseFloat(((mark / score) * 100).toFixed(2))
                                    : parseFloat(((mark / score) * 100).toFixed(2)),
                                grade: mark >= 0 && mark <= 39
                                    ? "F9"
                                    : mark >= 39 && mark <= 44
                                        ? "E8"
                                        : mark >= 44 && mark <= 49
                                            ? "D7"
                                            : mark >= 49 && mark <= 54
                                                ? "C6"
                                                : mark >= 54 && mark <= 59
                                                    ? "C5"
                                                    : mark >= 59 && mark <= 64
                                                        ? "C4"
                                                        : mark >= 64 && mark <= 69
                                                            ? "B3"
                                                            : mark >= 69 && mark <= 74
                                                                ? "B2"
                                                                : mark >= 74 && mark <= 100
                                                                    ? "A1"
                                                                    : null,
                            },
                        ],
                    }, { new: true });
                    let genPoint = parseFloat((((_h = report === null || report === void 0 ? void 0 : report.result) === null || _h === void 0 ? void 0 : _h.map((el) => {
                        return el.points;
                    }).reduce((a, b) => {
                        return a + b;
                    }, 0)) / ((_j = report === null || report === void 0 ? void 0 : report.result) === null || _j === void 0 ? void 0 : _j.length)).toFixed(2));
                    let grade = genPoint >= 0 && genPoint <= 39
                        ? "F9"
                        : genPoint >= 39 && genPoint <= 44
                            ? "E8"
                            : genPoint >= 44 && genPoint <= 49
                                ? "D7"
                                : genPoint >= 49 && genPoint <= 54
                                    ? "C6"
                                    : genPoint >= 54 && genPoint <= 59
                                        ? "C5"
                                        : genPoint >= 59 && genPoint <= 64
                                            ? "C4"
                                            : genPoint >= 64 && genPoint <= 69
                                                ? "B3"
                                                : genPoint >= 69 && genPoint <= 74
                                                    ? "B2"
                                                    : genPoint >= 74 && genPoint <= 100
                                                        ? "A1"
                                                        : null;
                    let nice = yield midReportCardModel_1.default.findByIdAndUpdate(report === null || report === void 0 ? void 0 : report.id, {
                        points: genPoint,
                        grade,
                    }, { new: true });
                    return res.status(201).json({
                        message: "can't report entry created successfully",
                        data: nice,
                        status: 201,
                    });
                }
            }
            else {
                const report = yield midReportCardModel_1.default.create({
                    result: [
                        {
                            subject,
                            test1,
                            test2,
                            test3,
                            test4,
                            exam,
                            total: exam,
                            grade: exam >= 0 && exam <= 39
                                ? "F9"
                                : exam >= 39 && exam <= 44
                                    ? "E8"
                                    : exam >= 44 && exam <= 49
                                        ? "D7"
                                        : exam >= 49 && exam <= 54
                                            ? "C6"
                                            : exam >= 54 && exam <= 59
                                                ? "C5"
                                                : exam >= 59 && exam <= 64
                                                    ? "C4"
                                                    : exam >= 64 && exam <= 69
                                                        ? "B3"
                                                        : exam >= 69 && exam <= 74
                                                            ? "B2"
                                                            : exam >= 74 && exam <= 100
                                                                ? "A1"
                                                                : null,
                        },
                    ],
                    classInfo: `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${(_k = school === null || school === void 0 ? void 0 : school.session[0]) === null || _k === void 0 ? void 0 : _k.year}(${(_l = school === null || school === void 0 ? void 0 : school.session[0]) === null || _l === void 0 ? void 0 : _l.presentTerm})`,
                    studentID,
                });
                let genPointScore = parseFloat((((_m = report === null || report === void 0 ? void 0 : report.result) === null || _m === void 0 ? void 0 : _m.map((el) => {
                    return el.exam;
                }).reduce((a, b) => {
                    return a + b;
                }, 0)) / ((_o = report === null || report === void 0 ? void 0 : report.result) === null || _o === void 0 ? void 0 : _o.length)).toFixed(2));
                let numb = [test1, test2, test3, test4, exam];
                let count = 0;
                let resultNumb = 0;
                let resultNumbAva = 0;
                for (let i = 0; i < numb.length; i++) {
                    if (numb[i] > 0) {
                        resultNumb += numb[i];
                        count++;
                    }
                }
                resultNumbAva = resultNumb / count;
                let x = genPointScore >= 0 && genPointScore <= 5
                    ? "This is a very poor result."
                    : genPointScore >= 6 && genPointScore <= 11
                        ? "This result is poor; it's not satisfactory."
                        : genPointScore >= 11 && genPointScore <= 15
                            ? "Below average; needs significant improvement."
                            : genPointScore >= 16 && genPointScore <= 21
                                ? "Below average; more effort required."
                                : genPointScore >= 21 && genPointScore <= 25
                                    ? "Fair but not satisfactory; strive harder."
                                    : genPointScore >= 26 && genPointScore <= 31
                                        ? "Fair performance; potential for improvement."
                                        : genPointScore >= 31 && genPointScore <= 35
                                            ? "Average; a steady effort is needed."
                                            : genPointScore >= 36 && genPointScore <= 41
                                                ? "Average; showing gradual improvement."
                                                : genPointScore >= 41 && genPointScore <= 45
                                                    ? "Slightly above average; keep it up."
                                                    : genPointScore >= 46 && genPointScore <= 51
                                                        ? "Decent work; shows potential."
                                                        : genPointScore >= 51 && genPointScore <= 55
                                                            ? "Passable; satisfactory effort."
                                                            : genPointScore >= 56 && genPointScore <= 61
                                                                ? "Satisfactory; good progress."
                                                                : genPointScore >= 61 && genPointScore <= 65
                                                                    ? "Good work; keep striving for excellence."
                                                                    : genPointScore >= 66 && genPointScore <= 71
                                                                        ? "Commendable effort; very good."
                                                                        : genPointScore >= 71 && genPointScore <= 75
                                                                            ? "Very good; consistent effort is visible."
                                                                            : genPointScore >= 76 && genPointScore <= 81
                                                                                ? "Excellent performance; well done!"
                                                                                : genPointScore >= 81 && genPointScore <= 85
                                                                                    ? "Exceptional result; keep up the great work!"
                                                                                    : genPointScore >= 86 && genPointScore <= 91
                                                                                        ? "Outstanding achievement; impressive work!"
                                                                                        : genPointScore >= 91 && genPointScore <= 95
                                                                                            ? "Brilliant performance; you’re a star!"
                                                                                            : genPointScore >= 96 && genPointScore <= 100
                                                                                                ? "Outstanding achievement; impressive work!"
                                                                                                : ``;
                let xx = genPointScore >= 0 && genPointScore <= 5
                    ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
                    : genPointScore >= 6 && genPointScore <= 11
                        ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
                        : genPointScore >= 11 && genPointScore <= 15
                            ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
                            : genPointScore >= 16 && genPointScore <= 21
                                ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
                                : genPointScore >= 21 && genPointScore <= 25
                                    ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
                                    : genPointScore >= 26 && genPointScore <= 31
                                        ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
                                        : genPointScore >= 31 && genPointScore <= 35
                                            ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
                                            : genPointScore >= 36 && genPointScore <= 41
                                                ? "You are starting to grasp the material, but more depth and accuracy are needed."
                                                : genPointScore >= 41 && genPointScore <= 45
                                                    ? "An acceptable effort, but there is room for improvement in clarity and depth"
                                                    : genPointScore >= 46 && genPointScore <= 51
                                                        ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
                                                        : genPointScore >= 51 && genPointScore <= 55
                                                            ? "You are making progress but need to develop your analysis further to meet the standard"
                                                            : genPointScore >= 56 && genPointScore <= 61
                                                                ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
                                                                : genPointScore >= 61 && genPointScore <= 65
                                                                    ? "Good work; keep striving for excellence."
                                                                    : genPointScore >= 66 && genPointScore <= 71
                                                                        ? "A solid understanding is evident, though there are areas to refine."
                                                                        : genPointScore >= 71 && genPointScore <= 75
                                                                            ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
                                                                            : genPointScore >= 76 && genPointScore <= 81
                                                                                ? "Strong work overall! A little more attention to detail could make it exceptional!"
                                                                                : genPointScore >= 81 && genPointScore <= 85
                                                                                    ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
                                                                                    : genPointScore >= 86 && genPointScore <= 91
                                                                                        ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
                                                                                        : genPointScore >= 91 && genPointScore <= 95
                                                                                            ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
                                                                                            : genPointScore >= 96 && genPointScore <= 100
                                                                                                ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
                                                                                                : ``;
                const nice = yield midReportCardModel_1.default.findByIdAndUpdate(report === null || report === void 0 ? void 0 : report.id, {
                    points: resultNumb,
                    adminComment: x,
                    classTeacherComment: xx,
                    grade: exam >= 0 && exam <= 39
                        ? "F9"
                        : exam >= 39 && exam <= 44
                            ? "E8"
                            : exam >= 44 && exam <= 49
                                ? "D7"
                                : exam >= 49 && exam <= 54
                                    ? "C6"
                                    : exam >= 54 && exam <= 59
                                        ? "C5"
                                        : exam >= 59 && exam <= 64
                                            ? "C4"
                                            : exam >= 64 && exam <= 69
                                                ? "B3"
                                                : exam >= 69 && exam <= 74
                                                    ? "B2"
                                                    : exam >= 74 && exam <= 100
                                                        ? "A1"
                                                        : null,
                }, { new: true });
                (_p = student === null || student === void 0 ? void 0 : student.midReportCard) === null || _p === void 0 ? void 0 : _p.push(new mongoose_1.Types.ObjectId(nice === null || nice === void 0 ? void 0 : nice._id));
                student === null || student === void 0 ? void 0 : student.save();
                (_q = subjectData === null || subjectData === void 0 ? void 0 : subjectData.midReportCard) === null || _q === void 0 ? void 0 : _q.push(new mongoose_1.Types.ObjectId(nice === null || nice === void 0 ? void 0 : nice._id));
                subjectData === null || subjectData === void 0 ? void 0 : subjectData.save();
                // school?.reportCard.push(new Types.ObjectId(report._id));
                // school?.save();
                return res.status(201).json({
                    message: "report entry created successfully",
                    data: { nice, student },
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
exports.createMidReportCardEntry = createMidReportCardEntry;
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
                const report = yield midReportCardModel_1.default.findByIdAndUpdate(getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject._id, {
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
const classTeacherPhychoReportRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID, studentID, classID } = req.params;
        const { confidence, presentational, hardworking, resilient, sportship, empathy, punctuality, communication, leadership, } = req.body;
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
            return (el.classInfo ===
                `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${school === null || school === void 0 ? void 0 : school.presentSession}(${school === null || school === void 0 ? void 0 : school.presentTerm})`);
        });
        const teacher = yield staffModel_1.default.findById(teacherID);
        const teacherClassDataRomm = teacher === null || teacher === void 0 ? void 0 : teacher.classesAssigned.find((el) => {
            return el.className === (student === null || student === void 0 ? void 0 : student.classAssigned);
        });
        if ((teacherClassDataRomm === null || teacherClassDataRomm === void 0 ? void 0 : teacherClassDataRomm.className) === (student === null || student === void 0 ? void 0 : student.classAssigned)) {
            const report = yield cardReportModel_1.default.findByIdAndUpdate(getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject._id, {
                peopleSkill: [
                    {
                        confidence,
                        presentational,
                        hardworking,
                        resilient,
                    },
                ],
                softSkill: [
                    {
                        empathy,
                        punctuality,
                        communication,
                        leadership,
                    },
                ],
                physicalSkill: [
                    {
                        sportship,
                    },
                ],
                psycho: true,
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
exports.classTeacherPhychoReportRemark = classTeacherPhychoReportRemark;
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
            return (el.classInfo ===
                `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${school === null || school === void 0 ? void 0 : school.presentSession}(${school === null || school === void 0 ? void 0 : school.presentTerm})`);
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
        const { teacherComment, attendance } = req.body;
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
            return (el.classInfo ===
                `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${school === null || school === void 0 ? void 0 : school.presentSession}(${school === null || school === void 0 ? void 0 : school.presentTerm})`);
        });
        const teacher = yield staffModel_1.default.findById(teacherID);
        const teacherClassDataRomm = teacher === null || teacher === void 0 ? void 0 : teacher.classesAssigned.find((el) => {
            return el.className === (student === null || student === void 0 ? void 0 : student.classAssigned);
        });
        if ((teacherClassDataRomm === null || teacherClassDataRomm === void 0 ? void 0 : teacherClassDataRomm.className) === (student === null || student === void 0 ? void 0 : student.classAssigned)) {
            const report = yield cardReportModel_1.default.findByIdAndUpdate(getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject._id, {
                attendance,
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
const classTeacherMidReportRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID, studentID, classID } = req.params;
        const { teacherComment, attendance } = req.body;
        const student = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "midReportCard" });
        const classRM = yield classroomModel_1.default.findById(classID);
        const school = yield schoolModel_1.default
            .findById(student === null || student === void 0 ? void 0 : student.schoolIDs)
            .populate({
            path: "session",
        });
        const getReportSubject = student === null || student === void 0 ? void 0 : student.midReportCard.find((el) => {
            return (el.classInfo ===
                `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${school === null || school === void 0 ? void 0 : school.presentSession}(${school === null || school === void 0 ? void 0 : school.presentTerm})`);
        });
        const teacher = yield staffModel_1.default.findById(teacherID);
        const teacherClassDataRomm = teacher === null || teacher === void 0 ? void 0 : teacher.classesAssigned.find((el) => {
            return el.className === (student === null || student === void 0 ? void 0 : student.classAssigned);
        });
        if ((teacherClassDataRomm === null || teacherClassDataRomm === void 0 ? void 0 : teacherClassDataRomm.className) === (student === null || student === void 0 ? void 0 : student.classAssigned)) {
            const report = yield midReportCardModel_1.default.findByIdAndUpdate(getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject._id, {
                attendance,
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
exports.classTeacherMidReportRemark = classTeacherMidReportRemark;
const adminMidReportRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID, schoolID } = req.params;
        const { adminComment } = req.body;
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "midReportCard",
        });
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "session",
        });
        const getReportSubject = student === null || student === void 0 ? void 0 : student.midReportCard.find((el) => {
            return (el.classInfo ===
                `${student === null || student === void 0 ? void 0 : student.classAssigned} session: ${school === null || school === void 0 ? void 0 : school.presentSession}(${school === null || school === void 0 ? void 0 : school.presentTerm})`);
        });
        if (school) {
            const report = yield midReportCardModel_1.default.findByIdAndUpdate(getReportSubject === null || getReportSubject === void 0 ? void 0 : getReportSubject._id, {
                approve: true,
                adminComment,
            }, { new: true });
            console.log(report);
            console.log(getReportSubject);
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
exports.adminMidReportRemark = adminMidReportRemark;
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
const studentMidReportRemark = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const student = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "midReportCard" });
        console.log(student === null || student === void 0 ? void 0 : student.midReportCard);
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
exports.studentMidReportRemark = studentMidReportRemark;
const studentPsychoReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.studentPsychoReport = studentPsychoReport;
