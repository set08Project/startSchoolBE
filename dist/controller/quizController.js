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
exports.getStudentQuizRecords = exports.deleteQuiz = exports.getQuizRecords = exports.readQuizes = exports.readQuiz = exports.readTeacherSubjectQuiz = exports.readSubjectQuiz = exports.createSubjectQuiz = exports.startSubjectExamination = exports.readSubjectExamination = exports.createSubjectExam = void 0;
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const quizModel_1 = __importDefault(require("../model/quizModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const lodash_1 = __importDefault(require("lodash"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// Examination
const createSubjectExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { classID, subjectID } = req.params;
        const { instruction, duration, mark } = req.body;
        const classRoom = yield classroomModel_1.default.findById(classID);
        const checkForSubject = yield subjectModel_1.default.findById(subjectID);
        const findTeacher = yield staffModel_1.default.findById(checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.teacherID);
        const findSubjectTeacher = yield staffModel_1.default.findById(checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.teacherID);
        const school = yield schoolModel_1.default.findById(findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.schoolIDs);
        // const { secure_url, public_id }: any = await streamUpload(req);
        let data = yield (0, csvtojson_1.default)().fromFile((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.path);
        let value = [];
        for (let i of data) {
            (_b = i.options) === null || _b === void 0 ? void 0 : _b.split(";;");
            let read = Object.assign(Object.assign({}, i), { options: (_c = i.options) === null || _c === void 0 ? void 0 : _c.split(";;") });
            value.push(read);
        }
        let term = lodash_1.default.find(value, { term: school === null || school === void 0 ? void 0 : school.presentTerm });
        let session = lodash_1.default.find(value, { session: school === null || school === void 0 ? void 0 : school.presentSession });
        let filePath = node_path_1.default.join(__dirname, "uploads");
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
            const quizes = yield quizModel_1.default.create({
                subjectTitle: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.subjectTitle,
                subjectID: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject._id,
                session: school === null || school === void 0 ? void 0 : school.presentSession,
                term: school === null || school === void 0 ? void 0 : school.presentTerm,
                quiz: {
                    instruction: { duration, mark, instruction },
                    question: value,
                },
                totalQuestions: value === null || value === void 0 ? void 0 : value.length,
                status: "examination",
                startExam: false,
            });
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            (_d = checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.performance) === null || _d === void 0 ? void 0 : _d.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.save();
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.save();
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.save();
            // await deleteFilesInFolder(filePath);
            return res.status(201).json({
                message: "exam entry successfully",
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
            path: "quiz",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        let exam = lodash_1.default.filter(subject === null || subject === void 0 ? void 0 : subject.quiz, { status: "examination" })[0];
        return res.status(201).json({
            message: "subject exam read successfully",
            // data: subject?.quiz,
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
        const subject = yield quizModel_1.default.findByIdAndUpdate(examID, {
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
// Quiz
const createSubjectQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { classID, subjectID } = req.params;
        const { quiz, totalQuestions } = req.body;
        const classRoom = yield classroomModel_1.default.findById(classID);
        const checkForSubject = yield subjectModel_1.default.findById(subjectID);
        const findTeacher = yield staffModel_1.default.findById(classRoom === null || classRoom === void 0 ? void 0 : classRoom.teacherID);
        const findSubjectTeacher = yield staffModel_1.default.findById(checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.teacherID);
        if (checkForSubject) {
            const quizes = yield quizModel_1.default.create({
                subjectTitle: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.subjectTitle,
                subjectID: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject._id,
                quiz,
                totalQuestions,
                status: "quiz",
            });
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.quiz.push(new mongoose_1.Types.ObjectId(quizes._id));
            (_a = checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.performance) === null || _a === void 0 ? void 0 : _a.push(new mongoose_1.Types.ObjectId(quizes._id));
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
    catch (error) {
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
