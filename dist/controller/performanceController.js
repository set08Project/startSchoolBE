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
exports.readQuizResult = exports.readStudentQuizResult = exports.readOneSubjectQuizResult = exports.readSubjectQuizResult = exports.createQuizPerformance = void 0;
const mongoose_1 = require("mongoose");
const studentModel_1 = __importDefault(require("../model/studentModel"));
const quizModel_1 = __importDefault(require("../model/quizModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const performanceModel_1 = __importDefault(require("../model/performanceModel"));
const createQuizPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { studentID, quizID, subjectID } = req.params;
        const { studentScore, studentGrade, remark, totalQuestions, markPerQuestion, status, } = req.body;
        const studentInfo = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "performance" });
        const quizData = yield quizModel_1.default.findById(quizID);
        const subject = yield subjectModel_1.default.findById(subjectID);
        console.log((_a = quizData === null || quizData === void 0 ? void 0 : quizData.quiz) === null || _a === void 0 ? void 0 : _a.question.length);
        console.log({
            remark,
            subjectTitle: quizData === null || quizData === void 0 ? void 0 : quizData.subjectTitle,
            studentScore,
            studentGrade,
            totalQuestions,
            markPerQuestion,
            status,
        });
        if (quizData) {
            const quizes = yield performanceModel_1.default.create({
                remark,
                subjectTitle: quizData === null || quizData === void 0 ? void 0 : quizData.subjectTitle,
                studentScore,
                studentGrade,
                totalQuestions,
                markPerQuestion,
                quizDone: true,
                status,
                performanceRating: parseInt(((studentScore / ((_b = quizData === null || quizData === void 0 ? void 0 : quizData.quiz) === null || _b === void 0 ? void 0 : _b.question.length)) * 100).toFixed(2)),
                className: studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.classAssigned,
                quizID: quizID,
                studentName: `${studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.studentFirstName} ${studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.studentLastName}`,
                studentAvatar: studentInfo.avatar,
                subjectID: subject === null || subject === void 0 ? void 0 : subject._id,
            });
            (_c = quizData === null || quizData === void 0 ? void 0 : quizData.performance) === null || _c === void 0 ? void 0 : _c.push(new mongoose_1.Types.ObjectId(quizes._id));
            quizData === null || quizData === void 0 ? void 0 : quizData.save();
            (_d = studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.performance) === null || _d === void 0 ? void 0 : _d.push(new mongoose_1.Types.ObjectId(quizes._id));
            studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.save();
            (_e = subject === null || subject === void 0 ? void 0 : subject.performance) === null || _e === void 0 ? void 0 : _e.push(new mongoose_1.Types.ObjectId(quizes._id));
            subject === null || subject === void 0 ? void 0 : subject.save();
            let view = [];
            let notView = [];
            const getStudent = yield studentModel_1.default.findById(studentID).populate({
                path: "performance",
            });
            let total = getStudent === null || getStudent === void 0 ? void 0 : getStudent.performance.map((el) => {
                if (el.performanceRating !== undefined) {
                    return view.push(el.performanceRating);
                }
                else {
                    return notView.push(el.performanceRating);
                }
            });
            view.reduce((a, b) => {
                return a + b;
            }, 0);
            const record = yield studentModel_1.default.findByIdAndUpdate(studentID, {
                totalPerformance: view.reduce((a, b) => {
                    return a + b;
                }, 0) / ((_f = studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.performance) === null || _f === void 0 ? void 0 : _f.length),
            }, { new: true });
            return res.status(201).json({
                message: "quiz entry created successfully",
                data: quizes,
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
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
            data: error.message,
        });
    }
});
exports.createQuizPerformance = createQuizPerformance;
const readSubjectQuizResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectID } = req.params;
        const subject = yield subjectModel_1.default.findById(subjectID).populate({
            path: "performance",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "subject quiz performance read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            status: 404,
        });
    }
});
exports.readSubjectQuizResult = readSubjectQuizResult;
const readOneSubjectQuizResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { subjectID, quizID } = req.params;
        const quiz = yield quizModel_1.default.findById(quizID);
        const subject = yield subjectModel_1.default.findById(subjectID).populate({
            path: "performance",
            options: { sort: { time: 1 } },
        });
        if (!quiz || !subject) {
            return res.status(404).json({
                message: "Subject or Quiz not found",
                status: 404,
            });
        }
        const idCompare = (_a = subject === null || subject === void 0 ? void 0 : subject.quiz) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === quiz._id.toString());
        if (idCompare) {
            const filteredPerformance = (_b = subject === null || subject === void 0 ? void 0 : subject.performance) === null || _b === void 0 ? void 0 : _b.filter((el) => el.quizID.toString() === quiz._id.toString());
            return res.status(201).json({
                message: "Filtered quiz performance read successfully",
                data: filteredPerformance,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "QuizID and Subject Quiz don't align",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: "Error reading subject quiz performance",
            status: 500,
        });
    }
});
exports.readOneSubjectQuizResult = readOneSubjectQuizResult;
const readStudentQuizResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const subject = yield studentModel_1.default.findById(studentID).populate({
            path: "performance",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "subject quiz performance read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            status: 404,
        });
    }
});
exports.readStudentQuizResult = readStudentQuizResult;
const readQuizResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizID } = req.params;
        const subject = yield quizModel_1.default.findById(quizID).populate({
            path: "performance",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "subject quiz performance read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            status: 404,
        });
    }
});
exports.readQuizResult = readQuizResult;
