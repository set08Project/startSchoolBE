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
exports.deleteExamination = exports.readExamination = exports.startSubjectExamination = exports.readSubjectExamination = exports.createSubjectExam = void 0;
const examinationModel_1 = __importDefault(require("../model/examinationModel"));
const lodash_1 = __importDefault(require("lodash"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const mammoth_1 = __importDefault(require("mammoth"));
const cheerio_1 = __importDefault(require("cheerio"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const streamifier_1 = require("../utils/streamifier");
const mongoose_1 = require("mongoose");
const createSubjectExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { classID, subjectID } = req.params;
        const { theory, instruction, duration, mark } = req.body;
        let filePath = node_path_1.default.join(__dirname, "../uploads/examination");
        const classRoom = yield classroomModel_1.default.findById(classID);
        const checkForSubject = yield subjectModel_1.default.findById(subjectID);
        // teacher assigned to the class
        const findTeacher = yield staffModel_1.default.findById(classRoom === null || classRoom === void 0 ? void 0 : classRoom.teacherID);
        // teacher assigned specifically to the subject (teacherID stored on subject)
        const findSubjectTeacher = yield staffModel_1.default.findById(checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.teacherID);
        const school = yield schoolModel_1.default.findById(findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.schoolIDs);
        // const { secure_url, public_id }: any = await streamUpload(req);
        const uploadedPath = (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.path;
        if (!uploadedPath) {
            return res.status(400).json({
                message: "No upload file provided",
                status: 400,
            });
        }
        const originalName = ((_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.originalname) || uploadedPath;
        const ext = node_path_1.default.extname(originalName).toLowerCase();
        let value = [];
        if (ext === ".doc" || ext === ".docx") {
            // Convert Word docx to HTML to preserve images and markup
            const result = yield mammoth_1.default.convertToHtml({ path: uploadedPath }, { includeEmbeddedStyleMap: true });
            let html = result.value || "";
            // Remove all bullet/numbered lists from HTML
            html = html.replace(/<(ul|ol)[^>]*>[\s\S]*?<\/\1>/gi, "");
            // Remove <li> tags (if any remain)
            html = html.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "$1");
            // Remove common bullet characters from text (•, ◦, etc.)
            html = html.replace(/[•◦‣▪–—]/g, "");
            const $ = cheerio_1.default.load(html);
            // split by paragraphs and headings to get question blocks
            const blocks = [];
            const elems = $("p, h1, h2, h3").toArray();
            for (const el of elems) {
                let text = $(el)
                    .text()
                    .trim();
                // Remove leading numbering (e.g., "1. ", "2) ", "(a) ", "a. ")
                text = text.replace(/^\s*\d+[\.|\)]\s*/g, "");
                text = text.replace(/^\s*[a-zA-Z][\.|\)]\s*/g, "");
                if (text)
                    blocks.push(text);
            }
            // collect images mapped by their surrounding block index
            const imagesByIndex = {};
            const imgs = $("img").toArray();
            for (const imgEl of imgs) {
                const src = $(imgEl).attr("src");
                if (!src)
                    continue;
                const parent = $(imgEl).closest("p, li, h1, h2, h3")[0];
                let idx = -1;
                if (parent) {
                    idx = elems.indexOf(parent);
                }
                const key = idx >= 0 ? idx : blocks.length;
                imagesByIndex[key] = imagesByIndex[key] || [];
                imagesByIndex[key].push(src);
            }
            // If images are data URIs (embedded), upload them to Cloudinary so they
            // are visible and performant for students. Replace data URIs with hosted URLs.
            for (const k of Object.keys(imagesByIndex)) {
                const arr = imagesByIndex[Number(k)];
                const uploadedUrls = [];
                for (const src of arr) {
                    try {
                        if (typeof src === "string" && src.startsWith("data:")) {
                            const uploadRes = yield (0, streamifier_1.uploadDataUri)(src, "exams");
                            if (uploadRes && uploadRes.secure_url) {
                                uploadedUrls.push(uploadRes.secure_url);
                            }
                        }
                        else if (typeof src === "string") {
                            // not a data URI (likely a valid src already) — keep as-is
                            uploadedUrls.push(src);
                        }
                    }
                    catch (err) {
                        // on failure, keep the original src so diagram isn't lost
                        uploadedUrls.push(src);
                    }
                }
                imagesByIndex[Number(k)] = uploadedUrls;
            }
            let questionData = {};
            let options = [];
            const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
            for (let idx = 0; idx < blocks.length; idx++) {
                let line = blocks[idx];
                // Normalize whitespace
                line = line
                    .replace(/\t+/g, " ")
                    .replace(/\s{2,}/g, " ")
                    .trim();
                // If this is the start of a new numbered question
                if (/^\d+\./.test(line)) {
                    // Save previous question if present
                    if (Object.keys(questionData).length) {
                        questionData.options = options;
                        if (imagesByIndex[idx - 1])
                            questionData.images = imagesByIndex[idx - 1];
                        value.push(questionData);
                        questionData = {};
                        options = [];
                    }
                    // Extract and remove any inline Answer or Explanation from the same line
                    const inlineAnswerMatch = line.match(/Answer:\s*([A-D])(?:\.\s*(.*))?/i);
                    if (inlineAnswerMatch) {
                        // keep the answer text; if it contains option text, use it, else use the letter
                        questionData.answer = inlineAnswerMatch[2]
                            ? inlineAnswerMatch[2].trim()
                            : inlineAnswerMatch[1].toUpperCase();
                        line = line.replace(/Answer:\s*([A-D])(?:\.\s*(.*))?/i, "").trim();
                    }
                    const inlineExplMatch = line.match(/Explanation:\s*(.*)$/i);
                    if (inlineExplMatch) {
                        questionData.explanation = inlineExplMatch[1].trim();
                        line = line.replace(/Explanation:\s*(.*)$/i, "").trim();
                    }
                    // Extract bracketed image URL if present in same line
                    const bracketMatch = line.match(BRACKET_URL_REGEX);
                    const bracketUrl = bracketMatch ? bracketMatch[1].trim() : null;
                    if (bracketUrl)
                        line = line.replace(BRACKET_URL_REGEX, "").trim();
                    // Detect inline options in the same line (A. ... B. ... C. ... D.)
                    const aIdx = line.search(/\bA\./);
                    const hasInlineOptions = aIdx > -1 && /\bB\./.test(line);
                    if (hasInlineOptions) {
                        // Stem is text before 'A.'
                        const stem = line
                            .slice(0, aIdx)
                            .replace(/^\d+\.\s*/, "")
                            .trim();
                        questionData = { question: stem };
                        // Options portion
                        const optPart = line.slice(aIdx);
                        const parts = optPart.split(/(?=[A-D]\.)/).filter(Boolean);
                        options = parts.map((p) => p.replace(/^[A-D]\.\s*/, "").trim());
                        // If we detected inline answer earlier, ensure it's present
                        if (questionData.answer) {
                            // nothing to do
                        }
                        if (bracketUrl)
                            questionData.images = [bracketUrl];
                        // Do not push yet; behavior keeps consistent with multi-line format
                    }
                    else {
                        // No inline options — treat whole line as stem (question text)
                        const stem = line.replace(/^\d+\.\s*/, "").trim();
                        questionData = { question: stem };
                        if (bracketUrl)
                            questionData.images = [bracketUrl];
                    }
                }
                else if (/^[A-D]\./.test(line)) {
                    // Option line
                    options.push(line.replace(/^[A-D]\./, "").trim());
                }
                else if (/^Answer:\s*/.test(line)) {
                    // Answer on its own line; could be 'Answer: A' or 'Answer: A. option text'
                    const m = line.match(/Answer:\s*([A-D])(?:\.\s*(.*))?/i);
                    if (m) {
                        questionData.answer = m[2] ? m[2].trim() : m[1].toUpperCase();
                    }
                    else {
                        questionData.answer = line.replace(/^Answer:\s*/i, "").trim();
                    }
                }
                else if (/^Explanation:\s*/.test(line)) {
                    questionData.explanation = line
                        .replace(/^Explanation:\s*/i, "")
                        .trim();
                }
                else {
                    // Continuation of question stem (multi-line stem) — append if no options yet
                    if (questionData && !questionData.options) {
                        // also strip bracketed image urls if present
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
                // If options were parsed inline, ensure options array is set
                if (!questionData.options)
                    questionData.options = options;
                // Attach images that were nearby (if none already attached)
                const lastIdx = blocks.length - 1;
                if (!questionData.images && imagesByIndex[lastIdx])
                    questionData.images = imagesByIndex[lastIdx];
                value.push(questionData);
            }
        }
        else {
            // treat as CSV
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
        // checkForSubject;
        if (checkForSubject) {
            // if (term && session) {
            //   const quizes = await quizModel.findByIdAndUpdate(
            //     term?._id,
            //     {
            //       quiz: {
            //         instruction: { duration, mark, instruction },
            //         question: value,
            //       },
            //       totalQuestions: value?.length,
            //       startExam: false,
            //     },
            //     { new: true }
            //   );
            //   let filePath = path.join(__dirname, "uploads");
            //   const deleteFilesInFolder = (folderPath: any) => {
            //     if (fs.existsSync(folderPath)) {
            //       const files = fs.readdirSync(folderPath);
            //       files.forEach((file) => {
            //         const filePath = path.join(folderPath, file);
            //         fs.unlinkSync(filePath);
            //       });
            //       console.log(
            //         `All files in the folder '${folderPath}' have been deleted.`
            //       );
            //     } else {
            //       console.log(`The folder '${folderPath}' does not exist.`);
            //     }
            //   };
            //   deleteFilesInFolder(filePath);
            //   return res.status(201).json({
            //     message: "update exam entry successfully",
            //     data: quizes,
            //     status: 201,
            //   });
            // } else {
            //   const quizes = await quizModel.create({
            //     subjectTitle: checkForSubject?.subjectTitle,
            //     subjectID: checkForSubject?._id,
            //     session: school?.presentSession,
            //     term: school?.presentTerm,
            //     quiz: {
            //       instruction: { duration, mark, instruction },
            //       question: value,
            //     },
            //     totalQuestions: value?.length,
            //     status: "examination",
            //     startExam: false,
            //   });
            //   checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
            //   checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
            //   checkForSubject?.save();
            //   findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
            //   findTeacher?.save();
            //   findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
            //   findSubjectTeacher?.save();
            //   let filePath = path.join(__dirname, "uploads");
            //   const deleteFilesInFolder = (folderPath: any) => {
            //     if (fs.existsSync(folderPath)) {
            //       const files = fs.readdirSync(folderPath);
            //       files.forEach((file) => {
            //         const filePath = path.join(folderPath, file);
            //         fs.unlinkSync(filePath);
            //       });
            //       console.log(
            //         `All files in the folder '${folderPath}' have been deleted.`
            //       );
            //     } else {
            //       console.log(`The folder '${folderPath}' does not exist.`);
            //     }
            //   };
            //   return res.status(201).json({
            //     message: "exam entry successfully",
            //     // data: quizes,
            //     status: 201,
            //   });
            // }
            // await examinationModel.deleteMany();
            const quizes = yield examinationModel_1.default.create({
                subjectTitle: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.subjectTitle,
                subjectID: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject._id,
                session: school === null || school === void 0 ? void 0 : school.presentSession,
                term: school === null || school === void 0 ? void 0 : school.presentTerm,
                // quiz: {
                //   instruction: { duration, mark, instruction },
                //   question: value,
                // },
                quiz: {
                    instruction: { duration, mark, instruction },
                    question: value,
                    theory,
                },
                totalQuestions: value === null || value === void 0 ? void 0 : value.length,
                status: "examination",
                startExam: false,
            });
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.examination.push(new mongoose_1.Types.ObjectId(quizes._id));
            (_c = checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.performance) === null || _c === void 0 ? void 0 : _c.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.save();
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.examination.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.save();
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.examination.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.save();
            const x = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                yield deleteFilesInFolder(filePath);
                clearTimeout(x);
            }), 15000);
            return res.status(201).json({
                message: "exam entry successfully",
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
exports.createSubjectExam = createSubjectExam;
const readSubjectExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectID } = req.params;
        const subject = yield subjectModel_1.default.findById(subjectID).populate({
            path: "examination",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        let exam = lodash_1.default.filter(subject === null || subject === void 0 ? void 0 : subject.examination, {
            status: "examination",
        })[0];
        return res.status(201).json({
            message: "subject exam read successfully",
            exam,
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
exports.readSubjectExamination = readSubjectExamination;
const startSubjectExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { examID } = req.params;
        const { started } = req.body;
        const subject = yield examinationModel_1.default.findByIdAndUpdate(examID, {
            startExam: started,
        }, { new: true });
        return res.status(201).json({
            message: "start subject exam read successfully",
            data: subject,
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
exports.startSubjectExamination = startSubjectExamination;
const readExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { examID } = req.params;
        const quiz = yield examinationModel_1.default.findById(examID);
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
exports.readExamination = readExamination;
const deleteExamination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { examID, subjectID, teacherID } = req.params;
        const quizSubject = yield subjectModel_1.default.findById(subjectID);
        const quizTeacher = yield staffModel_1.default.findById(teacherID);
        const quiz = yield examinationModel_1.default.findByIdAndDelete(examID);
        quizSubject.pull(new mongoose_1.Types.ObjectId(examID));
        quizSubject.save();
        quizTeacher.pull(new mongoose_1.Types.ObjectId(examID));
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
exports.deleteExamination = deleteExamination;
