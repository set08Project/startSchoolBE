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
exports.updateTermPay = exports.getAllSession = exports.viewTerm = exports.termPerSession = exports.studentsPerSession = exports.viewSchoolPresentSessionTerm = exports.viewSchoolPresentSession = exports.viewSchoolSession = exports.createNewSchoolSession = exports.createSchoolSession = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const sessionModel_1 = __importDefault(require("../model/sessionModel"));
const mongoose_1 = require("mongoose");
const studentModel_1 = __importDefault(require("../model/studentModel"));
const termModel_1 = __importDefault(require("../model/termModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const createSchoolSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { year, term } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const session = yield sessionModel_1.default.create({
                year,
                term,
            });
            school.session.push(new mongoose_1.Types.ObjectId(session._id));
            school.save();
            return res.status(201).json({
                message: "session created successfully",
                data: session,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
        });
    }
});
exports.createSchoolSession = createSchoolSession;
const createNewSchoolSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { schoolID } = req.params;
        const { year } = req.body;
        let paid = 0;
        let notPaid = 0;
        const school = yield schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "students" });
        const schoolClass = yield schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "classRooms" });
        const schoolStudents = yield schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "students" });
        // const pushClass = await schoolModel.findById(schoolID).populate({
        //   path: "classHistory",
        // });
        let totalStudent = 0;
        const totalStaff = (_a = school === null || school === void 0 ? void 0 : school.staff) === null || _a === void 0 ? void 0 : _a.length;
        const totalSubjects = (_b = school === null || school === void 0 ? void 0 : school.subjects) === null || _b === void 0 ? void 0 : _b.length;
        const students = school === null || school === void 0 ? void 0 : school.students;
        if (school && school.schoolName) {
            for (let i of students) {
                totalStudent++;
                if (i.feesPaid1st || i.feesPaid2nd || i.feesPaid2nd) {
                    paid++;
                    yield studentModel_1.default.findByIdAndUpdate(i === null || i === void 0 ? void 0 : i._id, { feesPaid1st: false, feesPaid2nd: false, feesPaid3rd: false }, { new: true });
                }
                else {
                    notPaid++;
                }
            }
            const session = yield sessionModel_1.default.create({
                schoolID,
                year,
                // term,
                totalStudents: totalStudent,
                numberOfTeachers: totalStaff,
                numberOfSubjects: totalSubjects,
                studentFeesNotPaid: notPaid,
                studentFeesPaid: paid,
            });
            school.session.push(new mongoose_1.Types.ObjectId(session._id));
            school.classHistory.push(new mongoose_1.Types.ObjectId(session === null || session === void 0 ? void 0 : session._id));
            school.save();
            schoolClass === null || schoolClass === void 0 ? void 0 : schoolClass.classRooms.find((el) => {
                return;
            });
            for (let i of schoolClass === null || schoolClass === void 0 ? void 0 : schoolClass.classRooms) {
                let num = parseInt(`${i.className}`.match(/\d+/)[0]);
                let name = i.className.split(`${num}`);
                if (num < 4) {
                    let myClass = yield classroomModel_1.default.findByIdAndUpdate(i === null || i === void 0 ? void 0 : i._id, {
                        className: `${name[0].trim()}${num++} ${name[1].trim()}`,
                    }, { new: true });
                }
                else {
                    console.log("can't");
                }
            }
            for (let i of schoolStudents === null || schoolStudents === void 0 ? void 0 : schoolStudents.students) {
                let num = parseInt(`${i.classAssigned}`.match(/\d+/)[0]);
                let name = (_c = i.classAssigned) === null || _c === void 0 ? void 0 : _c.split(`${num}`);
                if (num < 4) {
                    yield studentModel_1.default.findByIdAndUpdate(i === null || i === void 0 ? void 0 : i._id, {
                        classAssigned: `${name[0].trim()} ${num++}${name[1].trim()}`,
                        attendance: null,
                        performance: null,
                        feesPaid1st: false,
                        feesPaid2nd: false,
                        feesPaid3rd: false,
                    }, { new: true });
                }
                else {
                    console.log("can't");
                }
            }
            return res.status(201).json({
                message: "session created successfully",
                data: session,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
        });
    }
});
exports.createNewSchoolSession = createNewSchoolSession;
const viewSchoolSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "session",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "viewing school session",
            data: school === null || school === void 0 ? void 0 : school.session,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
            data: error.message,
        });
    }
});
exports.viewSchoolSession = viewSchoolSession;
const viewSchoolPresentSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionID } = req.params;
        const school = yield sessionModel_1.default.findById(sessionID).populate({
            path: "term",
        });
        return res.status(200).json({
            message: "viewing school session now!",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
            data: error.message,
        });
    }
});
exports.viewSchoolPresentSession = viewSchoolPresentSession;
const viewSchoolPresentSessionTerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { termID } = req.params;
        const school = yield termModel_1.default.findById(termID);
        return res.status(200).json({
            message: "viewing school session",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
            data: error.message,
        });
    }
});
exports.viewSchoolPresentSessionTerm = viewSchoolPresentSessionTerm;
const studentsPerSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionID } = req.params;
        const { totalStudents } = req.body;
        const session = yield sessionModel_1.default.findById(sessionID);
        if (session) {
            const students = yield sessionModel_1.default.findByIdAndUpdate(sessionID, { totalStudents }, { new: true });
            return res.status(200).json({
                message: "viewing session session",
                data: students,
            });
        }
        else {
            return res.status(404).json({
                message: "Error finding school session",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
});
exports.studentsPerSession = studentsPerSession;
const termPerSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionID } = req.params;
        let { term } = req.body;
        const session = yield sessionModel_1.default.findById(sessionID).populate({
            path: "term",
        });
        const schoolClass = yield schoolModel_1.default
            .findById(session === null || session === void 0 ? void 0 : session.schoolID)
            .populate({ path: "classRooms" });
        if (session) {
            if (term === "1st Term" ||
                term === "First Term" ||
                term === "2nd Term" ||
                term === "Second Term" ||
                term === "3rd Term" ||
                term === "Third Term") {
                const capitalizedText = (str) => {
                    let result = "";
                    let word = str.split(" ");
                    for (let i of word) {
                        result = result + i[0].toUpperCase().concat(i.slice(1), " ");
                    }
                    return result.trim();
                };
                const check = session.term.some((el) => {
                    return el.term === capitalizedText(term);
                });
                if (check) {
                    return res.status(404).json({
                        message: "Term Already exist",
                    });
                }
                else {
                    const sessionTerm = yield termModel_1.default.create({
                        term: capitalizedText(term),
                        year: session === null || session === void 0 ? void 0 : session.year,
                        presentTerm: term,
                    });
                    session === null || session === void 0 ? void 0 : session.term.push(new mongoose_1.Types.ObjectId(sessionTerm === null || sessionTerm === void 0 ? void 0 : sessionTerm._id));
                    session === null || session === void 0 ? void 0 : session.save();
                    // presentTerm
                    yield sessionModel_1.default.findByIdAndUpdate(sessionID, { presentTerm: capitalizedText(term) }, { new: true });
                    for (let i of schoolClass === null || schoolClass === void 0 ? void 0 : schoolClass.classRooms) {
                        yield classroomModel_1.default.findByIdAndUpdate(i === null || i === void 0 ? void 0 : i._id, {
                            presentTerm: capitalizedText(term),
                            attendance: [],
                            timeTable: [],
                            lessonNotes: [],
                            reportCard: [],
                            assignment: [],
                            assignmentResolve: [],
                            weekStudent: {},
                        }, { new: true });
                    }
                    return res.status(200).json({
                        message: "creating session term",
                        data: sessionTerm,
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "Term can't be created",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error finding school session",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
});
exports.termPerSession = termPerSession;
const viewTerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { termID } = req.params;
        const getAll = yield termModel_1.default.findById(termID);
        return res.status(200).json({
            message: "viewing term details",
            data: getAll,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error getting session",
            data: error.message,
        });
    }
});
exports.viewTerm = viewTerm;
const getAllSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getAll = yield sessionModel_1.default.find().populate({
            path: "term",
        });
        return res.status(200).json({
            message: "all session gotten",
            data: getAll,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error getting session",
            data: error.message,
        });
    }
});
exports.getAllSession = getAllSession;
const updateTermPay = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { termID } = req.params;
        const { costPaid, payRef } = req.body;
        const getAll = yield termModel_1.default.findByIdAndUpdate(termID, {
            plan: true,
            costPaid,
            payRef,
        }, { new: true });
        return res.status(200).json({
            message: "Term payment has been recorded successfully",
            data: getAll,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "error getting session",
            data: error.message,
        });
    }
});
exports.updateTermPay = updateTermPay;
