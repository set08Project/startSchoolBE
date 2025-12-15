"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewClassPositions = exports.studentOfWeek = exports.viewClassTopStudent = exports.deleteSchoolClass = exports.updateSchoolClass1stFee = exports.updateSchoolClassTeacher = exports.updateSchoolClassName = exports.viewClassRM = exports.viewOneClassRM = exports.viewSchoolClasses = exports.viewSchoolClassesByName = exports.viewClassesBySubject = exports.viewClassesByStudent = exports.viewClassesByTimeTable = exports.updateSchoolClassesPerformance = exports.createBulkSchoolClassroom = exports.createSchoolClasses = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const mongoose_1 = require("mongoose");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const lodash_1 = __importDefault(require("lodash"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const cardReportModel_1 = __importDefault(require("../model/cardReportModel"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const createSchoolClasses = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { classTeacherName, className, class2ndFee, class3rdFee, class1stFee, } = req.body;
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "classRooms",
        });
        const checkClass = school?.classRooms.some((el) => {
            return el.className === className;
        });
        if (school && school.status === "school-admin") {
            if (!checkClass) {
                const classes = await classroomModel_1.default.create({
                    schoolName: school.schoolName,
                    classTeacherName,
                    className,
                    class2ndFee,
                    class3rdFee,
                    class1stFee,
                    schoolIDs: schoolID,
                    presentTerm: school?.presentTerm,
                });
                school.historys.push(new mongoose_1.Types.ObjectId(classes._id));
                school.classRooms.push(new mongoose_1.Types.ObjectId(classes._id));
                school.save();
                return res.status(201).json({
                    message: "classes created successfully",
                    data: classes,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "duplicated class name",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            error,
        });
    }
};
exports.createSchoolClasses = createSchoolClasses;
const createBulkSchoolClassroom = async (req, res) => {
    try {
        const { schoolID } = req.params;
        let filePath = node_path_1.default.join(__dirname, "../uploads/examination");
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
        console.log("data: ", filePath, req.file.path);
        const data = await (0, csvtojson_1.default)().fromFile(req.file.path);
        console.log(data);
        for (let i of data) {
            const school = await schoolModel_1.default.findById(schoolID).populate({
                path: "classRooms",
            });
            const checkClass = school?.classRooms.some((el) => {
                return el.className === i?.className;
            });
            const findClass = school?.classRooms?.find((el) => {
                return el.className === i?.classAssigned;
            });
            if (school && school.status === "school-admin") {
                if (!checkClass) {
                    const classes = await classroomModel_1.default.create({
                        schoolName: school.schoolName,
                        classTeacherName: i?.classTeacherName,
                        className: i?.className,
                        class2ndFee: parseInt(i?.class2ndFee.replace(/,/g, "")),
                        class3rdFee: parseInt(i?.class3rdFee.replace(/,/g, "")),
                        class1stFee: parseInt(i?.class1stFee.replace(/,/g, "")),
                        schoolIDs: schoolID,
                        presentTerm: school?.presentTerm,
                    });
                    school.historys.push(new mongoose_1.Types.ObjectId(classes._id));
                    school.classRooms.push(new mongoose_1.Types.ObjectId(classes._id));
                    school.save();
                    deleteFilesInFolder(filePath);
                    // return res.status(201).json({
                    //   message: "classes created successfully",
                    //   data: classes,
                    //   status: 201,
                    // });
                }
                else {
                    return res.status(404).json({
                        message: "duplicated class name",
                        status: 404,
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "unable to read school",
                    status: 404,
                });
            }
        }
        return res.status(201).json({
            message: "done with class entry",
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
};
exports.createBulkSchoolClassroom = createBulkSchoolClassroom;
const updateSchoolClassesPerformance = async (req, res) => {
    try {
        const { schoolID, subjectID } = req.params;
        const { subjectTitle } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const subjects = await subjectModel_1.default.findByIdAndUpdate(subjectID, {
                subjectTitle,
            }, { new: true });
            return res.status(201).json({
                message: "subjects title updated successfully",
                data: subjects,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
};
exports.updateSchoolClassesPerformance = updateSchoolClassesPerformance;
const viewClassesByTimeTable = async (req, res) => {
    try {
        const { classID } = req.params;
        const schoolClasses = await classroomModel_1.default.findById(classID).populate({
            path: "timeTable",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "finding classes by TimeTable",
            status: 200,
            data: schoolClasses,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class",
            status: 404,
            data: error.message,
        });
    }
};
exports.viewClassesByTimeTable = viewClassesByTimeTable;
const viewClassesByStudent = async (req, res) => {
    try {
        const { classID } = req.params;
        const schoolClasses = await classroomModel_1.default.findById(classID).populate({
            path: "students",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "finding class students",
            status: 200,
            data: schoolClasses,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class",
            status: 404,
            data: error.message,
        });
    }
};
exports.viewClassesByStudent = viewClassesByStudent;
const viewClassesBySubject = async (req, res) => {
    try {
        const { classID } = req.params;
        const schoolClasses = await classroomModel_1.default.findById(classID).populate({
            path: "classSubjects",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "finding classes by Name",
            status: 200,
            data: schoolClasses,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class",
            status: 404,
            data: error.message,
        });
    }
};
exports.viewClassesBySubject = viewClassesBySubject;
const viewSchoolClassesByName = async (req, res) => {
    try {
        const { className } = req.body;
        const schoolClasses = await classroomModel_1.default.findOne({ className }).populate({
            path: "classSubjects",
        });
        return res.status(200).json({
            message: "finding classes by Name",
            status: 200,
            data: schoolClasses,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class",
            status: 404,
            data: error.message,
        });
    }
};
exports.viewSchoolClassesByName = viewSchoolClassesByName;
const viewSchoolClasses = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const schoolClasses = await schoolModel_1.default.findById(schoolID).populate({
            path: "classRooms",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "School classes found",
            status: 200,
            data: schoolClasses,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class",
            status: 404,
            data: error.message,
        });
    }
};
exports.viewSchoolClasses = viewSchoolClasses;
const viewOneClassRM = async (req, res) => {
    try {
        const { classID } = req.params;
        const schoolClasses = await classroomModel_1.default.findById(classID);
        return res.status(200).json({
            message: "School's class info found",
            status: 200,
            data: schoolClasses,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class info",
            status: 404,
            data: error.message,
        });
    }
};
exports.viewOneClassRM = viewOneClassRM;
const viewClassRM = async (req, res) => {
    try {
        const { classID } = req.params;
        const schoolClasses = await classroomModel_1.default.findById(classID).populate({
            path: "classSubjects",
        });
        return res.status(200).json({
            message: "School classes info found",
            status: 200,
            data: schoolClasses,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class info",
            status: 404,
            data: error.message,
        });
    }
};
exports.viewClassRM = viewClassRM;
const updateSchoolClassName = async (req, res) => {
    try {
        const { schoolID, classID } = req.params;
        const { className } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const subjects = await classroomModel_1.default.findByIdAndUpdate(classID, {
                className,
            }, { new: true });
            for (let i of school.students) {
                let student = await studentModel_1.default.findById(i);
                if (student?.presentClassID === classID) {
                    await studentModel_1.default.findByIdAndUpdate(i, { classAssigned: className }, { new: true });
                }
            }
            for (let i of school.staff) {
                let staff = await staffModel_1.default.findById(i);
                if (staff?.presentClassID === classID) {
                    let myClass = staff?.classesAssigned.find((el) => {
                        return el.classID === classID;
                    });
                    myClass = { className, classID };
                    let xx = staff?.classesAssigned.filter((el) => {
                        return el.classID !== classID;
                    });
                    let subj = staff?.subjectAssigned.find((el) => {
                        return el.classID === classID;
                    });
                    subj = { ...subj, classMeant: className };
                    let yy = staff?.subjectAssigned.filter((el) => {
                        return el.classID !== classID;
                    });
                    await staffModel_1.default.findByIdAndUpdate(i, {
                        classesAssigned: [...xx, myClass],
                        subjectAssigned: [
                            ...staff?.subjectAssigned.filter((el) => {
                                return el.classID !== classID;
                            }),
                            subj,
                        ],
                    }, { new: true });
                }
            }
            for (let i of school.subjects) {
                let subject = await subjectModel_1.default.findById(i);
                if (subject?.subjectClassID === classID) {
                    await subjectModel_1.default.findByIdAndUpdate(i, { designated: className }, { new: true });
                }
            }
            return res.status(201).json({
                message: "class name updated successfully",
                data: subjects,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating updating class name",
            status: 404,
        });
    }
};
exports.updateSchoolClassName = updateSchoolClassName;
const updateSchoolClassTeacher = async (req, res) => {
    try {
        const { schoolID, classID } = req.params;
        const { classTeacherName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const getTeacher = await staffModel_1.default.findOne({
            staffName: classTeacherName,
        });
        if (school && school.schoolName && school.status === "school-admin") {
            if (getTeacher) {
                const subjects = await classroomModel_1.default.findByIdAndUpdate(classID, {
                    classTeacherName,
                    teacherID: getTeacher._id,
                }, { new: true });
                await staffModel_1.default.findByIdAndUpdate(getTeacher._id, {
                    classesAssigned: [
                        ...getTeacher?.classesAssigned,
                        { className: subjects?.className, classID },
                    ],
                    presentClassID: classID,
                }, { new: true });
                return res.status(201).json({
                    message: "class teacher updated successfully",
                    data: subjects,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "unable to find school Teacher",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
};
exports.updateSchoolClassTeacher = updateSchoolClassTeacher;
const updateSchoolClass1stFee = async (req, res) => {
    try {
        const { schoolID, classID } = req.params;
        const { class1stFee, class2ndFee, class3rdFee } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const getClass = await classroomModel_1.default.findById(classID);
        if (school && school.schoolName && school.status === "school-admin") {
            if (getClass) {
                const update = await classroomModel_1.default.findByIdAndUpdate(getClass._id, {
                    class1stFee,
                    class2ndFee,
                    class3rdFee,
                }, { new: true });
                // After updating class fees, reflect the change on students in this class.
                // Determine which term is active on the class and set students' classTermFee accordingly.
                try {
                    const term = update?.presentTerm;
                    const feeForTerm = term === "1st Term"
                        ? update?.class1stFee
                        : term === "2nd Term"
                            ? update?.class2ndFee
                            : term === "3rd Term"
                                ? update?.class3rdFee
                                : null;
                    if (feeForTerm !== null && feeForTerm !== undefined) {
                        await studentModel_1.default.updateMany({ presentClassID: classID }, { $set: { classTermFee: feeForTerm } });
                    }
                }
                catch (err) {
                    // Log but don't fail the entire request — the class fees were updated.
                    console.error("Failed to update students' classTermFee:", err?.message || err);
                }
                return res.status(201).json({
                    message: "class term fee updated successfully",
                    data: update,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "unable to find class",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
            data: error.message,
        });
    }
};
exports.updateSchoolClass1stFee = updateSchoolClass1stFee;
const deleteSchoolClass = async (req, res) => {
    try {
        const { schoolID, classID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const subjects = await classroomModel_1.default.findByIdAndDelete(classID);
            school.classRooms.pull(new mongoose_1.Types.ObjectId(subjects?._id));
            school.save();
            return res.status(201).json({
                message: "class deleted successfully",
                data: subjects,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
};
exports.deleteSchoolClass = deleteSchoolClass;
const viewClassTopStudent = async (req, res) => {
    try {
        const { classID } = req.params;
        const schoolClasses = await classroomModel_1.default.findById(classID).populate({
            path: "students",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        const rate = lodash_1.default.orderBy(schoolClasses?.students, ["totalPerformance"], ["desc"]);
        return res.status(200).json({
            message: "finding class students top performance!",
            status: 200,
            data: rate,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school class",
            status: 404,
            data: error.message,
        });
    }
};
exports.viewClassTopStudent = viewClassTopStudent;
const studentOfWeek = async (req, res) => {
    try {
        const { teacherID } = req.params;
        const { studentName, remark } = req.body;
        const teacher = await staffModel_1.default.findById(teacherID);
        const classRM = await classroomModel_1.default
            .findById(teacher?.presentClassID)
            .populate({
            path: "students",
        });
        const getStudent = classRM?.students.find((el) => {
            return (`${el.studentFirstName}` === studentName.trim().split(" ")[0] &&
                `${el.studentLastName}` === studentName.trim().split(" ")[1]);
        });
        const studentData = await studentModel_1.default.findById(getStudent?._id);
        if (teacher?.status === "school-teacher" && classRM && studentData) {
            const week = await classroomModel_1.default.findByIdAndUpdate(classRM?._id, {
                weekStudent: {
                    student: studentData,
                    remark,
                },
            }, { new: true });
            return res.status(201).json({
                message: "student of the week awarded",
                status: 201,
                data: week,
            });
        }
        else {
            return res.status(404).json({
                message: "student 2nd fees not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.studentOfWeek = studentOfWeek;
/**
 * GET /view-class-positions/:classID?source=historical|report|mid&term=&session=
 * source defaults to 'historical'.
 * Computes positions for students in a class based on chosen source's total points.
 */
const viewClassPositions = async (req, res) => {
    try {
        const { classID } = req.params;
        // Always use report card (cardReportModel) for ranking.
        const { term, session } = req.query;
        // populate students and their reportCard entries so we can inspect per-student reports
        const classDoc = await classroomModel_1.default.findById(classID).populate({
            path: "students",
            populate: { path: "reportCard" },
        });
        if (!classDoc) {
            return res.status(404).json({ message: "Class not found", status: 404 });
        }
        const students = classDoc.students || [];
        // Helper to get numeric score for a student using report cards only.
        const getScoreForStudent = async (student) => {
            try {
                // Prefer using populated student.reportCard if available
                const reports = Array.isArray(student?.reportCard)
                    ? student.reportCard
                    : [];
                // filter candidate reports by class, term (classInfo), and session when provided
                const candidates = reports.filter((r) => {
                    if (!r)
                        return false;
                    // r may be an ObjectId if not populated
                    if (typeof r === "string" || r instanceof mongoose_1.Types.ObjectId)
                        return false;
                    if (classID && r.classes && `${r.classes}` !== `${classID}`)
                        return false;
                    if (term && r.classInfo && `${r.classInfo}` !== `${term}`)
                        return false;
                    if (session && r.session && `${r.session}` !== `${session}`)
                        return false;
                    return true;
                });
                // choose most recent candidate if any
                let chosen = null;
                if (candidates.length > 0) {
                    chosen = candidates.sort((a, b) => {
                        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return tb - ta;
                    })[0];
                }
                else {
                    // fallback to querying report collection directly (in case student's reportCard wasn't populated)
                    const q = { student: student._id };
                    if (classID)
                        q.classes = classID;
                    if (term)
                        q.classInfo = term;
                    if (session)
                        q.session = session;
                    chosen = await cardReportModel_1.default.findOne(q).sort({ createdAt: -1 });
                }
                if (!chosen)
                    return 0;
                // If points already set on the report, use it
                if (typeof chosen.points === "number" && chosen.points > 0) {
                    return chosen.points;
                }
                // Otherwise try to compute from result array (per-subject points)
                if (Array.isArray(chosen.result) && chosen.result.length > 0) {
                    const total = chosen.result.reduce((sum, r) => sum + (r.points || 0), 0);
                    const avg = total / chosen.result.length;
                    return Number.isFinite(avg) ? parseFloat(avg.toFixed(2)) : 0;
                }
                // last fallback
                return 0;
            }
            catch (e) {
                return 0;
            }
        };
        // Build array of { student, score }
        const scored = [];
        console.log("ed: ", students);
        for (const s of students) {
            // if historical/report/mid not present, fallback to student's totalPerformance
            const scoreFromModel = await getScoreForStudent(s);
            const fallback = typeof s.totalPerformance === "number" ? s.totalPerformance : 0;
            const score = scoreFromModel || fallback;
            scored.push({ student: s, score });
        }
        // Sort descending by score
        scored.sort((a, b) => b.score - a.score);
        // Assign positions, handling ties (same score -> same position)
        const ranked = scored.map((entry, idx) => ({
            position: 0,
            score: entry.score,
            student: entry.student,
        }));
        let currentPos = 1;
        for (let i = 0; i < ranked.length; i++) {
            if (i === 0) {
                ranked[i].position = currentPos;
            }
            else {
                if (ranked[i].score === ranked[i - 1].score) {
                    ranked[i].position = ranked[i - 1].position;
                }
                else {
                    ranked[i].position = i + 1;
                }
            }
        }
        const best = ranked.length ? ranked[0] : null;
        const worst = ranked.length ? ranked[ranked.length - 1] : null;
        return res.status(200).json({
            message: "Class positions computed",
            status: 200,
            data: { ranked, best, worst },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error computing positions",
            error: error.message,
            status: 500,
        });
    }
};
exports.viewClassPositions = viewClassPositions;
