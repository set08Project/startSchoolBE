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
exports.viewResultHistory = exports.createResultHistory = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const studentHistoricalResultModel_1 = __importDefault(require("../model/studentHistoricalResultModel"));
const mongoose_1 = require("mongoose");
const createResultHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { studentID, schoolID, teacherID } = req.params;
        const {} = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "historicalResult",
        });
        const teacher = yield staffModel_1.default.findById(teacherID);
        if (school) {
            const result = yield studentHistoricalResultModel_1.default.create(Object.assign(Object.assign({}, req.body), { school,
                student }));
            (_a = student === null || student === void 0 ? void 0 : student.historicalResult) === null || _a === void 0 ? void 0 : _a.push(new mongoose_1.Types.ObjectId(result._id));
            student === null || student === void 0 ? void 0 : student.save();
            return res.status(201).json({
                message: "done",
            });
        }
        else {
            return res.status(404).json({
                message: "Only school Admin can do this",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
        });
    }
});
exports.createResultHistory = createResultHistory;
const viewResultHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID, schoolID, teacherID } = req.params;
        const {} = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "historicalResult",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        const teacher = yield staffModel_1.default.findById(teacherID);
        return res.status(201).json({
            message: "done",
            data: student,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
        });
    }
});
exports.viewResultHistory = viewResultHistory;
