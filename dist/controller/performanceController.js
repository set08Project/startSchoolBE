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
exports.deletePerformance = exports.readOneSubjectMidTestResultPreformance = exports.readMidTestResult = exports.readStudentMidTestResult = exports.readOneSubjectMidTestResult = exports.readExamResult = exports.readStudentExamResult = exports.readOneSubjectExamResult = exports.readSubjectExamResult = exports.readSubjectMidTestResult = exports.createMidTestPerformance = exports.createExamPerformance = exports.readQuizResult = exports.readStudentQuizResult = exports.readOneSubjectQuizResult = exports.updateQuitSubjectQuizResultRecorded = exports.updateSubjectQuizResultRecorded = exports.readSubjectQuizResult = exports.createQuizPerformance = void 0;
const mongoose_1 = require("mongoose");
const studentModel_1 = __importDefault(require("../model/studentModel"));
const quizModel_1 = __importDefault(require("../model/quizModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const performanceModel_1 = __importDefault(require("../model/performanceModel"));
const examinationModel_1 = __importDefault(require("../model/examinationModel"));
const midTestModel_1 = __importDefault(require("../model/midTestModel"));
const createQuizPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { studentID, quizID, subjectID } = req.params;
        const { studentScore, studentGrade, remark, totalQuestions, markPerQuestion, status, } = req.body;
        if (!studentID || !quizID || !subjectID) {
            return res.status(400).json({
                message: "studentID, quizID and subjectID are required",
                status: 400,
            });
        }
        const studentInfo = yield studentModel_1.default.findById(studentID);
        if (!studentInfo) {
            return res
                .status(404)
                .json({ message: "Student not found", status: 404 });
        }
        const quizData = yield quizModel_1.default.findById(quizID);
        if (!quizData) {
            return res.status(404).json({ message: "Exam not found", status: 404 });
        }
        const subject = yield subjectModel_1.default.findById(subjectID);
        if (!subject) {
            return res
                .status(404)
                .json({ message: "Subject not found", status: 404 });
        }
        // compute performanceRating safely
        const questionCount = Array.isArray((_a = quizData === null || quizData === void 0 ? void 0 : quizData.quiz) === null || _a === void 0 ? void 0 : _a.question)
            ? quizData.quiz.question.length
            : typeof (quizData === null || quizData === void 0 ? void 0 : quizData.quiz) === "number"
                ? quizData.quiz
                : 0;
        const perfRating = questionCount > 0 && typeof studentScore === "number"
            ? Number(((studentScore / questionCount) * 100).toFixed(2))
            : 0;
        // count existing attempts for this student and this quiz
        const existingAttempts = yield performanceModel_1.default.countDocuments({
            student: studentID,
            quizID,
        });
        const attemptNumber = existingAttempts + 1;
        // create performance document
        const performanceDoc = yield performanceModel_1.default.create({
            remark,
            subjectTitle: quizData === null || quizData === void 0 ? void 0 : quizData.subjectTitle,
            studentScore,
            studentGrade,
            totalQuestions,
            markPerQuestion,
            quizDone: true,
            status,
            performanceRating: perfRating,
            attemptNumber,
            className: studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.classAssigned,
            quizID: quizID,
            studentName: `${(studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.studentFirstName) || ""} ${(studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.studentLastName) || ""}`.trim(),
            studentAvatar: studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.avatar,
            subjectID: subject._id,
            student: studentID,
        });
        // push performance id to examination, student and subject safely
        const perfId = new mongoose_1.Types.ObjectId(performanceDoc._id);
        const ensureAndPush = (Model, id) => __awaiter(void 0, void 0, void 0, function* () {
            const doc = yield Model.findById(id).select("performance");
            if (!doc)
                return;
            if (!Array.isArray(doc.performance)) {
                // initialize to empty array if null or not an array
                doc.performance = [];
            }
            doc.performance.push(perfId);
            yield doc.save();
        });
        yield Promise.all([
            ensureAndPush(examinationModel_1.default, quizID),
            ensureAndPush(studentModel_1.default, studentID),
            ensureAndPush(subjectModel_1.default, subjectID),
        ]);
        // Recalculate student's totalPerformance from performanceModel (source of truth)
        const performances = yield performanceModel_1.default
            .find({ student: studentID })
            .select("performanceRating")
            .lean();
        const ratings = (performances || [])
            .map((p) => typeof p.performanceRating === "number" && !isNaN(p.performanceRating)
            ? p.performanceRating
            : null)
            .filter((r) => r !== null);
        const totalSum = ratings.reduce((a, b) => a + b, 0);
        const count = ratings.length;
        const avg = count > 0 ? totalSum / count : 0;
        yield studentModel_1.default.findByIdAndUpdate(studentID, { totalPerformance: avg });
        return res.status(201).json({
            message: "exam performance created successfully",
            data: performanceDoc,
            status: 201,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error creating exam performance",
            status: 500,
            data: error === null || error === void 0 ? void 0 : error.message,
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
const updateSubjectQuizResultRecorded = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { performanceID } = req.params;
        const subject = yield performanceModel_1.default.findByIdAndUpdate(performanceID, {
            quizRecorded: true,
        }, { new: true });
        return res.status(201).json({
            message: "subject quiz performance recorded successfully",
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
exports.updateSubjectQuizResultRecorded = updateSubjectQuizResultRecorded;
const updateQuitSubjectQuizResultRecorded = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { performanceID } = req.params;
        const subject = yield performanceModel_1.default.findByIdAndUpdate(performanceID, {
            quizRecorded: false,
        }, { new: true });
        return res.status(201).json({
            message: "subject quiz performance recorded successfully",
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
exports.updateQuitSubjectQuizResultRecorded = updateQuitSubjectQuizResultRecorded;
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
// Examination
const createExamPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { studentID, quizID, subjectID } = req.params;
        const { studentScore, studentGrade, remark, totalQuestions, markPerQuestion, status, } = req.body;
        const studentInfo = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "performance" });
        const quizData = yield examinationModel_1.default.findById(quizID);
        const subject = yield subjectModel_1.default.findById(subjectID);
        if (quizData) {
            const existingAttempts = yield performanceModel_1.default.countDocuments({
                student: studentID,
                quizID,
            });
            const attemptNumber = existingAttempts + 1;
            const quizes = yield performanceModel_1.default.create({
                remark,
                subjectTitle: quizData === null || quizData === void 0 ? void 0 : quizData.subjectTitle,
                studentScore,
                studentGrade,
                totalQuestions,
                markPerQuestion,
                quizDone: true,
                status,
                performanceRating: parseInt(((studentScore / ((_a = quizData === null || quizData === void 0 ? void 0 : quizData.quiz) === null || _a === void 0 ? void 0 : _a.question.length)) * 100).toFixed(2)),
                attemptNumber,
                className: studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.classAssigned,
                quizID: quizID,
                studentName: `${studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.studentFirstName} ${studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.studentLastName}`,
                studentAvatar: studentInfo.avatar,
                subjectID: subject === null || subject === void 0 ? void 0 : subject._id,
                student: studentID,
            });
            (_b = quizData === null || quizData === void 0 ? void 0 : quizData.performance) === null || _b === void 0 ? void 0 : _b.push(new mongoose_1.Types.ObjectId(quizes._id));
            yield (quizData === null || quizData === void 0 ? void 0 : quizData.save());
            (_c = studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.performance) === null || _c === void 0 ? void 0 : _c.push(new mongoose_1.Types.ObjectId(quizes._id));
            yield (studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.save());
            (_d = subject === null || subject === void 0 ? void 0 : subject.performance) === null || _d === void 0 ? void 0 : _d.push(new mongoose_1.Types.ObjectId(quizes._id));
            yield (subject === null || subject === void 0 ? void 0 : subject.save());
            const getStudent = yield studentModel_1.default.findByIdAndUpdate(studentID, { $push: { performance: new mongoose_1.Types.ObjectId(quizes._id) } }, { new: true });
            const ratings = [];
            const totalSum = ratings.reduce((a, b) => a + b, 0);
            const count = ratings.length;
            const avg = count > 0 ? totalSum / count : 0;
            yield studentModel_1.default.findByIdAndUpdate(studentID, { totalPerformance: avg }, { new: true });
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
exports.createExamPerformance = createExamPerformance;
// Mid Test
// export const createMidTestPerformance = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { studentID, quizID, subjectID } = req.params;
//     const {
//       studentScore,
//       studentGrade,
//       remark,
//       totalQuestions,
//       markPerQuestion,
//       status,
//     } = req.body;
//     const studentInfo: any = await studentModel
//       .findById(studentID)
//       .populate({ path: "performance" });
//     const quizData: any = await midTestModel.findById(quizID);
//     const subject = await subjectModel.findById(subjectID);
//     if (quizData) {
//       const existingAttempts = await performanceModel.countDocuments({
//         student: studentID,
//         quizID,
//       });
//       const attemptNumber = existingAttempts + 1;
//       const quizes = await performanceModel.create({
//         remark,
//         subjectTitle: quizData?.subjectTitle,
//         studentScore,
//         studentGrade,
//         totalQuestions,
//         markPerQuestion,
//         quizDone: true,
//         status,
//         performanceRating: parseInt(
//           ((studentScore / quizData?.quiz?.question.length) * 100).toFixed(2)
//         ),
//         attemptNumber,
//         className: studentInfo?.classAssigned,
//         quizID: quizID,
//         studentID,
//         studentName: `${studentInfo?.studentFirstName} ${studentInfo?.studentLastName}`,
//         studentAvatar: studentInfo.avatar,
//         subjectID: subject?._id,
//         student: studentID,
//       });
//       quizData?.performance?.push(new Types.ObjectId(quizes._id));
//       await quizData?.save();
//       // studentInfo?.performance?.push(new Types.ObjectId(quizes._id));
//       // await studentInfo?.save();
//       await studentModel.findByIdAndUpdate(
//         studentID,
//         { $push: { performance: new Types.ObjectId(quizes._id) } },
//         { new: true }
//       );
//       subject?.performance?.push(new Types.ObjectId(quizes._id));
//       await subject?.save();
//       // Recalculate student's totalPerformance using only valid numeric ratings
//       const getStudent = await studentModel.findById(studentID).populate({
//         path: "performance",
//       });
//       const ratings: number[] = [];
//       getStudent?.performance?.forEach((el: any) => {
//         if (
//           typeof el.performanceRating === "number" &&
//           !isNaN(el.performanceRating)
//         ) {
//           ratings.push(el.performanceRating);
//         }
//       });
//       const totalSum = ratings.reduce((a: number, b: number) => a + b, 0);
//       const count = ratings.length;
//       const avg = count > 0 ? totalSum / count : 0;
//       await studentModel.findByIdAndUpdate(
//         studentID,
//         { totalPerformance: avg },
//         { new: true }
//       );
//       return res.status(201).json({
//         message: "quiz entry created successfully",
//         data: quizes,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject quiz",
//       status: 404,
//       data: error.message,
//     });
//   }
// };
const createMidTestPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { studentID, quizID, subjectID } = req.params;
        const { studentScore, studentGrade, remark, totalQuestions, markPerQuestion, status, } = req.body;
        // Input validation
        if (!studentID || !quizID || !subjectID) {
            return res.status(400).json({
                message: "studentID, quizID and subjectID are required",
                status: 400,
            });
        }
        if (typeof studentScore !== "number" || studentScore < 0) {
            return res.status(400).json({
                message: "Valid studentScore is required",
                status: 400,
            });
        }
        // Find required documents
        const studentInfo = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "performance" });
        if (!studentInfo) {
            return res.status(404).json({
                message: "Student not found",
                status: 404,
            });
        }
        const quizData = yield midTestModel_1.default.findById(quizID);
        if (!quizData) {
            return res.status(404).json({
                message: "Mid test not found",
                status: 404,
            });
        }
        const subject = yield subjectModel_1.default.findById(subjectID);
        if (!subject) {
            return res.status(404).json({
                message: "Subject not found",
                status: 404,
            });
        }
        // Calculate performance rating safely
        const questionCount = Array.isArray((_a = quizData === null || quizData === void 0 ? void 0 : quizData.quiz) === null || _a === void 0 ? void 0 : _a.question)
            ? quizData.quiz.question.length
            : typeof (quizData === null || quizData === void 0 ? void 0 : quizData.quiz) === "number"
                ? quizData.quiz
                : 0;
        if (questionCount === 0) {
            return res.status(400).json({
                message: "Invalid quiz question count",
                status: 400,
            });
        }
        const performanceRating = Number(((studentScore / questionCount) * 100).toFixed(2));
        if (isNaN(performanceRating)) {
            return res.status(400).json({
                message: "Invalid performance rating calculation",
                status: 400,
            });
        }
        // Count existing attempts
        const existingAttempts = yield performanceModel_1.default.countDocuments({
            student: studentID,
            quizID,
        });
        // Create performance document
        const quizes = yield performanceModel_1.default.create({
            remark,
            subjectTitle: quizData.subjectTitle || "",
            studentScore,
            studentGrade,
            totalQuestions,
            markPerQuestion,
            quizDone: true,
            status,
            performanceRating,
            attemptNumber: existingAttempts + 1,
            className: studentInfo.classAssigned || "",
            quizID: quizID,
            studentID,
            studentName: `${studentInfo.studentFirstName || ""} ${studentInfo.studentLastName || ""}`.trim(),
            studentAvatar: studentInfo.avatar || "",
            subjectID: subject._id,
            student: studentID,
        });
        // Update references atomically
        yield Promise.all([
            midTestModel_1.default.findByIdAndUpdate(quizID, { $push: { performance: new mongoose_1.Types.ObjectId(quizes._id) } }, { new: true }),
            studentModel_1.default.findByIdAndUpdate(studentID, { $push: { performance: new mongoose_1.Types.ObjectId(quizes._id) } }, { new: true }),
            subjectModel_1.default.findByIdAndUpdate(subjectID, { $push: { performance: new mongoose_1.Types.ObjectId(quizes._id) } }, { new: true }),
        ]);
        // Recalculate student's performance
        const performances = yield performanceModel_1.default
            .find({ student: studentID })
            .select("performanceRating");
        const ratings = performances
            .map((p) => typeof p.performanceRating === "number" && !isNaN(p.performanceRating)
            ? p.performanceRating
            : null)
            .filter((r) => r !== null);
        const avg = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        yield studentModel_1.default.findByIdAndUpdate(studentID, { totalPerformance: avg }, { new: true });
        return res.status(201).json({
            message: "Mid test performance created successfully",
            data: quizes,
            status: 201,
        });
    }
    catch (error) {
        console.error("Error creating mid test performance:", error);
        return res.status(500).json({
            message: "Error creating mid test performance",
            status: 500,
            data: error.message,
        });
    }
});
exports.createMidTestPerformance = createMidTestPerformance;
const readSubjectMidTestResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.readSubjectMidTestResult = readSubjectMidTestResult;
const readSubjectExamResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.readSubjectExamResult = readSubjectExamResult;
const readOneSubjectExamResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { subjectID, quizID } = req.params;
        const quiz = yield examinationModel_1.default.findById(quizID);
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
        const idCompare = (_a = subject === null || subject === void 0 ? void 0 : subject.examination) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === quiz._id.toString());
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
exports.readOneSubjectExamResult = readOneSubjectExamResult;
const readStudentExamResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.readStudentExamResult = readStudentExamResult;
const readExamResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizID } = req.params;
        const subject = yield examinationModel_1.default.findById(quizID).populate({
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
exports.readExamResult = readExamResult;
const readOneSubjectMidTestResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { subjectID, quizID } = req.params;
        const quiz = yield midTestModel_1.default.findById(quizID);
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
        const idCompare = (_a = subject === null || subject === void 0 ? void 0 : subject.examination) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === quiz._id.toString());
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
exports.readOneSubjectMidTestResult = readOneSubjectMidTestResult;
const readStudentMidTestResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const x = (_a = subject === null || subject === void 0 ? void 0 : subject.performance) === null || _a === void 0 ? void 0 : _a.filter((el) => el.status === "midTest");
        return res.status(201).json({
            message: "subject quiz performance read successfully",
            data: x,
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
exports.readStudentMidTestResult = readStudentMidTestResult;
const readMidTestResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizID } = req.params;
        const subject = yield midTestModel_1.default.findById(quizID).populate({
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
exports.readMidTestResult = readMidTestResult;
const readOneSubjectMidTestResultPreformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { subjectID, quizID } = req.params;
        const quiz = yield midTestModel_1.default.findById(quizID);
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
        const idCompare = (_a = subject === null || subject === void 0 ? void 0 : subject.examination) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === quiz._id.toString());
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
exports.readOneSubjectMidTestResultPreformance = readOneSubjectMidTestResultPreformance;
const deletePerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { performanceID } = req.params;
        if (!performanceID) {
            return res
                .status(400)
                .json({ message: "performanceID is required", status: 400 });
        }
        const perf = yield performanceModel_1.default.findById(performanceID);
        if (!perf) {
            return res
                .status(404)
                .json({ message: "Performance not found", status: 404 });
        }
        const studentID = perf.student;
        const quizID = perf.quizID;
        // Delete the performance document
        yield performanceModel_1.default.findByIdAndDelete(performanceID);
        // Remove references from possible quiz/exam/midTest entries
        yield quizModel_1.default.updateMany({ performance: performanceID }, { $pull: { performance: performanceID } });
        yield examinationModel_1.default.updateMany({ performance: performanceID }, { $pull: { performance: performanceID } });
        yield midTestModel_1.default.updateMany({ performance: performanceID }, { $pull: { performance: performanceID } });
        // Remove from subject and student
        yield subjectModel_1.default.updateMany({ performance: performanceID }, { $pull: { performance: performanceID } });
        yield studentModel_1.default.updateMany({ performance: performanceID }, { $pull: { performance: performanceID } });
        // Recalculate student's totalPerformance
        if (studentID) {
            const student = yield studentModel_1.default
                .findById(studentID)
                .populate({ path: "performance" });
            if (student) {
                const ratings = [];
                (_a = student.performance) === null || _a === void 0 ? void 0 : _a.forEach((el) => {
                    if (typeof el.performanceRating === "number" &&
                        !isNaN(el.performanceRating)) {
                        ratings.push(el.performanceRating);
                    }
                });
                const totalSum = ratings.reduce((a, b) => a + b, 0);
                const count = ratings.length;
                const avg = count > 0 ? totalSum / count : 0;
                yield studentModel_1.default.findByIdAndUpdate(studentID, { totalPerformance: avg }, { new: true });
            }
        }
        return res
            .status(200)
            .json({ message: "Performance deleted successfully", status: 200 });
    }
    catch (error) {
        return res
            .status(500)
            .json({
            message: "Error deleting performance",
            data: error.message,
            status: 500,
        });
    }
});
exports.deletePerformance = deletePerformance;
