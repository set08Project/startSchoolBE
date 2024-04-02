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
exports.getOneHistory = exports.getOneStudentHistory = exports.createPastQuestionHistory = void 0;
const pastQuestionModel_1 = __importDefault(require("../model/pastQuestionModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const mongoose_1 = require("mongoose");
const pastQuestionModel_2 = __importDefault(require("../model/pastQuestionModel"));
const createPastQuestionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const { year, subject, percent, score, chosenAnswers } = req.body;
        const student = yield studentModel_1.default.findById(studentID);
        if (student) {
            const history = yield pastQuestionModel_1.default.create({
                year,
                subject,
                percent,
                score,
                chosenAnswers,
            });
            student.pastQuestionHistory.push(new mongoose_1.Types.ObjectId(history === null || history === void 0 ? void 0 : history._id));
            student === null || student === void 0 ? void 0 : student.save();
            return res.status(201).json({
                message: "lesson note created",
                data: history,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Error finding student",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
            data: error.message,
        });
    }
});
exports.createPastQuestionHistory = createPastQuestionHistory;
const getOneStudentHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const student = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "pastQuestionHistory" });
        return res.status(201).json({
            message: "lesson note created",
            data: student === null || student === void 0 ? void 0 : student.pastQuestionHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
            data: error.message,
        });
    }
});
exports.getOneStudentHistory = getOneStudentHistory;
const getOneHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { historyID } = req.params;
        const history = yield pastQuestionModel_2.default.findById(historyID);
        return res.status(201).json({
            message: "One history found",
            data: history,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error getting history",
            status: 404,
            data: error.message,
        });
    }
});
exports.getOneHistory = getOneHistory;
