"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMidTest = exports.readMidTest = exports.updateSubjectMidTest = exports.randomizeSubjectMidTest = exports.startSubjectMidTest = exports.readSubjectMidTest = exports.createSubjectMidTest = void 0;
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
const createSubjectMidTest = async (req, res) => {
    try {
        const { classID, subjectID } = req.params;
        const { instruction, duration, mark, theory } = req.body;
        let filePath = node_path_1.default.join(__dirname, "../uploads/examination");
        const classRoom = await classroomModel_1.default.findById(classID);
        const checkForSubject = await subjectModel_1.default.findById(subjectID);
        const findTeacher = await staffModel_1.default.findById(classRoom?.teacherID);
        const findSubjectTeacher = await subjectModel_1.default.findById(checkForSubject?.teacherID);
        const school = await schoolModel_1.default.findById(findTeacher?.schoolIDs);
        const uploadedPath = req?.file?.path;
        if (!uploadedPath) {
            return res
                .status(400)
                .json({ message: "No upload file provided", status: 400 });
        }
        const originalName = req?.file?.originalname || uploadedPath;
        const ext = node_path_1.default.extname(originalName).toLowerCase();
        let value = [];
        if (ext === ".doc" || ext === ".docx") {
            const { value: rawText } = await mammoth_1.default.extractRawText({
                path: uploadedPath,
            });
            const lines = rawText
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l);
            let questionData = {};
            let options = [];
            const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
            for (const lineOrig of lines) {
                let line = lineOrig;
                if (/^\d+\./.test(line)) {
                    if (Object.keys(questionData).length) {
                        questionData.options = options;
                        value.push(questionData);
                        questionData = {};
                        options = [];
                    }
                    // Extract bracketed image URL if present
                    const match = line.match(BRACKET_URL_REGEX);
                    const url = match ? match[1].trim() : null;
                    line = line.replace(BRACKET_URL_REGEX, "").trim();
                    questionData = { question: line };
                    if (url) {
                        questionData.images = [url];
                    }
                }
                else if (/^[A-D]\./.test(line)) {
                    options.push(line.replace(/^[A-D]\./, ""));
                }
                else if (line.startsWith("Answer:")) {
                    questionData.answer = line.replace("Answer:", "").trim();
                }
                else if (line.startsWith("Explanation:")) {
                    questionData.explanation = line.replace("Explanation:", "").trim();
                }
                else {
                    if (questionData && !questionData.options) {
                        // Also extract bracketed image URL from continuation lines
                        const match = line.match(BRACKET_URL_REGEX);
                        const url = match ? match[1].trim() : null;
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
                questionData.options = options;
                value.push(questionData);
            }
        }
        else {
            const data = await (0, csvtojson_1.default)().fromFile(uploadedPath);
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
        let term = lodash_1.default.find(value, { term: school?.presentTerm });
        let session = lodash_1.default.find(value, { session: school?.presentSession });
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
            const quizes = await midTestModel_1.default.create({
                subjectTitle: checkForSubject?.subjectTitle,
                subjectID: checkForSubject?._id,
                session: school?.presentSession,
                term: school?.presentTerm,
                quiz: {
                    instruction: { duration, mark, instruction },
                    question: value,
                    theory,
                },
                totalQuestions: value?.length,
                status: "midTest",
                startExam: false,
            });
            checkForSubject?.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject?.performance?.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject?.save();
            findTeacher?.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher?.save();
            findSubjectTeacher?.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubjectTeacher?.save();
            const x = setTimeout(async () => {
                await deleteFilesInFolder(filePath);
                clearTimeout(x);
            }, 15000);
            return res.status(201).json({
                message: "midTest entry successfully",
                data: quizes,
                exam: checkForSubject?.examination,
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
            data: error?.message,
        });
    }
};
exports.createSubjectMidTest = createSubjectMidTest;
const readSubjectMidTest = async (req, res) => {
    try {
        const { subjectID } = req.params;
        const subject = await subjectModel_1.default.findById(subjectID).populate({
            path: "midTest",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        let midTest = lodash_1.default.filter(subject?.midTest, {
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
};
exports.readSubjectMidTest = readSubjectMidTest;
const startSubjectMidTest = async (req, res) => {
    try {
        const { midTestID } = req.params;
        const { started } = req.body;
        const subject = await midTestModel_1.default.findByIdAndUpdate(midTestID, {
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
};
exports.startSubjectMidTest = startSubjectMidTest;
const randomizeSubjectMidTest = async (req, res) => {
    try {
        const { midTestID } = req.params;
        const { started } = req.body;
        const subject = await midTestModel_1.default.findByIdAndUpdate(midTestID, {
            randomize: started,
        }, { new: true });
        return res.status(201).json({
            message: "start randomize subject mid test read successfully",
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
};
exports.randomizeSubjectMidTest = randomizeSubjectMidTest;
const updateSubjectMidTest = async (req, res) => {
    try {
        const { midTestID } = req.params;
        const { mark, duration } = req.body;
        const midTest = await midTestModel_1.default.findByIdAndUpdate(midTestID);
        const subject = await midTestModel_1.default.findByIdAndUpdate(midTestID, {
            quiz: {
                instruction: { duration, mark },
                question: midTest?.quiz?.question,
                theory: midTest?.quiz?.theory,
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
};
exports.updateSubjectMidTest = updateSubjectMidTest;
const readMidTest = async (req, res) => {
    try {
        const { midTestID } = req.params;
        const quiz = await midTestModel_1.default.findById(midTestID);
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
};
exports.readMidTest = readMidTest;
const deleteMidTest = async (req, res) => {
    try {
        const { midTestID, subjectID } = req.params;
        const quizSubject = await subjectModel_1.default.findById(subjectID);
        const quizTeacher = await staffModel_1.default.findById(quizSubject?.teacherID);
        console.log("quizTeacher", quizTeacher);
        await midTestModel_1.default.findByIdAndDelete(midTestID);
        if (quizSubject && Array.isArray(quizSubject.midTest)) {
            quizSubject.midTest = quizSubject.midTest.filter((id) => id.toString() !== midTestID);
            await quizSubject.save();
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
};
exports.deleteMidTest = deleteMidTest;
