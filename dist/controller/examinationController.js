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
exports.readExamination = exports.startSubjectExamination = exports.readSubjectExamination = exports.createSubjectExam = void 0;
const examinationModel_1 = __importDefault(require("../model/examinationModel"));
const lodash_1 = __importDefault(require("lodash"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const mongoose_1 = require("mongoose");
const createSubjectExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { classID, subjectID } = req.params;
        const { instruction, duration, mark } = req.body;
        const classRoom = yield classroomModel_1.default.findById(classID);
        const checkForSubject = yield subjectModel_1.default.findById(subjectID);
        const findTeacher = yield staffModel_1.default.findById({
            _id: classRoom === null || classRoom === void 0 ? void 0 : classRoom.teacherID,
        });
        const findSubjectTeacher = yield subjectModel_1.default.findById({
            _id: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.teacherID,
        });
        const school = yield schoolModel_1.default.findById(findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.schoolIDs);
        // const { secure_url, public_id }: any = await streamUpload(req);
        console.log((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.path);
        let data = yield (0, csvtojson_1.default)().fromFile((_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.path);
        let value = [];
        for (let i of data) {
            (_c = i.options) === null || _c === void 0 ? void 0 : _c.split(";;");
            let read = Object.assign(Object.assign({}, i), { options: (_d = i.options) === null || _d === void 0 ? void 0 : _d.split(";;") });
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
            // await examinationModel.deleteMany();
            const quizes = yield examinationModel_1.default.create({
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
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.examination.push(new mongoose_1.Types.ObjectId(quizes._id));
            (_e = checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.performance) === null || _e === void 0 ? void 0 : _e.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.save();
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.examination.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.save();
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.examination.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubjectTeacher === null || findSubjectTeacher === void 0 ? void 0 : findSubjectTeacher.save();
            yield deleteFilesInFolder(filePath);
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
