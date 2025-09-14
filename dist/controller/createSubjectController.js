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
exports.getAllTeachSubject = exports.deleteOneTeachSubject = exports.getOneTeachSubject = exports.updateTeachSubject = exports.createTeachSubject = void 0;
const teachSubjectModel_1 = __importDefault(require("../model/teachSubjectModel"));
const createTeachSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, totalLessons, expectedOutcome, instructor, classCreatedFor, credit, relatedSubjectTags, subjectImage, } = req.body;
        const teachSubject = yield teachSubjectModel_1.default.create({
            title,
            description,
            totalLessons,
            expectedOutcome,
            instructor,
            classCreatedFor,
            credit,
            relatedSubjectTags,
            subjectImage,
        });
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
            data: error,
        });
    }
});
exports.createTeachSubject = createTeachSubject;
const updateTeachSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teachSubjectID } = req.params;
        const { title, description, totalLessons, expectedOutcome, instructor, classCreatedFor, credit, relatedSubjectTags, subjectImage, } = req.body;
        const teachSubject = yield teachSubjectModel_1.default.findByIdAndUpdate(teachSubjectID, { title,
            description,
            totalLessons,
            expectedOutcome,
            instructor,
            classCreatedFor,
            credit,
            relatedSubjectTags,
            subjectImage,
        }, { new: true });
        return res.status(201).json({
            message: "teach subject updated successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
});
exports.updateTeachSubject = updateTeachSubject;
const getOneTeachSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teachSubjectID } = req.params;
        const teachSubject = yield teachSubjectModel_1.default.findById(teachSubjectID);
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
});
exports.getOneTeachSubject = getOneTeachSubject;
const deleteOneTeachSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teachSubjectID } = req.params;
        const teachSubject = yield teachSubjectModel_1.default.findByIdAndDelete(teachSubjectID);
        return res.status(201).json({
            message: "teach subject deleted successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error deleting teach subject ",
        });
    }
});
exports.deleteOneTeachSubject = deleteOneTeachSubject;
const getAllTeachSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teachSubject = yield teachSubjectModel_1.default.find();
        return res.status(201).json({
            message: "teach subject created successfully",
            data: teachSubject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teach subject ",
        });
    }
});
exports.getAllTeachSubject = getAllTeachSubject;
