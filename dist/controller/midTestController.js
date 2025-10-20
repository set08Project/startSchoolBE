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
exports.deleteMidTest = exports.readMidTest = exports.updateSubjectMidTest = exports.startSubjectMidTest = exports.readSubjectMidTest = exports.createSubjectMidTest = void 0;
const midTestModel_1 = __importDefault(require("../model/midTestModel"));
const lodash_1 = __importDefault(require("lodash"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const mammoth_1 = __importDefault(require("mammoth"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const mongoose_1 = require("mongoose");
const createSubjectMidTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { classID, subjectID } = req.params;
        const { instruction, duration, mark, theory } = req.body;
        let filePath = node_path_1.default.join(__dirname, "../uploads/examination");
        const classRoom = yield classroomModel_1.default.findById(classID);
        const checkForSubject = yield subjectModel_1.default.findById(subjectID);
        const findTeacher = yield staffModel_1.default.findById(classRoom === null || classRoom === void 0 ? void 0 : classRoom.teacherID);
        const findSubjectTeacher = yield subjectModel_1.default.findById(checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.teacherID);
        const school = yield schoolModel_1.default.findById(findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.schoolIDs);
        const uploadedPath = (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.path;
        if (!uploadedPath) {
            return res
                .status(400)
                .json({ message: "No upload file provided", status: 400 });
        }
        const originalName = ((_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.originalname) || uploadedPath;
        const ext = node_path_1.default.extname(originalName).toLowerCase();
        let value = [];
        if (ext === ".doc" || ext === ".docx") {
            const { value: rawText } = yield mammoth_1.default.extractRawText({
                path: uploadedPath,
            });
            // Clean rawText: remove common bullet characters and normalize numbering
            let cleaned = rawText || "";
            // remove bullet characters
            cleaned = cleaned.replace(/[•◦‣▪–—]/g, " ");
            // normalize multiple spaces and tabs
            cleaned = cleaned.replace(/\t+/g, " ").replace(/ {2,}/g, " ");
            // Split into non-empty lines
            const rawLines = cleaned
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter((l) => l);
            let questionData = {};
            let options = [];
            const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
            for (const lineOrig of rawLines) {
                let line = lineOrig;
                // Remove leading numbering like "1.", "2)", "(a)" etc for easier parsing
                line = line.replace(/^\s*\(?\d+\)?[\.|\)]\s*/g, "");
                line = line.replace(/^\s*\(?[a-zA-Z]\)?[\.|\)]\s*/g, "");
                // Normalize whitespace
                line = line.replace(/\s{2,}/g, " ").trim();
                // Check for start of a new question
                if (/^\d+\./.test(lineOrig) || /^\d+\)/.test(lineOrig)) {
                    // save previous
                    if (Object.keys(questionData).length) {
                        questionData.options = options;
                        value.push(questionData);
                        questionData = {};
                        options = [];
                    }
                    // Extract inline bracketed URL
                    const match = line.match(BRACKET_URL_REGEX);
                    const url = match ? match[1].trim() : null;
                    if (url)
                        line = line.replace(BRACKET_URL_REGEX, "").trim();
                    // detect inline options on the same line (A. ... B. ...)
                    const aIdx = line.search(/\bA\./i);
                    const hasInlineOptions = aIdx > -1 && /\bB\./i.test(line);
                    if (hasInlineOptions) {
                        const stem = line.slice(0, aIdx).trim();
                        questionData = { question: stem };
                        const optPart = line.slice(aIdx);
                        const parts = optPart
                            .split(/(?=[A-D]\.)/i)
                            .filter(Boolean);
                        options = parts.map((p) => p.replace(/^[A-D]\.|^[a-d]\./i, "").trim());
                    }
                    else {
                        questionData = { question: line };
                    }
                    if (url)
                        questionData.images = [url];
                }
                else if (/^[A-D]\./i.test(line)) {
                    // option line
                    options.push(line.replace(/^[A-D]\./i, "").trim());
                }
                else if (/^Answer:\s*/i.test(line)) {
                    const m = line.match(/^Answer:\s*([A-D])(?:\.\s*(.*))?/i);
                    if (m) {
                        questionData.answer = m[2] ? m[2].trim() : m[1].toUpperCase();
                    }
                    else {
                        questionData.answer = line.replace(/^Answer:\s*/i, "").trim();
                    }
                }
                else if (/^Explanation:\s*/i.test(line)) {
                    questionData.explanation = line
                        .replace(/^Explanation:\s*/i, "")
                        .trim();
                }
                else {
                    // continuation of stem
                    if (questionData && !questionData.options) {
                        const match = line.match(BRACKET_URL_REGEX);
                        const url = match ? match[1].trim() : null;
                        if (url)
                            line = line.replace(BRACKET_URL_REGEX, "").trim();
                        questionData.question = `${questionData.question} ${line}`.trim();
                        if (url) {
                            if (!questionData.images)
                                questionData.images = [];
                            questionData.images.push(url);
                        }
                    }
                }
            }
            if (Object.keys(questionData).length) {
                if (!questionData.options)
                    questionData.options = options;
                value.push(questionData);
            }
        }
        else {
            const data = yield (0, csvtojson_1.default)().fromFile(uploadedPath);
            for (const i of data) {
                const opts = i.options ? i.options.split(";;") : [];
                const read = {
                    question: i.Question ||
                        i.question ||
                        i.questionText ||
                        i.questionTitle ||
                        i.question,
                    options: opts,
                    answer: i.Answer || i.answer,
                    explanation: i.Explanation || i.explanation,
                };
                value.push(read);
            }
        }
        let term = lodash_1.default.find(value, { term: school === null || school === void 0 ? void 0 : school.presentTerm });
        let session = lodash_1.default.find(value, { session: school === null || school === void 0 ? void 0 : school.presentSession });
        const deleteFilesInFolder = (folderPath) => {
            if (node_fs_1.default.existsSync(folderPath)) {
                const files = node_fs_1.default.readdirSync(folderPath);
                files.forEach((file) => {
                    const filePath = node_path_1.default.join(folderPath, file);
                    node_fs_1.default.unlinkSync(filePath);
                });
                console.log(`All files in the folder '${folderPath}' have been deleted.`);
            }
            else {
                console.log(`The folder '${folderPath}' does not exist.`);
            }
        };
        if (checkForSubject) {
            const quizes = yield midTestModel_1.default.create({
                subjectTitle: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.subjectTitle,
                subjectID: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject._id,
                session: school === null || school === void 0 ? void 0 : school.presentSession,
                term: school === null || school === void 0 ? void 0 : school.presentTerm,
                quiz: {
                    instruction: { duration, mark, instruction },
                    question: value,
                    theory,
                },
                totalQuestions: value === null || value === void 0 ? void 0 : value.length,
                status: "midTest",
                startExam: false,
            });
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
            (_c = checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.performance) === null || _c === void 0 ? void 0 : _c.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.save();
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.save();
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.save();
            const x = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                yield deleteFilesInFolder(filePath);
                clearTimeout(x);
            }), 15000);
            return res.status(201).json({
                message: "midTest entry successfully",
                data: quizes,
                exam: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.examination,
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
            error: error,
            data: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.createSubjectMidTest = createSubjectMidTest;
const readSubjectMidTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectID } = req.params;
        const subject = yield subjectModel_1.default.findById(subjectID).populate({
            path: "midTest",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        let midTest = lodash_1.default.filter(subject === null || subject === void 0 ? void 0 : subject.midTest, {
            status: "midTest",
        })[0];
        return res.status(201).json({
            message: "subject midTest read successfully",
            midTest,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject exam",
            status: 404,
        });
    }
});
exports.readSubjectMidTest = readSubjectMidTest;
const startSubjectMidTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { midTestID } = req.params;
        const { started } = req.body;
        const subject = yield midTestModel_1.default.findByIdAndUpdate(midTestID, {
            startMidTest: started,
        }, { new: true });
        return res.status(201).json({
            message: "start subject mid test read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject mid test",
            status: 404,
        });
    }
});
exports.startSubjectMidTest = startSubjectMidTest;
const updateSubjectMidTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { midTestID } = req.params;
        const { mark, duration } = req.body;
        const midTest = yield midTestModel_1.default.findByIdAndUpdate(midTestID);
        const subject = yield midTestModel_1.default.findByIdAndUpdate(midTestID, {
            quiz: {
                instruction: { duration, mark },
                question: (_a = midTest === null || midTest === void 0 ? void 0 : midTest.quiz) === null || _a === void 0 ? void 0 : _a.question,
                theory: (_b = midTest === null || midTest === void 0 ? void 0 : midTest.quiz) === null || _b === void 0 ? void 0 : _b.theory,
            },
        }, { new: true });
        return res.status(201).json({
            message: "start subject mid test read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject mid test",
            status: 404,
        });
    }
});
exports.updateSubjectMidTest = updateSubjectMidTest;
const readMidTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { midTestID } = req.params;
        const quiz = yield midTestModel_1.default.findById(midTestID);
        return res.status(201).json({
            message: "subject mid Test read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject mid Test",
            data: error.message,
            status: 404,
        });
    }
});
exports.readMidTest = readMidTest;
const deleteMidTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { midTestID, subjectID, teacherID } = req.params;
        const quizSubject = yield subjectModel_1.default.findById(subjectID);
        const quizTeacher = yield staffModel_1.default.findById(teacherID);
        yield midTestModel_1.default.findByIdAndDelete(midTestID);
        if (quizSubject && Array.isArray(quizSubject.midTest)) {
            quizSubject.midTest = quizSubject.midTest.filter((id) => id.toString() !== midTestID);
            yield quizSubject.save();
        }
        quizTeacher.pull(new mongoose_1.Types.ObjectId(midTestID));
        quizTeacher.save();
        return res.status(201).json({
            message: "subject mid Test read successfully",
            // data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject mid Test",
            data: error.message,
            status: 404,
        });
    }
});
exports.deleteMidTest = deleteMidTest;
