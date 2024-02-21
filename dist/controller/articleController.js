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
exports.deleteOneArticle = exports.readOneArticle = exports.readAllArticles = exports.createArticle = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const mongoose_1 = require("mongoose");
const articleModel_1 = __importDefault(require("../model/articleModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const createArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, studentID } = req.params;
        const { title, content, desc } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const student = yield studentModel_1.default.findById(studentID);
        if (school && student) {
            const article = yield articleModel_1.default.create({
                title,
                content,
                desc,
                student: `${student.studentFirstName} ${student.studentLastName}`,
            });
            school.articles.push(new mongoose_1.Types.ObjectId(article === null || article === void 0 ? void 0 : article._id));
            school === null || school === void 0 ? void 0 : school.save();
            student.articles.push(new mongoose_1.Types.ObjectId(article === null || article === void 0 ? void 0 : article._id));
            student === null || student === void 0 ? void 0 : student.save();
            return res.status(201).json({
                message: "Article created successfully",
                data: article,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Error creating article",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
});
exports.createArticle = createArticle;
const readAllArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "articles", options: { sort: { createdAt: -1 } } });
        console.log(school);
        if (school) {
            return res.status(201).json({
                message: "Article created successfully",
                data: school.articles,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Error reading article",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
});
exports.readAllArticles = readAllArticles;
const readOneArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { articleID } = req.params;
        const article = yield articleModel_1.default.findById(articleID);
        return res.status(200).json({
            message: "Reading one article",
            data: article,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
});
exports.readOneArticle = readOneArticle;
const deleteOneArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, articleID, studentName } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        const student = yield studentModel_1.default.findOne({
            studentFirstName: `${studentName.split(" ")[0]}`,
        });
        if (school && student) {
            const article = yield articleModel_1.default.findByIdAndDelete(articleID);
            school.articles.pull(new mongoose_1.Types.ObjectId(articleID));
            school === null || school === void 0 ? void 0 : school.save();
            student.articles.pull(new mongoose_1.Types.ObjectId(articleID));
            student === null || student === void 0 ? void 0 : student.save();
            return res.status(200).json({
                message: "Reading one article",
                data: article,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Error deleting article",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
        });
    }
});
exports.deleteOneArticle = deleteOneArticle;
