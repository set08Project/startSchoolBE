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
exports.getAllClassSessionResults = exports.createSessionHistory = exports.updateTermPay = exports.getAllSession = exports.viewTerm = exports.termPerSession = exports.studentsPerSession = exports.viewSchoolPresentSessionTerm = exports.viewSchoolPresentSession = exports.viewSchoolSession = exports.createNewSchoolSession = exports.createSchoolSession = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const sessionModel_1 = __importDefault(require("../model/sessionModel"));
const mongoose_1 = require("mongoose");
const studentModel_1 = __importDefault(require("../model/studentModel"));
const termModel_1 = __importDefault(require("../model/termModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const classHistory_1 = __importDefault(require("../model/classHistory"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
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
    var _a, _b;
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
        const schoolTeacher = yield schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "staff" });
        const schl = yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
            presentSession: year,
        }, { new: true });
        console.log("school:: ", schl);
        // const schoolStudents: any = await schoolModel
        //   .findById(schoolID)
        //   .populate({ path: "students" });
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
                    yield studentModel_1.default.findByIdAndUpdate(i === null || i === void 0 ? void 0 : i._id, { feesPaid1st: false, feesPaid2nd: false, feesPaid3rd: false }
                    // { new: true }
                    );
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
                    yield classroomModel_1.default.findByIdAndUpdate(i === null || i === void 0 ? void 0 : i._id, {
                        className: `${name[0].trim()} ${num + 1}${name[1].trim()}`,
                    }, { new: true });
                }
                else {
                    console.log("can't");
                }
            }
            for (let i of students) {
                let num = parseInt(`${i.classAssigned}`.match(/\d+/)[0]);
                let name = i.classAssigned.split(`${num}`);
                if (num < 4) {
                    yield studentModel_1.default.findByIdAndUpdate(i === null || i === void 0 ? void 0 : i._id, {
                        classAssigned: `${name[0].trim()} ${num + 1}${name[1].trim()}`,
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
            for (let i of schoolTeacher === null || schoolTeacher === void 0 ? void 0 : schoolTeacher.staff) {
                let num = parseInt(`${i.classesAssigned}`.match(/\d+/)[0]);
                let name = i.classesAssigned.split(`${num}`);
                if (num < 4) {
                    yield studentModel_1.default.findByIdAndUpdate(i === null || i === void 0 ? void 0 : i._id, {
                        classesAssigned: `${name[0].trim()} ${num + 1}${name[1].trim()}`,
                    }, { new: true });
                }
                else {
                    console.log("can't");
                }
            }
            console.log("year: ", year, schoolID);
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
    var _c, _d, _e, _f;
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
                    // presentTerm
                    const viewDetail = yield termModel_1.default.findById((_c = session === null || session === void 0 ? void 0 : session.term[(session === null || session === void 0 ? void 0 : session.term.length) - 1]) === null || _c === void 0 ? void 0 : _c._id);
                    let resultHist = [];
                    for (let i of schoolClass === null || schoolClass === void 0 ? void 0 : schoolClass.classRooms) {
                        resultHist.push(Object.assign({}, i));
                        yield termModel_1.default.findByIdAndUpdate((_d = session === null || session === void 0 ? void 0 : session.term[(session === null || session === void 0 ? void 0 : session.term.length) - 1]) === null || _d === void 0 ? void 0 : _d._id, {
                            classResult: resultHist,
                        }, { new: true });
                    }
                    const sessionRecorde = yield sessionModel_1.default.findByIdAndUpdate(sessionID, { presentTerm: capitalizedText(term) }, { new: true });
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
                    yield schoolModel_1.default.findByIdAndUpdate(sessionRecorde === null || sessionRecorde === void 0 ? void 0 : sessionRecorde.schoolID, {
                        presentTerm: term,
                    }, { new: true });
                    const sessionTerm = yield termModel_1.default.create({
                        term: capitalizedText(term),
                        year: session === null || session === void 0 ? void 0 : session.year,
                        presentTerm: term,
                    });
                    session === null || session === void 0 ? void 0 : session.term.push(new mongoose_1.Types.ObjectId(sessionTerm === null || sessionTerm === void 0 ? void 0 : sessionTerm._id));
                    session === null || session === void 0 ? void 0 : session.save();
                    if (((_e = schoolClass === null || schoolClass === void 0 ? void 0 : schoolClass.session) === null || _e === void 0 ? void 0 : _e.length) > 1 || ((_f = session === null || session === void 0 ? void 0 : session.term) === null || _f === void 0 ? void 0 : _f.length) > 1) {
                        yield schoolModel_1.default.findByIdAndUpdate(sessionRecorde === null || sessionRecorde === void 0 ? void 0 : sessionRecorde.schoolID, {
                            freeMode: false,
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
const createSessionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    try {
        const { classID } = req.params;
        const { text } = req.body;
        const getClassRoom = yield classroomModel_1.default.findById(classID);
        const teacher = yield staffModel_1.default.findById(getClassRoom === null || getClassRoom === void 0 ? void 0 : getClassRoom.teacherID);
        const getSchool = yield schoolModel_1.default
            .findById(teacher === null || teacher === void 0 ? void 0 : teacher.schoolIDs)
            .populate({ path: "session" });
        let history = [];
        for (let i of getClassRoom === null || getClassRoom === void 0 ? void 0 : getClassRoom.students) {
            let getStudentsData = yield studentModel_1.default
                .findById(i)
                .populate({ path: "reportCard" });
            history.push(getStudentsData);
        }
        const getAll = yield classHistory_1.default.create({
            resultHistory: history,
            session: (_g = getSchool === null || getSchool === void 0 ? void 0 : getSchool.session[0]) === null || _g === void 0 ? void 0 : _g.year,
            term: (_h = getSchool === null || getSchool === void 0 ? void 0 : getSchool.session[0]) === null || _h === void 0 ? void 0 : _h.presentTerm,
            classTeacherName: getClassRoom === null || getClassRoom === void 0 ? void 0 : getClassRoom.classTeacherName,
            className: getClassRoom === null || getClassRoom === void 0 ? void 0 : getClassRoom.className,
            principalsRemark: text,
        });
        getClassRoom === null || getClassRoom === void 0 ? void 0 : getClassRoom.classHistory.push(new mongoose_1.Types.ObjectId(getAll === null || getAll === void 0 ? void 0 : getAll._id));
        getClassRoom === null || getClassRoom === void 0 ? void 0 : getClassRoom.save();
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
exports.createSessionHistory = createSessionHistory;
const getAllClassSessionResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classID } = req.params;
        const getAll = yield classroomModel_1.default.findById(classID).populate({
            path: "classHistory",
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
exports.getAllClassSessionResults = getAllClassSessionResults;
