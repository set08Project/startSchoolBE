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
exports.deleteOneArticle = exports.viewArticle = exports.likeArticle = exports.readOneArticle = exports.readAllArticles = exports.createTeacherArticle = exports.createArticle = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const mongoose_1 = require("mongoose");
const articleModel_1 = __importDefault(require("../model/articleModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const streamifier_1 = require("../utils/streamifier");
const staffModel_1 = __importDefault(require("../model/staffModel"));
const createArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, studentID } = req.params;
        const { title, content, desc } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const student = yield studentModel_1.default.findById(studentID);
        if (school && student) {
            const { secure_url } = yield (0, streamifier_1.streamUpload)(req);
            const article = yield articleModel_1.default.create({
                coverImage: secure_url,
                schoolID,
                studentID,
                title,
                content,
                desc,
                student: `${student.studentFirstName} ${student.studentLastName}`,
                avatar: student.avatar,
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
const createTeacherArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, teacherID } = req.params;
        const { title, content, desc } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const student = yield staffModel_1.default.findById(teacherID);
        if (school && student) {
            const { secure_url } = yield (0, streamifier_1.streamUpload)(req);
            const article = yield articleModel_1.default.create({
                coverImage: secure_url,
                schoolID,
                studentID: teacherID,
                title,
                content,
                desc,
                student: `${student.staffName} `,
                avatar: student.avatar,
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
exports.createTeacherArticle = createTeacherArticle;
const readAllArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "articles", options: { sort: { createdAt: -1 } } });
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
const likeArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { articleID, readerID } = req.params;
        const article = yield articleModel_1.default.findById(articleID);
        const check = (_a = article === null || article === void 0 ? void 0 : article.like) === null || _a === void 0 ? void 0 : _a.some((el) => {
            return el === readerID;
        });
        if (!check) {
            yield articleModel_1.default.findByIdAndUpdate(articleID, {
                like: [...article === null || article === void 0 ? void 0 : article.like, readerID],
            }, { new: true });
            return res.status(200).json({
                message: "Reading one article",
                data: article,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "can't like again",
                status: 201,
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
exports.likeArticle = likeArticle;
const viewArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { articleID, readerID } = req.params;
        const article = yield articleModel_1.default.findById(articleID);
        const check = (_a = article === null || article === void 0 ? void 0 : article.view) === null || _a === void 0 ? void 0 : _a.some((el) => {
            return el === readerID;
        });
        if (!check) {
            yield articleModel_1.default.findByIdAndUpdate(articleID, {
                view: [...article === null || article === void 0 ? void 0 : article.view, readerID],
            }, { new: true });
            return res.status(200).json({
                message: "Reading one article",
                data: article,
                status: 201,
            });
        }
        else {
            return res.status(200).json({
                message: "can't reAdd",
                status: 201,
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
exports.viewArticle = viewArticle;
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
