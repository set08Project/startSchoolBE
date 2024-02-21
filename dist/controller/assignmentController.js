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
exports.readAssignmentResult = exports.readStudentAssignmentResult = exports.readSubjectAssignmentResult = exports.createAssignmentPerformance = exports.readAssignment = exports.readTeacherSubjectAssignment = exports.readClassSubjectAssignment = exports.readSubjectAssignment = exports.createSubjectAssignment = void 0;
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const quizModel_1 = __importDefault(require("../model/quizModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const assignmentResolvedModel_1 = __importDefault(require("../model/assignmentResolvedModel"));
const assignmentModel_1 = __importDefault(require("../model/assignmentModel"));
const createSubjectAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID, subjectID } = req.params;
        const { assignmentTopic, assignmentDetails, assignmentDeadline } = req.body;
        const classRoom = yield classroomModel_1.default.findById(classID);
        const checkForSubject = yield subjectModel_1.default.findById(subjectID);
        const findTeacher = yield staffModel_1.default.findById({
            _id: classRoom === null || classRoom === void 0 ? void 0 : classRoom.teacherID,
        });
        if (checkForSubject) {
            const quizes = yield assignmentModel_1.default.create({
                subjectTitle: checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.subjectTitle,
                assignmentTopic,
                assignmentDetails,
                assignmentDeadline,
            });
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.assignment.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject === null || checkForSubject === void 0 ? void 0 : checkForSubject.save();
            classRoom === null || classRoom === void 0 ? void 0 : classRoom.assignment.push(new mongoose_1.Types.ObjectId(quizes._id));
            classRoom === null || classRoom === void 0 ? void 0 : classRoom.save();
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.assignment.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher === null || findTeacher === void 0 ? void 0 : findTeacher.save();
            return res.status(201).json({
                message: "assignment resolve entry created successfully",
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
exports.createSubjectAssignment = createSubjectAssignment;
const readSubjectAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectID } = req.params;
        const subject = yield subjectModel_1.default.findById(subjectID).populate({
            path: "assignment",
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
exports.readSubjectAssignment = readSubjectAssignment;
// export const readClassSubjectAssignment = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { classID } = req.params;
//     const quiz: any = await staffModel.findById(classID).populate({
//       path: "assignment",
//       options: {
//         sort: { createdAt: -1 },
//       },
//     });
//     return res.status(201).json({
//       message: "subject quiz read successfully",
//       data: quiz,
//       status: 201,
//     });
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating subject quiz",
//       data: error.message,
//       status: 404,
//     });
//   }
// };
const readClassSubjectAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID } = req.params;
        const quiz = yield classroomModel_1.default.findById(classID).populate({
            path: "assignment",
            options: {
                sort: { createdAt: -1 },
            },
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
exports.readClassSubjectAssignment = readClassSubjectAssignment;
const readTeacherSubjectAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID } = req.params;
        const quiz = yield staffModel_1.default.findById(teacherID).populate({
            path: "assignment",
            options: {
                sort: { createdAt: -1 },
            },
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
exports.readTeacherSubjectAssignment = readTeacherSubjectAssignment;
const readAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { assignmentID } = req.params;
        const quiz = yield quizModel_1.default.findById(assignmentID);
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
exports.readAssignment = readAssignment;
// Assignment Resolve Session/EndPoints
const createAssignmentPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { studentID, assignmentID } = req.params;
        const { studentScore, studentGrade, remark, assignmentResult } = req.body;
        const studentInfo = yield studentModel_1.default
            .findById(studentID)
            .populate({ path: "assignment" });
        const quizData = yield assignmentModel_1.default.findById(assignmentID);
        const findSubject = yield subjectModel_1.default.findOne({
            subjectTitle: quizData === null || quizData === void 0 ? void 0 : quizData.subjectTitle,
        });
        console.log(findSubject);
        if (quizData) {
            const quizes = yield assignmentResolvedModel_1.default.create({
                assignmentResult,
                subjectTitle: quizData === null || quizData === void 0 ? void 0 : quizData.subjectTitle,
                // studentScore,
                // studentGrade,
                // subjectTeacher: findTeacher?.staffName,
                // performanceRating: parseInt(
                //   ((studentScore / quizData?.quiz[1]?.question.length) * 100).toFixed(2)
                // ),
                className: studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.classAssigned,
                assignmentID: assignmentID,
                studentName: `${studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.studentFirstName} ${studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.studentLastName}`,
            });
            quizData === null || quizData === void 0 ? void 0 : quizData.assignmentResult.push(new mongoose_1.Types.ObjectId(quizes._id));
            quizData === null || quizData === void 0 ? void 0 : quizData.save();
            studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.performance.push(new mongoose_1.Types.ObjectId(quizes._id));
            studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.save();
            findSubject === null || findSubject === void 0 ? void 0 : findSubject.performance.push(new mongoose_1.Types.ObjectId(quizes._id));
            findSubject === null || findSubject === void 0 ? void 0 : findSubject.save();
            let view = [];
            let notView = [];
            const getStudent = yield studentModel_1.default.findById(studentID).populate({
                path: "performance",
            });
            const record = yield studentModel_1.default.findByIdAndUpdate(studentID, {
                totalPerformance: view.reduce((a, b) => {
                    return a + b;
                }, 0) / ((_a = studentInfo === null || studentInfo === void 0 ? void 0 : studentInfo.performance) === null || _a === void 0 ? void 0 : _a.length),
            }, { new: true });
            return res.status(201).json({
                message: "quiz entry created successfully",
                data: { quizes, record },
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
exports.createAssignmentPerformance = createAssignmentPerformance;
const readSubjectAssignmentResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectID } = req.params;
        const subject = yield subjectModel_1.default.findById(subjectID).populate({
            path: "assignmentResolve",
            options: {
                sort: {
                    time: 1,
                },
            },
        });
        return res.status(201).json({
            message: "subject assignmentResolve performance read successfully",
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
exports.readSubjectAssignmentResult = readSubjectAssignmentResult;
const readStudentAssignmentResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const subject = yield studentModel_1.default.findById(studentID).populate({
            path: "assignmentResolve",
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
exports.readStudentAssignmentResult = readStudentAssignmentResult;
const readAssignmentResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resolveID } = req.params;
        const subject = yield assignmentResolvedModel_1.default.findById(resolveID).populate({
            path: "assignmentResolve",
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
exports.readAssignmentResult = readAssignmentResult;
// update to mark
