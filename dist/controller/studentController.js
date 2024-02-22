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
exports.updateStudentAvatar = exports.logoutStudent = exports.readStudentCookie = exports.loginStudent = exports.readStudentDetail = exports.readSchoolStudents = exports.createSchoolStudent = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const streamifier_1 = require("../utils/streamifier");
const createSchoolStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { schoolID } = req.params;
        const { studentLastName, gender, studentFirstName, studentAddress, classAssigned, } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "classRooms",
        });
        const enrollmentID = crypto_1.default.randomBytes(3).toString("hex");
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashed = yield bcrypt_1.default.hash(`${studentFirstName.replace(/ /gi, "").toLowerCase()}${studentLastName
            .replace(/ /gi, "")
            .toLowerCase()}`, salt);
        const findClass = (_a = school === null || school === void 0 ? void 0 : school.classRooms) === null || _a === void 0 ? void 0 : _a.find((el) => {
            return el.className === classAssigned;
        });
        if (school && school.schoolName && school.status === "school-admin") {
            if (findClass) {
                const student = yield studentModel_1.default.create({
                    schoolIDs: schoolID,
                    gender,
                    enrollmentID,
                    schoolID: school === null || school === void 0 ? void 0 : school.enrollmentID,
                    studentFirstName,
                    studentLastName,
                    schoolName: school === null || school === void 0 ? void 0 : school.schoolName,
                    studentAddress,
                    classAssigned,
                    email: `${studentFirstName
                        .replace(/ /gi, "")
                        .toLowerCase()}${studentLastName
                        .replace(/ /gi, "")
                        .toLowerCase()}@${(_b = school === null || school === void 0 ? void 0 : school.schoolName) === null || _b === void 0 ? void 0 : _b.replace(/ /gi, "").toLowerCase()}.com`,
                    password: hashed,
                    status: "school-student",
                });
                school === null || school === void 0 ? void 0 : school.students.push(new mongoose_1.Types.ObjectId(student._id));
                school.save();
                findClass === null || findClass === void 0 ? void 0 : findClass.students.push(new mongoose_1.Types.ObjectId(student._id));
                findClass.save();
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
});
exports.createSchoolStudent = createSchoolStudent;
const readSchoolStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const students = yield schoolModel_1.default.findById(schoolID).populate({
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
});
exports.readSchoolStudents = readSchoolStudents;
const readStudentDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const students = yield studentModel_1.default.findById(studentID);
        return res.status(201).json({
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
});
exports.readStudentDetail = readStudentDetail;
const loginStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const getTeacher = yield studentModel_1.default.findOne({ email });
        const school = yield schoolModel_1.default.findOne({
            schoolName: getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.schoolName,
        });
        if ((school === null || school === void 0 ? void 0 : school.schoolName) && (getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.schoolName)) {
            if (school.verify) {
                const token = jsonwebtoken_1.default.sign({ status: school.status }, "student", {
                    expiresIn: "1d",
                });
                const pass = yield bcrypt_1.default.compare(password, getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.password);
                if (pass) {
                    req.session.isAuth = true;
                    req.session.isSchoolID = getTeacher._id;
                    return res.status(201).json({
                        message: "welcome back",
                        user: getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.status,
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
        return res.status(201).json({
            message: "creating school",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error logging you in",
        });
    }
});
exports.loginStudent = loginStudent;
const readStudentCookie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.readStudentCookie = readStudentCookie;
const logoutStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.logoutStudent = logoutStudent;
const updateStudentAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studntID } = req.params;
        const school = yield studentModel_1.default.findById(studntID);
        if (school) {
            const { secure_url, public_id } = yield (0, streamifier_1.streamUpload)(req);
            const updatedStudent = yield studentModel_1.default.findByIdAndUpdate(studntID, {
                avatar: secure_url,
                avatarID: public_id,
            }, { new: true });
            return res.status(200).json({
                message: "student avatar has been, added",
                data: updatedStudent,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating user",
        });
    }
});
exports.updateStudentAvatar = updateStudentAvatar;
