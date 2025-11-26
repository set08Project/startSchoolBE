"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllStudents = exports.deleteStudent = exports.changeStudentClass = exports.assignClassMonitor = exports.updateSchoolSchoolFee = exports.viewSchoolSchoolFeeRecord = exports.viewSchoolFeeRecord = exports.createSchoolFeePayment = exports.viewStorePurchasedTeacher = exports.createStorePurchasedTeacher = exports.updateSchoolStorePurchased = exports.viewSchoolStorePurchased = exports.viewStorePurchased = exports.createStorePurchased = exports.updatePurchaseRecord = exports.updateStudent3rdFees = exports.updateStudent2ndFees = exports.updateStudentLinkedinAccount = exports.updateXAcctount = exports.updateInstagramAccout = exports.updateStudentFacebookAcct = exports.updateStudent1stFees = exports.updateStudentParentNumber = exports.updateStudentBulkInfo = exports.updateMainStudentBulkInfo = exports.updateStudentInfo = exports.updateStudentViewReportCard = exports.updateStudentPhone = exports.updateStudentGender = exports.updateStudentAddress = exports.updateStudentLastName = exports.updateStudentFirstName = exports.updateStudentParentEmail = exports.updateStudentAvatar = exports.logoutStudent = exports.readStudentCookie = exports.loginStudentWithToken = exports.loginStudent = exports.readStudentDetail = exports.readStudentByEnrollmentID = exports.readSchoolStudents = exports.createBulkSchoolStudent = exports.createSchoolStudent = exports.clockOutAccountWidthID = exports.clockOutAccount = exports.clockinAccountWithID = exports.clockinAccount = exports.findStudenWithEnrollmentID = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const streamifier_1 = require("../utils/streamifier");
const email_1 = require("../utils/email");
const staffModel_1 = __importDefault(require("../model/staffModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const historyModel_1 = __importDefault(require("../model/historyModel"));
const schoolFeeHistory_1 = __importDefault(require("../model/schoolFeeHistory"));
// import subjectModel from "../model/subjectModel";
const csvtojson_1 = __importDefault(require("csvtojson"));
const moment_1 = __importDefault(require("moment"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const termModel_1 = __importDefault(require("../model/termModel"));
// CLOCK-IN/CLOCK-OUT
const findStudenWithEnrollmentID = async (req, res) => {
    try {
        const { enrollmentID } = req.body;
        const student = await studentModel_1.default.findOne({ enrollmentID });
        return res.status(201).json({
            message: "viewing student with enrollment ID",
            data: student,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error finding student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.findStudenWithEnrollmentID = findStudenWithEnrollmentID;
const clockinAccount = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student?.schoolIDs === school?._id.toString()) {
                const clockInfo = await studentModel_1.default.findByIdAndUpdate(student._id, {
                    clockIn: true,
                    clockInTime: (0, moment_1.default)(new Date().getTime()).format("llll"),
                    clockOut: false,
                }, { new: true });
                await (0, email_1.clockingInEmail)(clockInfo, school);
                return res.status(201).json({
                    message: "student has clock-in",
                    data: clockInfo,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error clockin student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.clockinAccount = clockinAccount;
const clockinAccountWithID = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { enrollmentID } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findOne({ enrollmentID });
            if (student) {
                const clockInfo = await studentModel_1.default.findByIdAndUpdate(student._id, {
                    clockIn: true,
                    clockInTime: (0, moment_1.default)(new Date().getTime()).format("llll"),
                    clockOut: false,
                }, { new: true });
                (0, email_1.clockingInEmail)(clockInfo, school);
                return res.status(201).json({
                    message: "student has clock-in",
                    data: clockInfo,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error clockin student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.clockinAccountWithID = clockinAccountWithID;
const clockOutAccount = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student?.schoolIDs === school?._id.toString()) {
                if (student?.clockIn) {
                    const clockInfo = await studentModel_1.default.findByIdAndUpdate(student._id, {
                        clockIn: false,
                        clockOut: true,
                        clockOutTime: (0, moment_1.default)(new Date().getTime()).format("llll"),
                    }, { new: true });
                    (0, email_1.clockingOutEmail)(clockInfo, school);
                    return res.status(201).json({
                        message: "student has clock-in",
                        data: clockInfo,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Student has to be clock-in first before they can be clock-out",
                        status: 404,
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error clockin student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.clockOutAccount = clockOutAccount;
const clockOutAccountWidthID = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { enrollmentID } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findOne({ enrollmentID });
            if (student) {
                if (student?.clockIn) {
                    const clockInfo = await studentModel_1.default.findByIdAndUpdate(student._id, {
                        clockIn: false,
                        clockOut: true,
                        clockOutTime: (0, moment_1.default)(new Date().getTime()).format("llll"),
                    }, { new: true });
                    (0, email_1.clockingOutEmail)(clockInfo, school);
                    return res.status(201).json({
                        message: "student has clock-in",
                        data: clockInfo,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Student has to be clock-in first before they can be clock-out",
                        status: 404,
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error clockin student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.clockOutAccountWidthID = clockOutAccountWidthID;
// Create Account
const createSchoolStudent = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { studentLastName, gender, studentFirstName, studentAddress, classAssigned, } = req.body;
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "classRooms",
        });
        const enrollmentID = crypto_1.default.randomBytes(4).toString("hex");
        const salt = await bcrypt_1.default.genSalt(10);
        const hashed = await bcrypt_1.default.hash(`${studentFirstName.replace(/ /gi, "").toLowerCase()}${studentLastName
            .replace(/ /gi, "")
            .toLowerCase()}`, salt);
        const findClass = school?.classRooms?.find((el) => {
            console.log(el.className.trim());
            return el.className.trim() === classAssigned;
        });
        if (school && school.schoolName && school.status === "school-admin") {
            if (findClass) {
                const student = await studentModel_1.default.create({
                    schoolIDs: schoolID,
                    presentClassID: findClass?._id,
                    classTermFee: findClass?.presentTerm === "1st Term"
                        ? findClass?.class1stFee
                        : findClass?.presentTerm === "2nd Term"
                            ? findClass?.class2ndFee
                            : findClass?.presentTerm === "3rd Term"
                                ? findClass?.class3rdFee
                                : null,
                    gender,
                    enrollmentID,
                    schoolID: school?.enrollmentID,
                    studentFirstName,
                    studentLastName,
                    schoolName: school?.schoolName,
                    studentAddress,
                    classAssigned,
                    email: `${studentFirstName
                        .replace(/ /gi, "")
                        .toLowerCase()}${studentLastName
                        .replace(/ /gi, "")
                        .toLowerCase()}@${school?.schoolName
                        ?.replace(/ /gi, "")
                        .toLowerCase()}.com`,
                    password: hashed,
                    status: "school-student",
                });
                school?.students.push(new mongoose_1.Types.ObjectId(student._id));
                school?.historys?.push(new mongoose_1.Types.ObjectId(student._id));
                await school.save();
                findClass?.students.push(new mongoose_1.Types.ObjectId(student._id));
                await findClass.save();
                return res.status(201).json({
                    message: "student created successfully",
                    data: student,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "class must exist",
                    status: 404,
                });
            }
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
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.createSchoolStudent = createSchoolStudent;
const createBulkSchoolStudent = async (req, res) => {
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
        for (const i of data) {
            const school = await schoolModel_1.default.findById(schoolID).populate({
                path: "classRooms",
            });
            const enrollmentID = crypto_1.default.randomBytes(4).toString("hex");
            const salt = await bcrypt_1.default.genSalt(10);
            const hashed = await bcrypt_1.default.hash(`${i?.studentFirstName
                ?.replace(/ /gi, "")
                .toLowerCase()}${i?.studentLastName
                ?.replace(/ /gi, "")
                .toLowerCase()}`, salt);
            const findClass = school?.classRooms?.find((el) => {
                return el.className.trim() === i?.classAssigned;
            });
            if (!(school && school.schoolName && school.status === "school-admin")) {
                errors.push(`School not found or not admin for row ${JSON.stringify(i)}`);
                continue;
            }
            if (!findClass) {
                errors.push(`Class '${i?.classAssigned}' not found for row ${JSON.stringify(i)}`);
                continue;
            }
            // check duplicate by email or exact name within the same school
            const email = `${i?.studentFirstName
                ?.replace(/ /gi, "")
                .toLowerCase()}${i?.studentLastName
                ?.replace(/ /gi, "")
                .toLowerCase()}@${school?.schoolName
                ?.replace(/ /gi, "")
                .toLowerCase()}.com`;
            const existing = await studentModel_1.default.findOne({
                $or: [
                    { email },
                    {
                        studentFirstName: i?.studentFirstName,
                        studentLastName: i?.studentLastName,
                        schoolIDs: schoolID,
                    },
                ],
            });
            if (existing) {
                duplicateCount++;
                continue;
            }
            try {
                const student = await studentModel_1.default.create({
                    schoolIDs: schoolID,
                    presentClassID: findClass?._id,
                    classTermFee: findClass?.presentTerm === "1st Term"
                        ? findClass?.class1stFee
                        : findClass?.presentTerm === "2nd Term"
                            ? findClass?.class2ndFee
                            : findClass?.presentTerm === "3rd Term"
                                ? findClass?.class3rdFee
                                : null,
                    gender: i?.gender,
                    enrollmentID,
                    schoolID: school?.enrollmentID,
                    studentFirstName: i?.studentFirstName,
                    studentLastName: i?.studentLastName,
                    schoolName: school?.schoolName,
                    studentAddress: i?.studentAddress,
                    classAssigned: i?.classAssigned,
                    email,
                    password: hashed,
                    status: "school-student",
                });
                school?.students.push(new mongoose_1.Types.ObjectId(student._id));
                school?.historys?.push(new mongoose_1.Types.ObjectId(student._id));
                await school.save();
                findClass?.students.push(new mongoose_1.Types.ObjectId(student._id));
                await findClass.save();
                createdCount++;
            }
            catch (err) {
                errors.push(`Error creating student for row ${JSON.stringify(i)}: ${err?.message || err}`);
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
exports.createBulkSchoolStudent = createBulkSchoolStudent;
const readSchoolStudents = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const students = await schoolModel_1.default.findById(schoolID).populate({
            path: "students",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "students read successfully",
            data: students,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.readSchoolStudents = readSchoolStudents;
const readStudentByEnrollmentID = async (req, res) => {
    try {
        const { enrollmentID } = req.params;
        const students = await studentModel_1.default.findOne({ enrollmentID });
        return res.status(200).json({
            message: "student read successfully",
            data: students,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.readStudentByEnrollmentID = readStudentByEnrollmentID;
const readStudentDetail = async (req, res) => {
    try {
        const { studentID } = req.params;
        const students = await studentModel_1.default.findById(studentID);
        return res.status(200).json({
            message: "student read successfully",
            data: students,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.readStudentDetail = readStudentDetail;
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const getTeacher = await studentModel_1.default.findOne({ email });
        const school = await schoolModel_1.default.findOne({
            schoolName: getTeacher?.schoolName,
        });
        if (school?.schoolName && getTeacher?.schoolName) {
            if (school.verify) {
                const token = jsonwebtoken_1.default.sign({ status: school.status }, "student", {
                    expiresIn: "1d",
                });
                const pass = await bcrypt_1.default.compare(password, getTeacher?.password);
                if (pass) {
                    req.session.isAuth = true;
                    req.session.isSchoolID = getTeacher._id;
                    return res.status(201).json({
                        message: "welcome back",
                        user: getTeacher?.status,
                        data: token,
                        id: req.session.isSchoolID,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Invalid Password",
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "please confirm with your school admin",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error finding school",
            });
        }
        // return res.status(201).json({
        //   message: "creating school",
        //   data: school,
        // });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error logging you in",
        });
    }
};
exports.loginStudent = loginStudent;
const loginStudentWithToken = async (req, res) => {
    try {
        const { token } = req.body;
        const getStudent = await studentModel_1.default.findOne({ enrollmentID: token });
        const school = await schoolModel_1.default.findOne({
            schoolName: getStudent?.schoolName,
        });
        if (school?.schoolName && getStudent?.schoolName) {
            if (school.verify) {
                const token = jsonwebtoken_1.default.sign({ status: school.status }, "student", {
                    expiresIn: "1d",
                });
                req.session.isAuth = true;
                req.session.isSchoolID = getStudent._id;
                return res.status(201).json({
                    message: "welcome back",
                    user: getStudent?.status,
                    data: token,
                    id: req.session.isSchoolID,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "please confirm with your school admin",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error finding school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error logging you in",
        });
    }
};
exports.loginStudentWithToken = loginStudentWithToken;
const readStudentCookie = async (req, res) => {
    try {
        const readSchool = req.session.isSchoolID;
        return res.status(200).json({
            message: "GoodBye",
            data: readSchool,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying student",
        });
    }
};
exports.readStudentCookie = readStudentCookie;
const logoutStudent = async (req, res) => {
    try {
        req.session.destroy();
        return res.status(200).json({
            message: "GoodBye",
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error logging out teacher",
        });
    }
};
exports.logoutStudent = logoutStudent;
const updateStudentAvatar = async (req, res) => {
    try {
        const { studentID } = req.params;
        const school = await studentModel_1.default.findById(studentID);
        if (school) {
            const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
            const updatedStudent = await studentModel_1.default.findByIdAndUpdate(studentID, {
                avatar: secure_url,
                avatarID: public_id,
            }, { new: true });
            return res.status(200).json({
                message: "student avatar has been, added",
                data: updatedStudent,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "student not seen",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating avatar",
            data: error.message,
        });
    }
};
exports.updateStudentAvatar = updateStudentAvatar;
//Student Updates settings
const updateStudentParentEmail = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { parentEmail } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const student = await studentModel_1.default.findByIdAndUpdate(studentID, { parentEmail }, { new: true });
            return res.status(201).json({
                message: "student profile updated successful",
                data: student,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to update student profile",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error getting school",
            status: 404,
        });
    }
};
exports.updateStudentParentEmail = updateStudentParentEmail;
const updateStudentFirstName = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { studentFirstName, studentLastName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (!school) {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
        const student = await studentModel_1.default.findById(studentID);
        if (!student) {
            return res.status(404).json({
                message: "Student Does Not Exist",
                status: 404,
            });
        }
        const updatedFields = {};
        if (studentFirstName)
            updatedFields.studentFirstName = studentFirstName;
        if (studentLastName)
            updatedFields.studentLastName = studentLastName;
        const updatedFirstName = studentFirstName || student.studentFirstName;
        const updatedLastName = studentLastName || student.studentLastName;
        const email = `${updatedFirstName
            .replace(/ /gi, "")
            .toLowerCase()}${updatedLastName
            .replace(/ /gi, "")
            .toLowerCase()}@${school.schoolName
            .replace(/ /gi, "")
            .toLowerCase()}.com`;
        updatedFields.email = email;
        const updatedStudent = await studentModel_1.default.findByIdAndUpdate(student._id, updatedFields, { new: true });
        return res.status(201).json({
            message: "Student Information Updated Successfully",
            data: updatedStudent,
            status: 201,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error Updating Student Information",
            error: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
        });
    }
};
exports.updateStudentFirstName = updateStudentFirstName;
const updateStudentLastName = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { studentLastName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (!school) {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
        const student = await studentModel_1.default.findById(studentID);
        if (!student) {
            return res.status(404).json({
                message: "Student Does Not Exist",
                status: 404,
            });
        }
        const updatedFirstName = student.studentFirstName;
        const updatedLastName = studentLastName || student.studentLastName;
        const email = `${updatedFirstName
            .replace(/ /gi, "")
            .toLowerCase()}${updatedLastName
            .replace(/ /gi, "")
            .toLowerCase()}@${school.schoolName
            .replace(/ /gi, "")
            .toLowerCase()}.com`;
        const studentUpdateLastName = await studentModel_1.default.findByIdAndUpdate(student._id, {
            studentLastName: updatedLastName,
            email: email,
        }, { new: true });
        return res.status(201).json({
            message: "Student LastName Updated Successfully",
            data: studentUpdateLastName,
            status: 201,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error Updating Student Last Name",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateStudentLastName = updateStudentLastName;
const updateStudentAddress = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { studentAddress } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateAddress = await studentModel_1.default.findByIdAndUpdate(student._id, { studentAddress: studentAddress }, { new: true });
                return res.status(201).json({
                    message: "Student Address Updated Successfully",
                    data: updateAddress,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Address",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateStudentAddress = updateStudentAddress;
const updateStudentGender = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { gender } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateGender = await studentModel_1.default.findByIdAndUpdate(student._id, { gender: gender }, { new: true });
                return res.status(201).json({
                    message: "Student Gender Updated Succed=sfully",
                    data: updateGender,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Gender",
            data: {
                errorMessage: error.message,
                errorTypes: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentGender = updateStudentGender;
const updateStudentPhone = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { phone } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updatePhone = await studentModel_1.default.findByIdAndUpdate(student._id, { phone: phone }, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Successfully",
                    data: updatePhone,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentPhone = updateStudentPhone;
const updateStudentViewReportCard = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { toggle } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const studentData = await studentModel_1.default.findByIdAndUpdate(student._id, { viewReportCard: toggle }, { new: true });
                console.log(toggle);
                return res.status(201).json({
                    message: "Student can now view Report card",
                    data: studentData,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentViewReportCard = updateStudentViewReportCard;
const updateStudentInfo = async (req, res) => {
    try {
        const { studentID } = req.params;
        if (true) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updatePhone = await studentModel_1.default.findByIdAndUpdate(student._id, req.body, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Successfully",
                    data: updatePhone,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentInfo = updateStudentInfo;
const updateMainStudentBulkInfo = async (req, res) => {
    try {
        const { studentID } = req.params;
        if (true) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updatePhone = await studentModel_1.default.findByIdAndUpdate(student._id, req.body, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Successfully",
                    data: updatePhone,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateMainStudentBulkInfo = updateMainStudentBulkInfo;
const updateStudentBulkInfo = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { phone, studentFirstName, parentPhoneNumber, parentEmail, studentLastName, studentAddress, } = req.body;
        if (true) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updatePhone = await studentModel_1.default.findByIdAndUpdate(student._id, {
                    phone,
                    studentFirstName,
                    parentPhoneNumber,
                    parentEmail,
                    studentLastName,
                    studentAddress,
                }, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Successfully",
                    data: updatePhone,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentBulkInfo = updateStudentBulkInfo;
const updateStudentParentNumber = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { parentPhoneNumber } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateParentNumber = await studentModel_1.default.findByIdAndUpdate(student._id, { parentPhoneNumber: parentPhoneNumber }, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Succesfully",
                    data: updateParentNumber,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Parents Phone Number",
            data: {
                errorMessage: error.message,
                messageType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentParentNumber = updateStudentParentNumber;
const updateStudent1stFees = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const getStudent = await studentModel_1.default.findById(studentID);
        const presentClass = await classroomModel_1.default.findById(getStudent?.presentClassID);
        const findTerm = await termModel_1.default.findById(school?.presentTermID);
        if (school?.status === "school-admin" && school) {
            const students = await studentModel_1.default.findByIdAndUpdate(studentID, { feesPaid1st: !getStudent?.feesPaid1st }, { new: true });
            (0, email_1.verifySchoolFees)(students, 1);
            await termModel_1.default?.findByIdAndUpdate(findTerm?._id, {
                schoolFeePayment: [
                    ...findTerm?.schoolFeePayment,
                    {
                        studentID: getStudent._id,
                        feesPaid1st: getStudent.feesPaid1st,
                        cost: presentClass?.class1stFee,
                        date: (0, moment_1.default)(new Date().getTime()).format("llll"),
                    },
                ],
            }, { new: true });
            return res.status(201).json({
                message: "student fees updated successfully",
                data: students,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "student 1st fees not found",
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
exports.updateStudent1stFees = updateStudent1stFees;
//Student Updates settings ends here
//Student/Parent Socials
const updateStudentFacebookAcct = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { facebookAccount } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateStudentFacebook = await studentModel_1.default.findByIdAndUpdate(student._id, { facebookAccount: facebookAccount }, { new: true });
                return res.status(201).json({
                    message: "Student Facebook Account Updated Successfuly",
                    data: updateStudentFacebook,
                    status: 404,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Facebook Account",
            data: {
                errorMessage: error.message,
                messageType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentFacebookAcct = updateStudentFacebookAcct;
const updateInstagramAccout = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { instagramAccount } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateStudentInstagram = await studentModel_1.default.findByIdAndUpdate(student._id, { instagramAccount: instagramAccount }, { new: true });
                return res.status(201).json({
                    message: "IG Account Updated Successfully",
                    data: updateStudentInstagram,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating IG Account",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateInstagramAccout = updateInstagramAccout;
const updateXAcctount = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { xAccount } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateXhandle = await studentModel_1.default.findByIdAndUpdate(student._id, { xAccount: xAccount }, { new: true });
                return res.status(201).json({
                    message: "X Account Updated Succsfully",
                    data: updateXhandle,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating X Account",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateXAcctount = updateXAcctount;
const updateStudentLinkedinAccount = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { linkedinAccount } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateLinkedinAccount = await studentModel_1.default.findByIdAndUpdate(student._id, { linkedinAccount: linkedinAccount }, { new: true });
                return res.status(201).json({
                    message: "Linkedin Account Updated Successfully",
                    data: updateLinkedinAccount,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Linkedin Account",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateStudentLinkedinAccount = updateStudentLinkedinAccount;
//Student/Parent Socials Ends Here
const updateStudent2ndFees = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const getStudent = await studentModel_1.default.findById(studentID);
        const presentClass = await classroomModel_1.default.findById(getStudent?.presentClassID);
        const findTerm = await termModel_1.default.findById(school?.presentTermID);
        if (school?.status === "school-admin" && school) {
            let students = await studentModel_1.default.findById(studentID);
            if (students?.feesPaid1st === true) {
                let student = await studentModel_1.default.findByIdAndUpdate(students?._id, { feesPaid2nd: !students?.feesPaid2nd }, { new: true });
                (0, email_1.verifySchoolFees)(student, 2);
                await termModel_1.default?.findByIdAndUpdate(findTerm?._id, {
                    schoolFeePayment: [
                        ...findTerm?.schoolFeePayment,
                        {
                            studentID: getStudent._id,
                            feesPaid2nd: getStudent.feesPaid2nd,
                            cost: presentClass?.class2ndFee,
                            date: (0, moment_1.default)(new Date().getTime()).format("llll"),
                        },
                    ],
                }, { new: true });
                return res.status(201).json({
                    message: "student fees updated successfully",
                    data: student,
                    status: 200,
                });
            }
            else {
                return res.status(404).json({
                    message: "student 3rd fees not found",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School not found",
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
exports.updateStudent2ndFees = updateStudent2ndFees;
const updateStudent3rdFees = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const getStudent = await studentModel_1.default.findById(studentID);
        const presentClass = await classroomModel_1.default.findById(getStudent?.presentClassID);
        const findTerm = await termModel_1.default.findById(school?.presentTermID);
        if (school?.status === "school-admin" && school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student?.feesPaid2nd === true) {
                await studentModel_1.default.findByIdAndUpdate(studentID, { feesPaid3rd: !student?.feesPaid3rd }, { new: true });
                (0, email_1.verifySchoolFees)(student, 3);
                await termModel_1.default?.findByIdAndUpdate(findTerm?._id, {
                    schoolFeePayment: [
                        ...findTerm?.schoolFeePayment,
                        {
                            studentID: getStudent._id,
                            feesPaid3rd: getStudent.feesPaid3rd,
                            cost: presentClass?.class3rdFee,
                            date: (0, moment_1.default)(new Date().getTime()).format("llll"),
                        },
                    ],
                }, { new: true });
                return res.status(201).json({
                    message: "student fees updated successfully",
                    data: student,
                    status: 200,
                });
            }
            else {
                return res.status(404).json({
                    message: "student 2nd fees not found",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School not found",
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
exports.updateStudent3rdFees = updateStudent3rdFees;
const updatePurchaseRecord = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { purchased } = req.body;
        const student = await studentModel_1.default.findById(studentID);
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        if (school?.status === "school-admin" && school) {
            await studentModel_1.default.findById(studentID, {
                purchaseHistory: student?.purchaseHistory?.push(purchased),
            }, { new: true });
            return res.status(201).json({
                message: "student purchase recorded successfully",
                data: student,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "School not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating students purchase",
            status: 404,
        });
    }
};
exports.updatePurchaseRecord = updatePurchaseRecord;
const createStorePurchased = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { date, amount, cart, reference, purchasedID, delievered } = req.body;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "purchaseHistory",
        });
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        const term = await termModel_1.default?.findById(school?.presentTermID);
        if (school) {
            const check = student?.purchaseHistory.some((el) => {
                return el.reference === reference;
            });
            if (!check) {
                const store = await historyModel_1.default.create({
                    date,
                    amount,
                    cart,
                    reference,
                    purchasedID,
                    delievered: false,
                    studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                    studentClass: student?.classAssigned,
                });
                await termModel_1.default.findByIdAndUpdate(term?._id, {
                    storePayment: [
                        ...term?.storePayment,
                        {
                            date,
                            amount,
                            cart,
                            reference,
                            purchasedID,
                            studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                            studentClass: student?.classAssigned,
                        },
                    ],
                }, { new: true });
                student?.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                student?.save();
                school?.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                school?.save();
                return res.status(201).json({
                    message: "remark created successfully",
                    data: store,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Has already entered it",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.createStorePurchased = createStorePurchased;
const viewStorePurchased = async (req, res) => {
    try {
        const { studentID } = req.params;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "purchaseHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.purchaseHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewStorePurchased = viewStorePurchased;
const viewSchoolStorePurchased = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const student = await schoolModel_1.default.findById(schoolID).populate({
            path: "purchaseHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.purchaseHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewSchoolStorePurchased = viewSchoolStorePurchased;
const updateSchoolStorePurchased = async (req, res) => {
    try {
        const { purchaseID } = req.params;
        const { delievered } = req.body;
        const item = await historyModel_1.default.findByIdAndUpdate(purchaseID, {
            delievered,
        }, { new: true });
        return res.status(201).json({
            message: `item delieved successfully`,
            data: item,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating school's store item",
            data: error.message,
        });
    }
};
exports.updateSchoolStorePurchased = updateSchoolStorePurchased;
const createStorePurchasedTeacher = async (req, res) => {
    try {
        const { staffID } = req.params;
        const { date, amount, cart, reference, purchasedID } = req.body;
        const student = await staffModel_1.default.findById(staffID).populate({
            path: "purchaseHistory",
        });
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        if (school) {
            const check = student?.purchaseHistory.some((el) => {
                return el.reference === reference;
            });
            if (!check) {
                const store = await historyModel_1.default.create({
                    date,
                    amount,
                    cart,
                    reference,
                    purchasedID,
                    delievered: false,
                    studentName: student?.staffName,
                    studentClass: student?.classesAssigned,
                });
                student?.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                student?.save();
                school?.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                school?.save();
                return res.status(201).json({
                    message: "remark created successfully",
                    data: store,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Has already entered it",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.createStorePurchasedTeacher = createStorePurchasedTeacher;
const viewStorePurchasedTeacher = async (req, res) => {
    try {
        const { staffID } = req.params;
        const student = await staffModel_1.default.findById(staffID).populate({
            path: "purchaseHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.purchaseHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewStorePurchasedTeacher = viewStorePurchasedTeacher;
const createSchoolFeePayment = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { date, amount, purchasedID, reference } = req.body;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "schoolFeesHistory",
        });
        const classOne = await classroomModel_1.default.findById(student?.presentClassID);
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        if (school) {
            const check = student?.schoolFeesHistory.some((el) => {
                return el.reference === reference;
            });
            const payment = student?.schoolFeesHistory.some((el) => {
                return (el.sessionID === school?.presentSessionID &&
                    el.session === school?.presentSession &&
                    el.termID === school?.presentTermID &&
                    el.term === school?.presentTerm);
            });
            if (!payment) {
                const store = await schoolFeeHistory_1.default.create({
                    studentID,
                    session: school?.presentSession,
                    sessionID: school?.presentSessionID,
                    termID: school?.presentTermID,
                    confirm: false,
                    term: classOne?.presentTerm,
                    studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                    studentClass: student?.classAssigned,
                    image: student?.avatar,
                    date,
                    amount: amount,
                    purchasedID,
                    reference,
                });
                student?.schoolFeesHistory.push(new mongoose_1.Types.ObjectId(store._id));
                student?.save();
                school?.schoolFeesHistory.push(new mongoose_1.Types.ObjectId(store._id));
                school?.save();
                if (classOne?.presentTerm === "1st Term") {
                    classOne?.schoolFeesHistory.push(new mongoose_1.Types.ObjectId(store._id));
                    classOne?.save();
                }
                else if (classOne?.presentTerm === "2nd Term") {
                    classOne?.schoolFeesHistory2.push(new mongoose_1.Types.ObjectId(store._id));
                    classOne?.save();
                }
                else if (classOne?.presentTerm === "3rd Term") {
                    classOne?.schoolFeesHistory3.push(new mongoose_1.Types.ObjectId(store._id));
                    classOne?.save();
                }
                if (classOne?.presentTerm === "1st Term") {
                    const classData = await classroomModel_1.default
                        .findById(student?.presentClassID)
                        .populate({
                        path: "schoolFeesHistory",
                    });
                    const amount = classData?.schoolFeesHistory
                        ?.filter((el) => {
                        return (el.sessionID === school?.presentSessionID &&
                            el.termID === school?.presentTermID &&
                            el.term === "1st Term");
                    })
                        .map((el) => {
                        return el.amount;
                    })
                        .reduce((a, b) => {
                        return a + b;
                    }, 0);
                    const real = await classroomModel_1.default.findByIdAndUpdate(classData?._id, {
                        class1stFee: amount,
                    }, { new: true });
                }
                else if (classOne?.presentTerm === "2nd Term") {
                    const classData = await classroomModel_1.default
                        .findById(student?.presentClassID)
                        .populate({
                        path: "schoolFeesHistory2",
                    });
                    const amount = classData?.schoolFeesHistory
                        ?.filter((el) => {
                        return (el.sessionID === school?.presentSessionID &&
                            el.termID === school?.presentTermID &&
                            el.term === "2nd Term");
                    })
                        .map((el) => {
                        return el.amount;
                    })
                        .reduce((a, b) => {
                        return a + b;
                    }, 0);
                    classroomModel_1.default.findByIdAndUpdate(classData?._id, {
                        class2ndFee: amount,
                    }, { new: true });
                }
                else if (classOne?.presentTerm === "3rd Term") {
                    const classData = await classroomModel_1.default
                        .findById(student?.presentClassID)
                        .populate({
                        path: "schoolFeesHistory3",
                    });
                    const amount = classData?.schoolFeesHistory
                        ?.filter((el) => {
                        return (el.sessionID === school?.presentSessionID &&
                            el.termID === school?.presentTermID &&
                            el.term === "3rd Term");
                    })
                        .map((el) => {
                        return el.amount;
                    })
                        .reduce((a, b) => {
                        return a + b;
                    }, 0);
                    classroomModel_1.default.findByIdAndUpdate(classData?._id, {
                        class3rdFee: amount,
                    }, { new: true });
                }
                return res.status(201).json({
                    message: "schoolfee paid successfully",
                    data: store,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Has already entered it",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error paying school's fee",
            data: error.message,
        });
    }
};
exports.createSchoolFeePayment = createSchoolFeePayment;
const viewSchoolFeeRecord = async (req, res) => {
    try {
        const { studentID } = req.params;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "schoolFeesHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.schoolFeesHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewSchoolFeeRecord = viewSchoolFeeRecord;
const viewSchoolSchoolFeeRecord = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const student = await schoolModel_1.default.findById(schoolID).populate({
            path: "schoolFeesHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.schoolFeesHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewSchoolSchoolFeeRecord = viewSchoolSchoolFeeRecord;
const updateSchoolSchoolFee = async (req, res) => {
    try {
        const { schoolFeeID } = req.params;
        const { confirm } = req.body;
        const item = await schoolFeeHistory_1.default.findByIdAndUpdate(schoolFeeID, {
            confirm,
        }, { new: true });
        let studentRecord = await studentModel_1.default.findById(item.studentID);
        let studetClass = await classroomModel_1.default.findById(studentRecord?.presentClassID);
        const school = await schoolModel_1.default.findById(studentRecord?.schoolIDs);
        const term = await termModel_1.default.findById(school?.presentTermID);
        if (studetClass?.presentTerm === "1st Term") {
            await studentModel_1.default.findByIdAndUpdate(item?.studentID, {
                feesPaid1st: true,
            }, { new: true });
        }
        else if (studetClass?.presentTerm === "2nd Term") {
            await studentModel_1.default.findByIdAndUpdate(item?.studentID, {
                feesPaid2nd: true,
            }, { new: true });
        }
        else if (studetClass?.presentTerm === "3rd Term") {
            await studentModel_1.default.findByIdAndUpdate(item?.studentID, {
                feesPaid3rd: true,
            }, { new: true });
        }
        const check = term?.schoolFeePayment.some((el) => el?.purchasedID !== item?.purchasedID);
        if (true) {
            let x = await termModel_1.default.findByIdAndUpdate(item?.termID, {
                schoolFeePayment: [...term?.schoolFeePayment, item],
            }, { new: true });
            console.log("loading: ", x);
            return res.status(201).json({
                message: `schoolfee confirm successfully`,
                data: item,
                status: 201,
            });
        }
        else {
            return res.status(201).json({
                message: `schoolfee confirm successfully`,
                data: item,
                status: 201,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating school's school fee",
            data: error.message,
        });
    }
};
exports.updateSchoolSchoolFee = updateSchoolSchoolFee;
const assignClassMonitor = async (req, res) => {
    try {
        const { teacherID, studentID } = req.params;
        const teacher = await staffModel_1.default.findById(teacherID);
        const getClass = await classroomModel_1.default
            .findById(teacher?.presentClassID)
            .populate({
            path: "students",
        });
        let readStudent = getClass?.students?.find((el) => {
            return el?.monitor === true;
        });
        await studentModel_1.default.findByIdAndUpdate(readStudent?._id, {
            monitor: false,
        }, { new: true });
        const student = await studentModel_1.default.findByIdAndUpdate(studentID, {
            monitor: true,
        }, { new: true });
        return res.status(201).json({
            message: `class monitor assigned to ${student?.studentFirstName} `,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating class's monitor",
            data: error.message,
        });
    }
};
exports.assignClassMonitor = assignClassMonitor;
const changeStudentClass = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { classID } = req.body;
        const getClass = await classroomModel_1.default.findById(classID).populate({
            path: "students",
        });
        const studentData = await studentModel_1.default.findById(studentID);
        const getStudentClass = await classroomModel_1.default.findById(studentData?.presentClassID);
        getStudentClass?.students?.pull(new mongoose_1.Types.ObjectId(studentID));
        getStudentClass?.save();
        const student = await studentModel_1.default.findByIdAndUpdate(studentID, {
            classAssigned: getClass?.className,
            presentClassID: getClass?._id,
            classTermFee: getClass?.presentTerm === "1st Term"
                ? getClass?.class1stFee
                : getClass?.presentTerm === "2nd Term"
                    ? getClass?.class2ndFee
                    : getClass?.presentTerm === "3rd Term"
                        ? getClass?.class3rdFee
                        : null,
        }, { new: true });
        getClass?.students?.push(new mongoose_1.Types.ObjectId(student?._id));
        getClass?.save();
        return res.status(201).json({
            message: `class monitor assigned to ${student?.studentFirstName} `,
            data: student,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating class's monitor",
            data: error.message,
        });
    }
};
exports.changeStudentClass = changeStudentClass;
const deleteStudent = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            // First get the student to get their class info before deletion
            const student = await studentModel_1.default.findById(studentID);
            if (!student) {
                return res.status(404).json({
                    message: "Student not found",
                    status: 404,
                });
            }
            // Find and update the student's current classroom
            if (student.presentClassID) {
                await classroomModel_1.default.findByIdAndUpdate(student.presentClassID, {
                    $pull: { students: new mongoose_1.Types.ObjectId(studentID) },
                }, { new: true });
            }
            // Remove student from school's students array
            await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                $pull: { students: new mongoose_1.Types.ObjectId(studentID) },
            }, { new: true });
            // Finally delete the student
            await studentModel_1.default.findByIdAndDelete(studentID);
            return res.status(200).json({
                message: "Successfully deleted student and removed all references",
                status: 200,
                data: student,
            });
        }
        else {
            return res.status(404).json({
                message: "School not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error deleting student",
            status: 404,
            data: error.message,
        });
    }
};
exports.deleteStudent = deleteStudent;
// Delete ALL students in one click endpoint
const deleteAllStudents = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const allStudentIDs = school?.students;
            for (const studentID of allStudentIDs) {
                const student = await studentModel_1.default.findByIdAndDelete(studentID);
                if (student) {
                    await classroomModel_1.default.updateMany({ students: studentID }, { $pull: { students: studentID } });
                }
            }
            school.students = [];
            await school.save();
            return res.status(200).json({
                message: "Successfully deleted all students",
                data: allStudentIDs,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Deleting All Students",
            status: 404,
            error: error.message,
        });
    }
};
exports.deleteAllStudents = deleteAllStudents;
