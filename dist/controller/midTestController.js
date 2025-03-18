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
exports.readMidTest = exports.startSubjectMidTest = exports.readSubjectMidTest = exports.createSubjectMidTest = void 0;
const midTestModel_1 = __importDefault(require("../model/midTestModel"));
const lodash_1 = __importDefault(require("lodash"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const mongoose_1 = require("mongoose");
const createSubjectMidTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { classID, subjectID } = req.params;
        const { instruction, duration, mark, theory } = req.body;
        let filePath = node_path_1.default.join(__dirname, "../uploads/examination");
        const classRoom = yield classroomModel_1.default.findById(classID);
        const checkForSubject = yield subjectModel_1.default.findById(subjectID);
        console.log(checkForSubject);
        const findTeacher = yield staffModel_1.default.findById(classRoom === null || classRoom === void 0 ? void 0 : classRoom.teacherID);
        console.log(findTeacher);
        const findSubjectTeacher = yield subjectModel_1.default.findById(checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.teacherID);
        console.log("here");
        const school = yield schoolModel_1.default.findById(findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.schoolIDs);
        let data = yield (0, csvtojson_1.default)().fromFile((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.path);
        let value = [];
        console.log("here 1");
        for (let i of data) {
            (_b = i.options) === null || _b === void 0 ? void 0 : _b.split(";;");
            let read = Object.assign(Object.assign({}, i), { options: (_c = i.options) === null || _c === void 0 ? void 0 : _c.split(";;") });
            value.push(read);
        }
        let term = lodash_1.default.find(value, { term: school === null || school === void 0 ? void 0 : school.presentTerm });
        let session = lodash_1.default.find(value, { session: school === null || school === void 0 ? void 0 : school.presentSession });
        console.log("here 2");
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
            console.log("here 3");
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
            (_d = checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.performance) === null || _d === void 0 ? void 0 : _d.push(new mongoose_1.Types.ObjectId(quizes._id));
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
