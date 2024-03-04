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
exports.viewStudentComplains = exports.viewTeacherComplains = exports.viewSchoolComplains = exports.markResolveComplain = exports.markAsSeenComplain = exports.createStudentComplain = exports.createTeacherComplain = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const complainModel_1 = __importDefault(require("../model/complainModel"));
const mongoose_1 = require("mongoose");
const staffModel_1 = __importDefault(require("../model/staffModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const createTeacherComplain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID } = req.params;
        const { title, importance } = req.body;
        const teacher = yield staffModel_1.default.findById(teacherID);
        const school = yield schoolModel_1.default.findById(teacher === null || teacher === void 0 ? void 0 : teacher.schoolIDs);
        if (teacher) {
            const complain = yield complainModel_1.default.create({
                reporterID: teacherID,
                title,
                importance,
            });
            teacher === null || teacher === void 0 ? void 0 : teacher.complain.push(new mongoose_1.Types.ObjectId(complain._id));
            teacher.save();
            school === null || school === void 0 ? void 0 : school.complain.push(new mongoose_1.Types.ObjectId(complain._id));
            school === null || school === void 0 ? void 0 : school.save();
            return res.status(201).json({
                message: "teacher complain [posted] successfully",
                data: complain,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "teacher must exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
});
exports.createTeacherComplain = createTeacherComplain;
const createStudentComplain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const { title, importance } = req.body;
        const student = yield studentModel_1.default.findById(studentID);
        const school = yield schoolModel_1.default.findById(student === null || student === void 0 ? void 0 : student.schoolIDs);
        if (student) {
            const complain = yield complainModel_1.default.create({
                reporterID: studentID,
                title,
                importance,
            });
            student === null || student === void 0 ? void 0 : student.complain.push(new mongoose_1.Types.ObjectId(complain._id));
            student.save();
            school === null || school === void 0 ? void 0 : school.complain.push(new mongoose_1.Types.ObjectId(complain._id));
            school === null || school === void 0 ? void 0 : school.save();
            return res.status(201).json({
                message: "student complain posted successfully",
                data: complain,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "student must exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
});
exports.createStudentComplain = createStudentComplain;
const markAsSeenComplain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, complainID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const complain = yield complainModel_1.default.findByIdAndUpdate(complainID, { seen: true }, { new: true });
            return res.status(201).json({
                message: "mark complain seen successfully",
                data: complain,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school must exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
});
exports.markAsSeenComplain = markAsSeenComplain;
const markResolveComplain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, complainID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const complain = yield complainModel_1.default.findByIdAndUpdate(complainID, { resolve: true }, { new: true });
            return res.status(201).json({
                message: "mark complain resolved successfully",
                data: complain,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "school must exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
});
exports.markResolveComplain = markResolveComplain;
const viewSchoolComplains = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const complain = yield schoolModel_1.default.findById(schoolID).populate({
            path: "complain",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "view complain successfully",
            data: complain,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
});
exports.viewSchoolComplains = viewSchoolComplains;
const viewTeacherComplains = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherID } = req.params;
        const complain = yield staffModel_1.default.findById(teacherID).populate({
            path: "complain",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "view complain successfully",
            data: complain,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
});
exports.viewTeacherComplains = viewTeacherComplains;
const viewStudentComplains = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const complain = yield studentModel_1.default.findById(studentID).populate({
            path: "complain",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "view complain successfully",
            data: complain,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
});
exports.viewStudentComplains = viewStudentComplains;
