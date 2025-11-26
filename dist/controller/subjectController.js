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
const node_path_1 = __importDefault(require("node:path"));
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
        const getClassRooms = school === null || school === void 0 ? void 0 : school.classRooms.find((el) => {
            return el.className === designated;
        });
        const getClassRoomsSubj = schoolSubj === null || schoolSubj === void 0 ? void 0 : schoolSubj.subjects.some((el) => {
            return el.subjectTitle === subjectTitle && el.designated === designated;
        });
        const getClassRM = await classroomModel_1.default.findById(getClassRooms === null || getClassRooms === void 0 ? void 0 : getClassRooms._id);
        if (getClassRooms) {
            if (school && school.schoolName && school.status === "school-admin") {
                if (!getClassRoomsSubj) {
                    const subjects = await subjectModel_1.default.create({
                        schoolName: school.schoolName,
                        subjectTeacherName,
                        subjectTitle,
                        designated,
                        classDetails: getClassRooms,
                        subjectClassID: getClassRM === null || getClassRM === void 0 ? void 0 : getClassRM._id,
                        subjectClassIDs: getClassRooms === null || getClassRooms === void 0 ? void 0 : getClassRooms._id,
                    });
                    school.subjects.push(new mongoose_1.Types.ObjectId(subjects._id));
                    school.save();
                    getClassRM === null || getClassRM === void 0 ? void 0 : getClassRM.classSubjects.push(new mongoose_1.Types.ObjectId(subjects._id));
                    getClassRM === null || getClassRM === void 0 ? void 0 : getClassRM.save();
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
        const data = await (0, csvtojson_1.default)().fromFile(req.file.path);
        let createdCount = 0;
        let duplicateCount = 0;
        const errors = [];
        for (let i of data) {
            const school = await schoolModel_1.default.findById(schoolID).populate({
                path: "classRooms",
            });
            const schoolSubj = await schoolModel_1.default.findById(schoolID).populate({
                path: "subjects",
            });
            const getClassRooms = school === null || school === void 0 ? void 0 : school.classRooms.find((el) => {
                var _a;
                return ((_a = el.className) === null || _a === void 0 ? void 0 : _a.trim()) === (i === null || i === void 0 ? void 0 : i.designated);
            });
            const getClassRoomsSubj = schoolSubj === null || schoolSubj === void 0 ? void 0 : schoolSubj.subjects.some((el) => {
                return (el.subjectTitle === (i === null || i === void 0 ? void 0 : i.subjectTitle) && el.designated === (i === null || i === void 0 ? void 0 : i.designated));
            });
            const getClassRM = await classroomModel_1.default.findById(getClassRooms === null || getClassRooms === void 0 ? void 0 : getClassRooms._id);
            if (!getClassRooms) {
                errors.push(`Error finding classroom for designated='${i === null || i === void 0 ? void 0 : i.designated}'`);
                continue;
            }
            if (!(school && school.schoolName && school.status === "school-admin")) {
                errors.push(`Unable to read school for row with subjectTitle='${i === null || i === void 0 ? void 0 : i.subjectTitle}'`);
                continue;
            }
            if (getClassRoomsSubj) {
                duplicateCount++;
                // skip duplicates but continue processing remaining rows
                continue;
            }
            try {
                const subjects = await subjectModel_1.default.create({
                    schoolName: school.schoolName,
                    subjectTeacherName: i === null || i === void 0 ? void 0 : i.subjectTeacherName,
                    subjectTitle: i === null || i === void 0 ? void 0 : i.subjectTitle,
                    designated: i === null || i === void 0 ? void 0 : i.designated,
                    classDetails: getClassRooms,
                    subjectClassID: getClassRM === null || getClassRM === void 0 ? void 0 : getClassRM._id,
                    subjectClassIDs: getClassRooms === null || getClassRooms === void 0 ? void 0 : getClassRooms._id,
                });
                // await saves to ensure DB state is consistent
                school.subjects.push(new mongoose_1.Types.ObjectId(subjects._id));
                await school.save();
                getClassRM === null || getClassRM === void 0 ? void 0 : getClassRM.classSubjects.push(new mongoose_1.Types.ObjectId(subjects._id));
                if (getClassRM)
                    await getClassRM.save();
                createdCount++;
            }
            catch (err) {
                errors.push(`Error creating subject '${i === null || i === void 0 ? void 0 : i.subjectTitle}': ${(err === null || err === void 0 ? void 0 : err.message) || err}`);
            }
        }
        // delete uploaded files once after processing
        deleteFilesInFolder(filePath);
        return res.status(201).json({
            message: "done with class entry",
            status: 201,
            summary: { created: createdCount, duplicates: duplicateCount, errors },
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
                    teacherID: getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher._id,
                }, { new: true });
                const addedData = [
                    ...getTeacher.subjectAssigned,
                    {
                        title: subjects === null || subjects === void 0 ? void 0 : subjects.subjectTitle,
                        id: subjects === null || subjects === void 0 ? void 0 : subjects._id,
                        classMeant: subjects === null || subjects === void 0 ? void 0 : subjects.designated,
                        classID: getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.presentClassID,
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
    var _a, _b;
    try {
        const { schoolID, subjectID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const subjects = await subjectModel_1.default.findById(subjectID);
            // const subjects = await subjectModel.findByIdAndDelete(subjectID);
            const classRM = await classroomModel_1.default.findById(subjects === null || subjects === void 0 ? void 0 : subjects.classDetails);
            (_a = school === null || school === void 0 ? void 0 : school.subjects) === null || _a === void 0 ? void 0 : _a.pull(new mongoose_1.Types.ObjectId(subjects === null || subjects === void 0 ? void 0 : subjects._id));
            school.save();
            (_b = classRM === null || classRM === void 0 ? void 0 : classRM.classSubjects) === null || _b === void 0 ? void 0 : _b.pull(new mongoose_1.Types.ObjectId(subjects === null || subjects === void 0 ? void 0 : subjects._id));
            classRM === null || classRM === void 0 ? void 0 : classRM.save();
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
    var _a;
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
        const hasSubject = (_a = teacher.subjectAssigned) === null || _a === void 0 ? void 0 : _a.some((el) => el.id.toString() === subjectID);
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
