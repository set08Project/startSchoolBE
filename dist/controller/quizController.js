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
exports.getStudentQuizRecords = exports.deleteQuiz = exports.getQuizRecords = exports.readQuizes = exports.readQuiz = exports.readTeacherSubjectQuiz = exports.readSubjectQuiz = exports.createSubjectQuiz = void 0;
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const quizModel_1 = __importDefault(require("../model/quizModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const createSubjectQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID, subjectID } = req.params;
        const { quiz } = req.body;
        const classRoom = yield classroomModel_1.default.findById(classID);
        const checkForSubject = yield subjectModel_1.default.findById(subjectID);
        const findTeacher = yield staffModel_1.default.findById({
            _id: classRoom === null || classRoom === void 0 ? void 0 : classRoom.teacherID,
        });
        const findSubjectTeacher = yield subjectModel_1.default.findById({
            _id: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.teacherID,
        });
        if (checkForSubject) {
            const quizes = yield quizModel_1.default.create({
                subjectTitle: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.subjectTitle,
                subjectID: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject._id,
                quiz,
            });
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.save();
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.save();
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.save();
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
    catch (errorL) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
});
exports.createSubjectQuiz = createSubjectQuiz;
const readSubjectQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectID } = req.params;
        const subject = yield subjectModel_1.default.findById(subjectID).populate({
            path: "quiz",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "subject quiz read successfully",
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
exports.readSubjectQuiz = readSubjectQuiz;
const readTeacherSubjectQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID } = req.params;
        const quiz = yield staffModel_1.default
            .findById(teacherID)
            .populate({ path: "quiz" });
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
});
exports.readTeacherSubjectQuiz = readTeacherSubjectQuiz;
const readQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizID } = req.params;
        const quiz = yield quizModel_1.default.findById(quizID);
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
});
exports.readQuiz = readQuiz;
const readQuizes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quiz = yield quizModel_1.default.find().populate({
            path: "performance",
        });
        return res.status(201).json({
            message: "subject quiz read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject quiz",
            data: error.message,
            status: 404,
        });
    }
});
exports.readQuizes = readQuizes;
const getQuizRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const quizzes = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "performance" });
        return res.status(200).json({
            message: "Quiz records fetched successfully",
            data: quizzes,
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching quiz records",
            data: error.message,
            status: 500,
        });
    }
});
exports.getQuizRecords = getQuizRecords;
const deleteQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizID } = req.params;
        const quiz = yield quizModel_1.default.findByIdAndDelete(quizID);
        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found",
                status: 404,
            });
        }
        const subjectUpdate = yield subjectModel_1.default.updateMany({ quiz: quizID }, { $pull: { quiz: quizID } });
        const staffUpdate = yield staffModel_1.default.updateMany({ quiz: quizID }, { $pull: { quiz: quizID } });
        const studentUpdate = yield studentModel_1.default.updateMany({ quiz: quizID }, { $pull: { quiz: quizID } });
        return res.status(200).json({
            message: "Quiz deleted successfully",
            data: {
                deletedQuiz: quiz,
                subjectUpdate,
                staffUpdate,
                studentUpdate,
            },
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error deleting quiz",
            data: error.message,
            status: 500,
        });
    }
});
exports.deleteQuiz = deleteQuiz;
const getStudentQuizRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID } = req.params;
        console.log("teacherID", teacherID);
        const staff = yield staffModel_1.default.findById(teacherID).populate({
            path: "quiz",
            populate: {
                path: "performance",
                select: "studentName studentScore studentGrade subjectTitle date",
            },
        });
        if (!staff) {
            return res.status(404).json({
                message: "Teacher not found or no quiz data available",
                status: 404,
            });
        }
        return res.status(200).json({
            message: "Student quiz records retrieved successfully",
            data: staff,
            status: 200,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error retrieving student quiz records",
            data: error.message,
            status: 500,
        });
    }
});
exports.getStudentQuizRecords = getStudentQuizRecords;
