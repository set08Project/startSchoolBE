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
exports.getAllTeachSubjectTopic = exports.deleteOneTeachSubjectTopic = exports.getOneTeachSubjectTopicNow = exports.getOneTeachSubjectTopic = exports.updateTeachSubjectTopic = exports.createTeachSubjectTopic = void 0;
const teachSubjectModel_1 = __importDefault(require("../model/teachSubjectModel"));
const teachSubjectTopics_1 = __importDefault(require("../model/teachSubjectTopics"));
const mongoose_1 = require("mongoose");
const createTeachSubjectTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, duration, video, description, topicImage, keyPoints,
        // quizQuestions: Array<{}>;
        // subjectTopic: {};
         } = req.body;
        const { subjectID } = req.params;
        const getSubject = yield teachSubjectModel_1.default.findById(subjectID);
        const teachSubject = yield teachSubjectTopics_1.default.create({
            title,
            duration,
            video,
            description,
            topicImage,
            keyPoints,
        });
        getSubject === null || getSubject === void 0 ? void 0 : getSubject.topics.push(new mongoose_1.Types.ObjectId(teachSubject._id));
        yield (getSubject === null || getSubject === void 0 ? void 0 : getSubject.save());
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
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
exports.createTeachSubjectTopic = createTeachSubjectTopic;
const updateTeachSubjectTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teachSubjectTopicID } = req.params;
        const { title, duration, video, description, topicImage, keyPoints, } = req.body;
        const teachSubject = yield teachSubjectTopics_1.default.findByIdAndUpdate(teachSubjectTopicID, {
            title,
            duration,
            video,
            description,
            topicImage,
            keyPoints,
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
exports.updateTeachSubjectTopic = updateTeachSubjectTopic;
const getOneTeachSubjectTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teachSubjectTopicID } = req.params;
        const teachSubject = yield teachSubjectModel_1.default
            .findById(teachSubjectTopicID)
            .populate({ path: "topics" });
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
exports.getOneTeachSubjectTopic = getOneTeachSubjectTopic;
const getOneTeachSubjectTopicNow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teachSubjectTopicID } = req.params;
        console.log("teachSubjectTopicID", teachSubjectTopicID);
        const teachSubject = yield teachSubjectTopics_1.default.findById(teachSubjectTopicID);
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
exports.getOneTeachSubjectTopicNow = getOneTeachSubjectTopicNow;
const deleteOneTeachSubjectTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { teachSubjectTopicID, subjectID } = req.params;
        const getSubject = yield teachSubjectModel_1.default.findById(subjectID);
        yield teachSubjectTopics_1.default.findByIdAndDelete(teachSubjectTopicID);
        const teachSubject = yield teachSubjectTopics_1.default.findByIdAndDelete(teachSubjectTopicID);
        (_a = getSubject === null || getSubject === void 0 ? void 0 : getSubject.topics) === null || _a === void 0 ? void 0 : _a.pull(subjectID);
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
exports.deleteOneTeachSubjectTopic = deleteOneTeachSubjectTopic;
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
