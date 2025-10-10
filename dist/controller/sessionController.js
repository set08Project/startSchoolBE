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
// export const createNewSchoolSession = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { schoolID } = req.params;
//     const { year } = req.body;
//     let paid = 0;
//     let notPaid = 0;
//     const school: any = await schoolModel
//       .findById(schoolID)
//       .populate({ path: "students" });
//     const schoolClass: any = await schoolModel
//       .findById(schoolID)
//       .populate({ path: "classRooms" });
//     const schoolTeacher: any = await schoolModel
//       .findById(schoolID)
//       .populate({ path: "staff" });
//     const schl = await schoolModel.findByIdAndUpdate(
//       schoolID,
//       {
//         presentSession: year,
//         // presentSessionID: year,
//       },
//       { new: true }
//     );
//     // const schoolStudents: any = await schoolModel
//     //   .findById(schoolID)
//     //   .populate({ path: "students" });
//     // const pushClass = await schoolModel.findById(schoolID).populate({
//     //   path: "classHistory",
//     // });
//     let totalStudent = school?.students?.length;
//     let totalStaff = school?.staff?.length;
//     let totalSubjects = school?.subjects?.length;
//     const students: any = school?.students;
//     if (school && school.schoolName) {
//       for (let i of students!) {
//         totalStudent++;
//         if (i.feesPaid1st || i.feesPaid2nd || i.feesPaid2nd) {
//           paid++;
//           await studentModel.findByIdAndUpdate(
//             i?._id,
//             { feesPaid1st: false, feesPaid2nd: false, feesPaid3rd: false }
//             // { new: true }
//           );
//         } else {
//           notPaid++;
//         }
//       }
//       const session = await sessionModel.create({
//         schoolID,
//         year,
//         // term,
//         totalStudents: totalStudent,
//         numberOfTeachers: totalStaff,
//         numberOfSubjects: totalSubjects,
//         studentFeesNotPaid: notPaid,
//         studentFeesPaid: paid,
//       });
//       const schoolData = schoolModel.findByIdAndUpdate(
//         schoolID,
//         { presentSessionID: session?._id.toString() },
//         { new: true }
//       );
//       school.session.push(new Types.ObjectId(session._id));
//       school.classHistory.push(new Types.ObjectId(session?._id));
//       school.save();
//       schoolClass?.classRooms.find((el: any) => {
//         return;
//       });
//       for (let i of schoolClass?.classRooms) {
//         let num: number = parseInt(`${i.className}`?.match(/\d+/)![0]);
//         let name = i?.className?.split(`${num}`);
//         // {name[0].trim()} ${num + 1}${name[1].trim()}
//         if (num < 4 && name[0].trim() === "JSS") {
//           await classroomModel.findByIdAndUpdate(
//             i?._id,
//             {
//               className: `
//               ${
//                 num + 1 > 3
//                   ? `SSS ${1}${name[1]?.trim()}`
//                   : `${name[0]?.trim()} ${num + 1}${name[1]?.trim()}`
//               }
//               `,
//             },
//             { new: true }
//           );
//         } else if (num < 3 && name[0]?.trim() === "SSS") {
//           await classroomModel.findByIdAndUpdate(
//             i?._id,
//             {
//               className: `
//               ${name[0]?.trim()} ${num + 1}${name[1]?.trim()}
//               `,
//             },
//             { new: true }
//           );
//         } else {
//           await classroomModel.findByIdAndDelete(i?._id);
//           schoolClass.classRooms.pull(new Types.ObjectId(i?._id));
//           school?.classRooms?.pull(new Types.ObjectId(i?._id));
//           school.save();
//         }
//       }
//       for (let i of students!) {
//         let num: number = parseInt(`${i.classAssigned}`?.match(/\d+/)![0]);
//         let name = i?.classAssigned?.split(`${num}`);
//         if (num < 4 && name[0].trim() === "JSS") {
//           await studentModel.findByIdAndUpdate(
//             i?._id,
//             {
//               classAssigned: ` ${
//                 num + 1 > 3
//                   ? `SSS ${1}${name[1]?.trim()}`
//                   : `${name[0]?.trim()} ${num + 1}${name[1]?.trim()}`
//               }`,
//               attendance: null,
//               performance: null,
//               feesPaid1st: false,
//               feesPaid2nd: false,
//               feesPaid3rd: false,
//             },
//             { new: true }
//           );
//         } else if (num < 3 && name[0]?.trim() === "SSS") {
//           await studentModel.findByIdAndUpdate(
//             i?._id,
//             {
//               classAssigned: ` ${`${name[0]?.trim()} ${
//                 num + 1
//               }${name[1]?.trim()}`}`,
//               attendance: null,
//               performance: null,
//               feesPaid1st: false,
//               feesPaid2nd: false,
//               feesPaid3rd: false,
//             },
//             { new: true }
//           );
//         } else {
//           await studentModel.findByIdAndDelete(i?._id);
//           schoolClass.students.pull(new Types.ObjectId(i?._id));
//           school?.students.pull(new Types.ObjectId(i?._id));
//           school?.save();
//         }
//       }
//       for (let i of schoolTeacher?.staff!) {
//         i?.classesAssigned.map(async (el: any) => {
//           let num: number = parseInt(`${el?.className}`?.match(/\d+/)![0])
//             ? parseInt(`${el?.className}`?.match(/\d+/)![0])
//             : 0;
//           let name = el?.className?.split(`${num}`);
//           if (num < 4 && name[0].trim() === "JSS") {
//             el.className = ` ${
//               num + 1 > 3
//                 ? `SSS ${1}${name[1]?.trim()}`
//                 : `${name[0]?.trim()} ${num + 1}${name[1]?.trim()}`
//             }`;
//           } else if (num < 3 && name[0]?.trim() === "SSS") {
//             el.className = ` ${`${name[0]?.trim()} ${
//               num + 1
//             }${name[1]?.trim()}`}`;
//           } else {
//           }
//         });
//         i.save();
//       }
//       schoolTeacher.save();
//       return res.status(201).json({
//         message: "session created successfully",
//         data: session,
//       });
//     } else {
//       return res.status(404).json({
//         message: "unable to read school",
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating school session",
//       data: error,
//       error: error.stack,
//     });
//   }
// };
const createNewSchoolSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { schoolID } = req.params;
        const { year } = req.body;
        // Validation
        if (!year || typeof year !== "string") {
            return res.status(400).json({
                message: "Invalid year format",
            });
        }
        // Fetch school with all necessary populations in one query
        const school = yield schoolModel_1.default
            .findById(schoolID)
            .populate({ path: "students" })
            .populate({ path: "classRooms" })
            .populate({ path: "staff" })
            .populate({ path: "session" });
        if (!school || !school.schoolName) {
            return res.status(404).json({
                message: "School not found",
            });
        }
        // Check for duplicate session
        const existingSession = (_a = school.session) === null || _a === void 0 ? void 0 : _a.find((s) => s.year === year);
        if (existingSession) {
            return res.status(400).json({
                message: `Session for year ${year} already exists`,
            });
        }
        // Initialize counters
        let paidStudents = 0;
        let notPaidStudents = 0;
        const students = school.students || [];
        const classRooms = school.classRooms || [];
        const staff = school.staff || [];
        // Count paid/unpaid students
        for (const student of students) {
            if (student.feesPaid1st || student.feesPaid2nd || student.feesPaid3rd) {
                paidStudents++;
            }
            else {
                notPaidStudents++;
            }
        }
        // Create new session record
        const session = yield sessionModel_1.default.create({
            schoolID,
            year,
            totalStudents: students.length,
            numberOfTeachers: staff.length,
            numberOfSubjects: ((_b = school.subjects) === null || _b === void 0 ? void 0 : _b.length) || 0,
            studentFeesNotPaid: notPaidStudents,
            studentFeesPaid: paidStudents,
        });
        // Update school with new session info
        yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
            presentSession: year,
            presentSessionID: session._id.toString(),
            $push: {
                session: session._id,
                classHistory: session._id,
            },
        }, { new: true });
        // Helper function to promote class name
        const promoteClassName = (className) => {
            var _a, _b;
            if (!className)
                return null;
            const match = className.match(/\d+/);
            if (!match)
                return null;
            const num = parseInt(match[0]);
            const parts = className.split(`${num}`);
            const prefix = (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.trim();
            const suffix = ((_b = parts[1]) === null || _b === void 0 ? void 0 : _b.trim()) || "";
            if (prefix === "JSS") {
                if (num < 3) {
                    return `JSS ${num + 1}${suffix}`;
                }
                else if (num === 3) {
                    return `SSS 1${suffix}`;
                }
                else {
                    return null; // Graduate
                }
            }
            else if (prefix === "SSS") {
                if (num < 3) {
                    return `SSS ${num + 1}${suffix}`;
                }
                else {
                    return null; // Graduate
                }
            }
            return null;
        };
        // Batch operations for better performance
        const classRoomUpdates = [];
        const classRoomDeletions = [];
        for (const classRoom of classRooms) {
            const newClassName = promoteClassName(classRoom.className);
            if (newClassName) {
                classRoomUpdates.push(classroomModel_1.default.findByIdAndUpdate(classRoom._id, { className: newClassName }, { new: true }));
            }
            else {
                classRoomDeletions.push(classRoom._id.toString());
            }
        }
        // Execute classroom updates
        yield Promise.all(classRoomUpdates);
        // Delete graduated classrooms and update school
        if (classRoomDeletions.length > 0) {
            yield classroomModel_1.default.deleteMany({ _id: { $in: classRoomDeletions } });
            yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                $pull: { classRooms: { $in: classRoomDeletions } },
            });
        }
        // Process students
        const studentUpdates = [];
        const studentDeletions = [];
        for (const student of students) {
            const newClassName = promoteClassName(student.classAssigned);
            if (newClassName) {
                studentUpdates.push(studentModel_1.default.findByIdAndUpdate(student._id, {
                    classAssigned: newClassName,
                    attendance: null,
                    performance: null,
                    feesPaid1st: false,
                    feesPaid2nd: false,
                    feesPaid3rd: false,
                }, { new: true }));
            }
            else {
                // Student has graduated
                studentDeletions.push(student._id.toString());
            }
        }
        // Execute student updates
        yield Promise.all(studentUpdates);
        // Delete graduated students and update school
        if (studentDeletions.length > 0) {
            yield studentModel_1.default.deleteMany({ _id: { $in: studentDeletions } });
            yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                $pull: { students: { $in: studentDeletions } },
            });
        }
        // Process teachers' class assignments
        const teacherUpdates = [];
        for (const teacher of staff) {
            if (teacher.classesAssigned && Array.isArray(teacher.classesAssigned)) {
                const updatedClasses = teacher.classesAssigned
                    .map((classAssignment) => {
                    const newClassName = promoteClassName(classAssignment.className);
                    if (newClassName) {
                        return Object.assign(Object.assign({}, classAssignment), { className: newClassName });
                    }
                    return null;
                })
                    .filter((assignment) => assignment !== null);
                if (updatedClasses.length !== teacher.classesAssigned.length) {
                    teacherUpdates.push(staffModel_1.default.findByIdAndUpdate(teacher._id, { classesAssigned: updatedClasses }, { new: true }));
                }
            }
        }
        // Execute teacher updates
        yield Promise.all(teacherUpdates);
        return res.status(201).json({
            message: "Session created and students promoted successfully",
            data: {
                session,
                promotedStudents: studentUpdates.length,
                graduatedStudents: studentDeletions.length,
                deletedClassRooms: classRoomDeletions.length,
            },
        });
    }
    catch (error) {
        console.error("Error creating school session:", error);
        return res.status(500).json({
            message: "Error creating school session",
            error: error.message,
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
    var _a, _b, _c, _d, _e, _f;
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
                    const viewDetail = yield termModel_1.default.findById((_a = session === null || session === void 0 ? void 0 : session.term[(session === null || session === void 0 ? void 0 : session.term.length) - 1]) === null || _a === void 0 ? void 0 : _a._id);
                    let resultHist = [];
                    for (let i of schoolClass === null || schoolClass === void 0 ? void 0 : schoolClass.classRooms) {
                        resultHist.push(Object.assign({}, i));
                        yield termModel_1.default.findByIdAndUpdate((_b = session === null || session === void 0 ? void 0 : session.term[(session === null || session === void 0 ? void 0 : session.term.length) - 1]) === null || _b === void 0 ? void 0 : _b._id, {
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
                    const sessionTerm = yield termModel_1.default.create({
                        term: capitalizedText(term),
                        year: session === null || session === void 0 ? void 0 : session.year,
                        presentTerm: term,
                    });
                    yield schoolModel_1.default.findByIdAndUpdate(sessionRecorde === null || sessionRecorde === void 0 ? void 0 : sessionRecorde.schoolID, {
                        presentTermID: (_c = sessionTerm === null || sessionTerm === void 0 ? void 0 : sessionTerm._id) === null || _c === void 0 ? void 0 : _c.toString(),
                        presentSessionID: sessionID,
                        presentTerm: term,
                    }, { new: true });
                    session === null || session === void 0 ? void 0 : session.term.push(new mongoose_1.Types.ObjectId(sessionTerm === null || sessionTerm === void 0 ? void 0 : sessionTerm._id));
                    session === null || session === void 0 ? void 0 : session.save();
                    if (((_d = schoolClass === null || schoolClass === void 0 ? void 0 : schoolClass.session) === null || _d === void 0 ? void 0 : _d.length) > 1 || ((_e = session === null || session === void 0 ? void 0 : session.term) === null || _e === void 0 ? void 0 : _e.length) > 1) {
                        yield schoolModel_1.default.findByIdAndUpdate(sessionRecorde === null || sessionRecorde === void 0 ? void 0 : sessionRecorde.schoolID, {
                            presentTermID: (_f = sessionTerm === null || sessionTerm === void 0 ? void 0 : sessionTerm._id) === null || _f === void 0 ? void 0 : _f.toString(),
                            freeMode: false,
                        }, { new: true });
                    }
                    return res.status(200).json({
                        message: "creating session term",
                        data: sessionTerm,
                        status: 201,
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
            // session: getSchool?.session[0]?.year!,
            // term: getSchool?.session[0]?.presentTerm!,
            session: getSchool === null || getSchool === void 0 ? void 0 : getSchool.presentSession,
            term: getSchool === null || getSchool === void 0 ? void 0 : getSchool.presentTerm,
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
