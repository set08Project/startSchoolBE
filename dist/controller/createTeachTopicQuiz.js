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
exports.createBulkTeachSubjectTopicQuiz = exports.getAllTeachSubjectTopic = exports.deleteOneTeachSubjectTopicQuiz = exports.getOneTeachSubjectTopicQuiz = exports.updateTeachSubjectTopicQuiz = exports.createTeachSubjectTopicQuiz = void 0;
const teachSubjectModel_1 = __importDefault(require("../model/teachSubjectModel"));
const teachSubjectTopics_1 = __importDefault(require("../model/teachSubjectTopics"));
const teachTopicQuizesModel_1 = __importDefault(require("../model/teachTopicQuizesModel"));
const mongoose_1 = require("mongoose");
const createTeachSubjectTopicQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, explanation, correctAnswer, options } = req.body;
        const { topicID } = req.params;
        const getSubject = yield teachSubjectTopics_1.default.findById(topicID);
        const teachSubject = yield teachTopicQuizesModel_1.default.create({
            question,
            explanation,
            correctAnswer,
            options,
        });
        getSubject === null || getSubject === void 0 ? void 0 : getSubject.quizQuestions.push(new mongoose_1.Types.ObjectId(teachSubject._id));
        yield (getSubject === null || getSubject === void 0 ? void 0 : getSubject.save());
        return res.status(201).json({
            message: "teach subject created successfully",
            data: { teachSubject, getSubject },
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
            data: error,
        });
    }
});
exports.createTeachSubjectTopicQuiz = createTeachSubjectTopicQuiz;
const updateTeachSubjectTopicQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teachSubjectTopicQuizID } = req.params;
        const { question, explanation, correctAnswer, options } = req.body;
        const teachSubject = yield teachTopicQuizesModel_1.default.findByIdAndUpdate(teachSubjectTopicQuizID, {
            question,
            explanation,
            correctAnswer,
            options,
        }, { new: true });
        return res.status(201).json({
            message: "teach subject updated successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
});
exports.updateTeachSubjectTopicQuiz = updateTeachSubjectTopicQuiz;
const getOneTeachSubjectTopicQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teachSubjectTopicID } = req.params;
        const teachSubject = yield teachSubjectTopics_1.default
            .findById(teachSubjectTopicID).populate({ path: "quizQuestions" });
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        console.log("error", error);
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
});
exports.getOneTeachSubjectTopicQuiz = getOneTeachSubjectTopicQuiz;
const deleteOneTeachSubjectTopicQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { teachSubjectTopicQuizID, subjectTopicID } = req.params;
        const getSubject = yield teachSubjectTopics_1.default.findById(subjectTopicID);
        // await subjectTopicsModel.findByIdAndDelete(teachSubjectTopicQuizID);
        const teachSubject = yield teachTopicQuizesModel_1.default.findByIdAndDelete(teachSubjectTopicQuizID);
        (_a = getSubject === null || getSubject === void 0 ? void 0 : getSubject.quizQuestions) === null || _a === void 0 ? void 0 : _a.pull(teachSubjectTopicQuizID);
        yield (getSubject === null || getSubject === void 0 ? void 0 : getSubject.save());
        return res.status(201).json({
            message: "teach subject deleted successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error deleting teach subject ",
        });
    }
});
exports.deleteOneTeachSubjectTopicQuiz = deleteOneTeachSubjectTopicQuiz;
const getAllTeachSubjectTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teachSubject = yield teachSubjectModel_1.default.find();
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
});
exports.getAllTeachSubjectTopic = getAllTeachSubjectTopic;
const createBulkTeachSubjectTopicQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { questions } = req.body;
        const { topicID } = req.params;
        // Find the subject topic
        const getSubject = yield teachSubjectTopics_1.default.findById(topicID);
        if (!getSubject) {
            return res.status(404).json({
                message: "Topic not found",
                status: 404,
            });
        }
        // Create all quiz questions in bulk
        console.log(questions);
        const createdQuizzes = yield teachTopicQuizesModel_1.default.create(questions);
        // If createdQuizzes is a single document, convert it to an array
        const quizArray = Array.isArray(createdQuizzes)
            ? createdQuizzes
            : [createdQuizzes];
        // Add all quiz IDs to the topic's quizQuestions array
        const quizIds = quizArray.map((quiz) => new mongoose_1.Types.ObjectId(quiz._id));
        getSubject.quizQuestions.push(...quizIds);
        yield getSubject.save();
        return res.status(201).json({
            message: "Bulk quiz questions created successfully",
            data: {
                quizzes: createdQuizzes,
                topic: getSubject,
            },
            status: 201,
        });
    }
    catch (error) {
        console.error("Error creating bulk quiz questions:", error);
        return res.status(500).json({
            message: "Error creating bulk quiz questions",
            error: error instanceof Error ? error.message : "Unknown error",
            status: 500,
        });
    }
});
exports.createBulkTeachSubjectTopicQuiz = createBulkTeachSubjectTopicQuiz;
