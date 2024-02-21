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
exports.rateLessonNote = exports.readLessonNote = exports.approveTeacherLessonNote = exports.readTeacherClassLessonNote = exports.readTeacherLessonNote = exports.readAdminLessonNote = exports.createClasslessonNote = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const mongoose_1 = require("mongoose");
const lessonNoteModel_1 = __importDefault(require("../model/lessonNoteModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const createClasslessonNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, staffID } = req.params;
        const { week, endingAt, createDate, classes, subTopic, period, duration, instructionalMaterial, referenceMaterial, previousKnowledge, specificObjectives, content, evaluation, summary, presentation, assignment, topic, subject, } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const staff = yield staffModel_1.default.findById(staffID);
        const classData = yield classroomModel_1.default.findOne({
            className: staff === null || staff === void 0 ? void 0 : staff.classesAssigned,
        });
        if (school && school.schoolName && staff) {
            const note = yield lessonNoteModel_1.default.create({
                teacher: staff === null || staff === void 0 ? void 0 : staff.staffName,
                teacherClass: staff === null || staff === void 0 ? void 0 : staff.classesAssigned,
                teacherID: staff === null || staff === void 0 ? void 0 : staff._id,
                subject,
                topic,
                week,
                endingAt,
                createDate,
                classes,
                subTopic,
                period,
                duration,
                instructionalMaterial,
                referenceMaterial,
                previousKnowledge,
                specificObjectives,
                content,
                evaluation,
                summary,
                presentation,
                assignment,
                adminSignation: false,
            });
            school === null || school === void 0 ? void 0 : school.lessonNotes.push(new mongoose_1.Types.ObjectId(note === null || note === void 0 ? void 0 : note._id));
            school === null || school === void 0 ? void 0 : school.save();
            staff === null || staff === void 0 ? void 0 : staff.lessonNotes.push(new mongoose_1.Types.ObjectId(note === null || note === void 0 ? void 0 : note._id));
            staff === null || staff === void 0 ? void 0 : staff.save();
            classData === null || classData === void 0 ? void 0 : classData.lessonNotes.push(new mongoose_1.Types.ObjectId(note === null || note === void 0 ? void 0 : note._id));
            classData === null || classData === void 0 ? void 0 : classData.save();
            return res.status(201).json({
                message: "lesson note created",
                data: note,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
            data: error.message,
        });
    }
});
exports.createClasslessonNote = createClasslessonNote;
const readAdminLessonNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const note = yield schoolModel_1.default
                .findById(schoolID)
                .populate({ path: "lessonNotes" });
            return res.status(200).json({
                message: "Reading admin's lesson note",
                data: note,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
});
exports.readAdminLessonNote = readAdminLessonNote;
const readTeacherLessonNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { schoolID, staffID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        const staff = yield staffModel_1.default.findById(staffID);
        if (school && school.schoolName && staff.status === "school-teacher") {
            const note = yield ((_a = staffModel_1.default
                .findById(staffID)) === null || _a === void 0 ? void 0 : _a.populate({ path: "lessonNotes" }));
            return res.status(200).json({
                message: "Reading teacher's lesson note",
                data: note,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
});
exports.readTeacherLessonNote = readTeacherLessonNote;
const readTeacherClassLessonNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { classID } = req.params;
        const note = yield ((_b = classroomModel_1.default
            .findById(classID)) === null || _b === void 0 ? void 0 : _b.populate({ path: "lessonNotes" }));
        return res.status(200).json({
            message: "Reading teacher's lesson note",
            data: note,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
});
exports.readTeacherClassLessonNote = readTeacherClassLessonNote;
const approveTeacherLessonNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, lessonID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        const lessonNote = yield lessonNoteModel_1.default.findById(lessonID);
        if (school &&
            school.schoolName &&
            school.status === "school-admin" &&
            lessonNote) {
            const note = yield lessonNoteModel_1.default.findByIdAndUpdate(lessonNote === null || lessonNote === void 0 ? void 0 : lessonNote._id, { adminSignation: true }, { new: true });
            return res.status(200).json({
                message: "lesson note approved",
                data: note,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
});
exports.approveTeacherLessonNote = approveTeacherLessonNote;
const readLessonNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lessonID } = req.params;
        const lessonNote = yield lessonNoteModel_1.default.findById(lessonID);
        return res.status(200).json({
            message: "lesson note ",
            data: lessonNote,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
});
exports.readLessonNote = readLessonNote;
const rateLessonNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lessonID, studentID } = req.params;
        const { rate } = req.body;
        const student = yield studentModel_1.default.findById(studentID);
        const lessonNote = yield lessonNoteModel_1.default.findById(lessonID);
        const check = lessonNote === null || lessonNote === void 0 ? void 0 : lessonNote.rateData.some((el) => {
            return el.id === studentID;
        });
        if (student && lessonNote) {
            if (!check) {
                // let dataNote = [...lessonNote?.rateData, { id: studentID, rate }];
                const lessonNoteData = yield lessonNoteModel_1.default.findByIdAndUpdate(lessonNote === null || lessonNote === void 0 ? void 0 : lessonNote._id, {
                    rateData: [...lessonNote === null || lessonNote === void 0 ? void 0 : lessonNote.rateData, { id: studentID, rate }],
                }, { new: true });
                const lessonNoteDate = yield lessonNoteModel_1.default.findByIdAndUpdate(lessonNoteData === null || lessonNoteData === void 0 ? void 0 : lessonNoteData._id, {
                    rate: lessonNote.rateData
                        .map((el) => parseInt(el.rate))
                        .reduce((a, b) => a + b) /
                        lessonNote.rateData.length,
                }, { new: true });
                const lesson = yield lessonNoteModel_1.default.findById(lessonNoteDate === null || lessonNoteDate === void 0 ? void 0 : lessonNoteDate._id);
                return res.status(200).json({
                    message: "lesson note rated",
                    data: lesson,
                    status: 200,
                });
            }
            else {
                return res.status(404).json({
                    message: "Already rated",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Student can't be fine",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating lesson Note",
            status: 404,
        });
    }
});
exports.rateLessonNote = rateLessonNote;
