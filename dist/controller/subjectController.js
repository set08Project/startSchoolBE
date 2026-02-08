"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSubjectFromTeacher = exports.viewSubjectDetail = exports.deleteSchoolSubject = exports.viewSchoolSubjects = exports.updateSchoolSubjectTeacher = exports.updateSchoolSubjectTitle = exports.createBulkClassSubjects = exports.createSchoolSubject = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const mongoose_1 = require("mongoose");
const staffModel_1 = __importDefault(require("../model/staffModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const node_fs_1 = __importDefault(require("node:fs"));
const createSchoolSubject = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { designated, subjectTeacherName, subjectTitle } = req.body;
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "classRooms",
        });
        const schoolSubj = await schoolModel_1.default.findById(schoolID).populate({
            path: "subjects",
        });
        const getClassRooms = school?.classRooms.find((el) => {
            return el.className === designated;
        });
        const getClassRoomsSubj = schoolSubj?.subjects.some((el) => {
            return el.subjectTitle === subjectTitle && el.designated === designated;
        });
        const getClassRM = await classroomModel_1.default.findById(getClassRooms?._id);
        if (getClassRooms) {
            if (school && school.schoolName && school.status === "school-admin") {
                if (!getClassRoomsSubj) {
                    const subjects = await subjectModel_1.default.create({
                        schoolName: school.schoolName,
                        subjectTeacherName,
                        subjectTitle,
                        designated,
                        classDetails: getClassRooms,
                        subjectClassID: getClassRM?._id,
                        subjectClassIDs: getClassRooms?._id,
                    });
                    school.subjects.push(new mongoose_1.Types.ObjectId(subjects._id));
                    school.save();
                    getClassRM?.classSubjects.push(new mongoose_1.Types.ObjectId(subjects._id));
                    getClassRM?.save();
                    return res.status(201).json({
                        message: "subjects created successfully",
                        data: subjects,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "duplicate subject",
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
        else {
            return res.status(404).json({
                message: "Error finding school classroom",
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
exports.createSchoolSubject = createSchoolSubject;
const createBulkClassSubjects = async (req, res) => {
    console.log("POST /api/create-bulk-subject hit", { schoolID: req.params.schoolID });
    try {
        const { schoolID } = req.params;
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
                status: 400,
            });
        }
        const school = await schoolModel_1.default.findById(schoolID).populate("subjects");
        if (!school || school.status !== "school-admin") {
            if (node_fs_1.default.existsSync(req.file.path))
                node_fs_1.default.unlinkSync(req.file.path);
            return res.status(404).json({
                message: "Unable to read school or unauthorized",
                status: 404,
            });
        }
        const classrooms = await classroomModel_1.default.find({ schoolIDs: schoolID });
        const classroomCache = new Map(classrooms.map((c) => [c.className?.trim(), c]));
        const data = await (0, csvtojson_1.default)().fromFile(req.file.path);
        const existingSubjectKeys = new Set(school.subjects.map((s) => `${s.subjectTitle}-${s.designated}`));
        let createdCount = 0;
        let skipCount = 0;
        const errors = [];
        const newSubjectIds = [];
        const classSubjectUpdates = new Map();
        for (let i of data) {
            // Clean and normalize input
            const subjectTitle = i?.subjectTitle?.trim();
            let subjectTeacherName = i?.subjectTeacherName?.trim() || "";
            let designated = i?.designated?.trim() || "";
            // Skip completely empty rows
            if (!subjectTitle && !subjectTeacherName && !designated) {
                continue;
            }
            if (!subjectTitle) {
                errors.push("Missing subjectTitle in row");
                continue;
            }
            // ROBUSTNESS: Handle case where user swapped columns B and C
            // designated should be the class name (exists in classroomCache)
            let targetClassroom = classroomCache.get(designated);
            // If designated is NOT a class, but subjectTeacherName IS a class, they are likely swapped
            if (!targetClassroom && classroomCache.has(subjectTeacherName)) {
                const temp = designated;
                designated = subjectTeacherName;
                subjectTeacherName = temp;
                targetClassroom = classroomCache.get(designated);
            }
            if (!targetClassroom) {
                errors.push(`Classroom not found for '${designated || "N/A"}' (row Subject: ${subjectTitle})`);
                continue;
            }
            const key = `${subjectTitle}-${designated}`;
            if (existingSubjectKeys.has(key)) {
                skipCount++;
                continue;
            }
            try {
                const subjects = await subjectModel_1.default.create({
                    schoolName: school.schoolName,
                    subjectTeacherName: subjectTeacherName,
                    subjectTitle: subjectTitle,
                    designated: designated,
                    classDetails: targetClassroom,
                    subjectClassID: targetClassroom._id,
                    subjectClassIDs: targetClassroom._id,
                });
                const subId = new mongoose_1.Types.ObjectId(subjects._id);
                newSubjectIds.push(subId);
                const classIdStr = targetClassroom._id.toString();
                if (!classSubjectUpdates.has(classIdStr)) {
                    classSubjectUpdates.set(classIdStr, []);
                }
                classSubjectUpdates.get(classIdStr).push(subId);
                existingSubjectKeys.add(key);
                createdCount++;
            }
            catch (err) {
                errors.push(`Error creating subject '${subjectTitle}': ${err?.message || err}`);
            }
        }
        // Update school subjects
        if (newSubjectIds.length > 0) {
            await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                $push: { subjects: { $each: newSubjectIds } },
            });
            // Update classrooms (batch by ID)
            for (const [classId, subIds] of classSubjectUpdates.entries()) {
                await classroomModel_1.default.findByIdAndUpdate(classId, {
                    $push: { classSubjects: { $each: subIds } },
                });
            }
        }
        // Clean up file safely
        if (node_fs_1.default.existsSync(req.file.path))
            node_fs_1.default.unlinkSync(req.file.path);
        const resultMessage = `Process complete. Created: ${createdCount}, Skipped: ${skipCount}${errors.length > 0 ? `, Errors: ${errors.length}` : ""}`;
        return res.status(201).json({
            message: resultMessage,
            status: 201,
            summary: { created: createdCount, skipped: skipCount, errors },
        });
    }
    catch (error) {
        if (req.file && node_fs_1.default.existsSync(req.file.path))
            node_fs_1.default.unlinkSync(req.file.path);
        return res.status(500).json({
            message: "Error processing bulk subject upload",
            data: error.message,
            status: 500,
        });
    }
};
exports.createBulkClassSubjects = createBulkClassSubjects;
const updateSchoolSubjectTitle = async (req, res) => {
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
exports.updateSchoolSubjectTitle = updateSchoolSubjectTitle;
const updateSchoolSubjectTeacher = async (req, res) => {
    try {
        const { schoolID, subjectID } = req.params;
        const { subjectTeacherName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const getTeacher = await staffModel_1.default.findOne({
            staffName: subjectTeacherName,
        });
        if (school && school.schoolName && school.status === "school-admin") {
            if (getTeacher) {
                const subjects = await subjectModel_1.default.findByIdAndUpdate(subjectID, {
                    subjectTeacherName,
                    teacherID: getTeacher?._id,
                }, { new: true });
                const addedData = [
                    ...getTeacher.subjectAssigned,
                    {
                        title: subjects?.subjectTitle,
                        id: subjects?._id,
                        classMeant: subjects?.designated,
                        classID: getTeacher?.presentClassID,
                    },
                ];
                await staffModel_1.default.findByIdAndUpdate(getTeacher._id, {
                    subjectAssigned: addedData,
                }, { new: true });
                return res.status(201).json({
                    message: "subjects teacher updated successfully",
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
            message: "Error updating school subject to Teacher",
            status: 404,
        });
    }
};
exports.updateSchoolSubjectTeacher = updateSchoolSubjectTeacher;
const viewSchoolSubjects = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const schoolSubject = await schoolModel_1.default.findById(schoolID).populate({
            path: "subjects",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "School Subject found",
            status: 200,
            data: schoolSubject,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            status: 404,
        });
    }
};
exports.viewSchoolSubjects = viewSchoolSubjects;
const deleteSchoolSubject = async (req, res) => {
    try {
        const { schoolID, subjectID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const subjects = await subjectModel_1.default.findById(subjectID);
            // const subjects = await subjectModel.findByIdAndDelete(subjectID);
            const classRM = await classroomModel_1.default.findById(subjects?.classDetails);
            school?.subjects?.pull(new mongoose_1.Types.ObjectId(subjects?._id));
            school.save();
            classRM?.classSubjects?.pull(new mongoose_1.Types.ObjectId(subjects?._id));
            classRM?.save();
            return res.status(201).json({
                message: "subjects  deleted successfully",
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
            message: "Error cdeleting subject",
            status: 404,
        });
    }
};
exports.deleteSchoolSubject = deleteSchoolSubject;
const viewSubjectDetail = async (req, res) => {
    try {
        const { subjectID } = req.params;
        const subject = await subjectModel_1.default.findById(subjectID);
        return res.status(200).json({
            message: "Subject found",
            status: 200,
            data: subject,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject session",
            status: 404,
        });
    }
};
exports.viewSubjectDetail = viewSubjectDetail;
const removeSubjectFromTeacher = async (req, res) => {
    try {
        const { schoolID, teacherID, subjectID } = req.params;
        // Validate required params
        if (!schoolID || !teacherID || !subjectID) {
            return res.status(400).json({
                message: "schoolID, teacherID and subjectID are required",
                status: 400,
            });
        }
        // Find school and verify admin status
        const school = await schoolModel_1.default.findById(schoolID);
        if (!school || !school.schoolName || school.status !== "school-admin") {
            return res.status(404).json({
                message: "School not found or not authorized",
                status: 404,
            });
        }
        // Find teacher
        const teacher = await staffModel_1.default.findById(teacherID);
        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found",
                status: 404,
            });
        }
        // Find subject
        const subject = await subjectModel_1.default.findById(subjectID);
        if (!subject) {
            return res.status(404).json({
                message: "Subject not found",
                status: 404,
            });
        }
        // Verify the subject is actually assigned to this teacher
        const hasSubject = teacher.subjectAssigned?.some((el) => el.id.toString() === subjectID);
        if (!hasSubject) {
            return res.status(400).json({
                message: "Subject is not assigned to this teacher",
                status: 400,
            });
        }
        // Remove subject from teacher's assignments
        const updatedAssignments = (teacher.subjectAssigned || []).filter((el) => el.id.toString() !== subjectID);
        // Update both teacher and subject atomically
        const [updatedTeacher, updatedSubject] = await Promise.all([
            staffModel_1.default.findByIdAndUpdate(teacherID, {
                subjectAssigned: updatedAssignments,
            }, { new: true }),
            subjectModel_1.default.findByIdAndUpdate(subjectID, {
                subjectTeacherName: "",
                teacherID: null, // use null instead of empty string for ID field
            }, { new: true }),
        ]);
        if (!updatedTeacher || !updatedSubject) {
            return res.status(500).json({
                message: "Error updating records",
                status: 500,
            });
        }
        return res.status(200).json({
            message: "Subject removed from teacher successfully",
            data: {
                teacher: updatedTeacher,
                subject: updatedSubject,
            },
            status: 200,
        });
    }
    catch (error) {
        console.error("Error removing subject from teacher:", error);
        return res.status(500).json({
            message: "Error removing subject from teacher",
            error: error.message,
            status: 500,
        });
    }
};
exports.removeSubjectFromTeacher = removeSubjectFromTeacher;
