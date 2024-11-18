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
exports.deleteStaff = exports.updateStaffActiveness = exports.updateStaffAvatar = exports.logoutTeacher = exports.updateTeacherSalary = exports.readTeacherDetail = exports.readSchooTeacher = exports.updateStaffLinkedinAcct = exports.updateStaffInstagramAcct = exports.updateStaffXAcct = exports.updateFacebookAccount = exports.updateStaffAdress = exports.updateStaffGender = exports.updatePhoneNumber = exports.updateStaffName = exports.createSchoolTeacher = exports.createSchoolTeacherByAdmin = exports.createSchoolTeacherByVicePrincipal = exports.createSchoolTeacherByPrincipal = exports.createSchoolVicePrincipal = exports.createSchoolPrincipal = exports.readTeacherCookie = exports.loginStaffWithToken = exports.loginTeacher = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const mongoose_1 = require("mongoose");
const enums_1 = require("../utils/enums");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const streamifier_1 = require("../utils/streamifier");
const studentModel_1 = __importDefault(require("../model/studentModel"));
const cron_1 = require("cron");
const loginTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const getTeacher = yield staffModel_1.default.findOne({ email });
        const school = yield schoolModel_1.default.findOne({
            schoolName: getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.schoolName,
        });
        if ((school === null || school === void 0 ? void 0 : school.schoolName) && (getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.schoolName)) {
            if (school.verify) {
                const token = jsonwebtoken_1.default.sign({ status: school.status }, "teacher", {
                    expiresIn: "1d",
                });
                const passed = yield bcrypt_1.default.compare(password, getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.password);
                if (passed) {
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
                        message: "Password error",
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
            message: "Error creating school",
        });
    }
});
exports.loginTeacher = loginTeacher;
const loginStaffWithToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        const getTeacher = yield staffModel_1.default.findOne({
            enrollmentID: token,
        });
        const school = yield schoolModel_1.default.findOne({
            schoolName: getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.schoolName,
        });
        if ((school === null || school === void 0 ? void 0 : school.schoolName) && (getTeacher === null || getTeacher === void 0 ? void 0 : getTeacher.schoolName)) {
            if (school.verify) {
                const token = jsonwebtoken_1.default.sign({ status: school.status }, "student", {
                    expiresIn: "1d",
                });
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
exports.loginStaffWithToken = loginStaffWithToken;
const readTeacherCookie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            message: "Error verifying school",
        });
    }
});
exports.readTeacherCookie = readTeacherCookie;
const createSchoolPrincipal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { schoolID } = req.params;
        const { staffName, staffAddress, assignedSubject } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "subjects",
        });
        const enrollmentID = crypto_1.default.randomBytes(3).toString("hex");
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashed = yield bcrypt_1.default.hash(`${staffName.replace(/ /gi, "")}`, salt);
        if (school && school.schoolName && school.status === "school-admin") {
            const staff = yield staffModel_1.default.create({
                staffName,
                schoolName: school.schoolName,
                staffRole: enums_1.staffDuty.PRINCIPAL,
                status: "school-teacher",
                email: `${staffName
                    .replace(/ /gi, "")
                    .toLowerCase()}@${(_a = school === null || school === void 0 ? void 0 : school.schoolName) === null || _a === void 0 ? void 0 : _a.replace(/ /gi, "").toLowerCase()}.com`,
                enrollmentID,
                password: hashed,
                staffAddress,
                assignedSubject,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(staff._id));
            school.save();
            return res.status(201).json({
                message: "principal created successfully",
                data: staff,
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
exports.createSchoolPrincipal = createSchoolPrincipal;
const createSchoolVicePrincipal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { staffName } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const staff = yield staffModel_1.default.create({
                staffName,
                schoolName: school.schoolName,
                staffRole: enums_1.staffDuty.VICE_PRINCIPAL,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(staff._id));
            school.save();
            return res.status(201).json({
                message: "principal created successfully",
                data: staff,
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
exports.createSchoolVicePrincipal = createSchoolVicePrincipal;
const createSchoolTeacherByPrincipal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffID } = req.params;
        const { staffName } = req.body;
        const staff = yield staffModel_1.default.findById(staffID);
        const school = yield schoolModel_1.default.findOne({ schoolName: staff === null || staff === void 0 ? void 0 : staff.schoolName });
        if (staff && staff.schoolName && staff.staffRole === "principal") {
            const newStaff = yield staffModel_1.default.create({
                staffName,
                staffRole: enums_1.staffDuty.TEACHER,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(newStaff._id));
            school.save();
            return res.status(201).json({
                message: "teacher created successfully",
                data: newStaff,
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
exports.createSchoolTeacherByPrincipal = createSchoolTeacherByPrincipal;
const createSchoolTeacherByVicePrincipal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffID } = req.params;
        const { staffName } = req.body;
        const staff = yield staffModel_1.default.findById(staffID);
        const school = yield schoolModel_1.default.findOne({ schoolName: staff === null || staff === void 0 ? void 0 : staff.schoolName });
        if (staff && staff.schoolName && staff.staffRole === "vice principal") {
            const newStaff = yield staffModel_1.default.create({
                staffName,
                staffRole: enums_1.staffDuty.TEACHER,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(newStaff._id));
            school.save();
            return res.status(201).json({
                message: "teacher created successfully",
                data: newStaff,
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
exports.createSchoolTeacherByVicePrincipal = createSchoolTeacherByVicePrincipal;
const createSchoolTeacherByAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { staffName } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const staff = yield staffModel_1.default.create({
                staffName,
                schoolName: school.schoolName,
                staffRole: enums_1.staffDuty.TEACHER,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(staff._id));
            school.save();
            return res.status(201).json({
                message: "teacher created successfully",
                data: staff,
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
exports.createSchoolTeacherByAdmin = createSchoolTeacherByAdmin;
const createSchoolTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { schoolID } = req.params;
        const { staffName, gender, salary, staffAddress, role, subjectTitle } = req.body;
        const enrollmentID = crypto_1.default.randomBytes(3).toString("hex");
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashed = yield bcrypt_1.default.hash(`${staffName.replace(/ /gi, "")}`, salt);
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "subjects",
        });
        const getSubject = school === null || school === void 0 ? void 0 : school.subjects.find((el) => {
            return el.subjectTitle === subjectTitle;
        });
        if (school && school.schoolName && school.status === "school-admin") {
            // if (getSubject) {
            const staff = yield staffModel_1.default.create({
                schoolIDs: schoolID,
                staffName,
                schoolName: school.schoolName,
                staffRole: enums_1.staffDuty.TEACHER,
                // subjectAssigned: [{ title: subjectTitle, id: getSubject._id }],
                role,
                status: "school-teacher",
                salary,
                gender,
                email: `${staffName
                    .replace(/ /gi, "")
                    .toLowerCase()}@${(_b = school === null || school === void 0 ? void 0 : school.schoolName) === null || _b === void 0 ? void 0 : _b.replace(/ /gi, "").toLowerCase()}.com`,
                enrollmentID,
                password: hashed,
                staffAddress,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(staff._id));
            school.save();
            return res.status(201).json({
                message: "teacher created successfully",
                data: staff,
                status: 201,
            });
            // }
            // else {
            //   return res.status(404).json({
            //     message:
            //       "A teacher must have a subject to handle and Subject hasn't been created",
            //     status: 404,
            //   });
            // }
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
            message: "Error creating teacher",
        });
    }
});
exports.createSchoolTeacher = createSchoolTeacher;
const updateStaffName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { staffName } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = yield staffModel_1.default.findById(staffID);
            if (staff) {
                const updatedStaffName = yield staffModel_1.default.findByIdAndUpdate(staff._id, {
                    staffName: staffName,
                    email: `${staffName
                        .replace(/ /gi, "")
                        .toLowerCase()}@${(_c = school === null || school === void 0 ? void 0 : school.schoolName) === null || _c === void 0 ? void 0 : _c.replace(/ /gi, "").toLowerCase()}.com`,
                }, { new: true });
                return res.status(201).json({
                    message: "Staff Name Updated Successfully",
                    data: updatedStaffName,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating Staff Name",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
            status: 404,
        });
    }
});
exports.updateStaffName = updateStaffName;
const updatePhoneNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { phone } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = yield staffModel_1.default.findById(staffID);
            if (staff) {
                const updatedPhoneNumber = yield staffModel_1.default.findByIdAndUpdate(staff._id, {
                    phone: phone,
                }, { new: true });
                return res.status(201).json({
                    message: "Staff Phone Number Updated Successfully",
                    data: updatedPhoneNumber,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating Staff Phone Number",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
            status: 404,
        });
    }
});
exports.updatePhoneNumber = updatePhoneNumber;
const updateStaffGender = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { gender } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = yield staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffGender = yield staffModel_1.default.findByIdAndUpdate(staff._id, {
                    gender: gender,
                }, { new: true });
                return res.status(201).json({
                    message: "Staff Gender Updated Successfully",
                    data: updateStaffGender,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    mesaage: "Staff Does Not Exist",
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
            message: "Error Updating Staff Gender",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
            status: 404,
        });
    }
});
exports.updateStaffGender = updateStaffGender;
const updateStaffAdress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { staffAddress } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = yield staffModel_1.default.findByIdAndUpdate(staffID);
            if (staff) {
                const updateStaffDetails = yield staffModel_1.default.findByIdAndUpdate(staff._id, { staffAddress: staffAddress }, { new: true });
                return res.status(201).json({
                    message: "StaffAddress Updated Successfully",
                    data: updateStaffDetails,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating StaffAddress",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
});
exports.updateStaffAdress = updateStaffAdress;
//Update Socials
const updateFacebookAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { facebookAcct } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = yield staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffFacebookAcct = yield staffModel_1.default.findByIdAndUpdate(staff._id, { facebookAcct: facebookAcct }, { new: true });
                return res.status(201).json({
                    message: "Staff Facebook Account Updated Successfully",
                    data: updateStaffFacebookAcct,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating Facebook Social",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
});
exports.updateFacebookAccount = updateFacebookAccount;
const updateStaffXAcct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { xAcct } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = yield staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffXAcct = yield staffModel_1.default.findByIdAndUpdate(staff._id, { xAcct: xAcct }, { new: true });
                return res.status(201).json({
                    message: "Staff X Acctount Updated Succesfully",
                    data: updateStaffXAcct,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff DOes Not Exist",
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
            message: "Error Updating Staff X account",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
});
exports.updateStaffXAcct = updateStaffXAcct;
const updateStaffInstagramAcct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { instagramAcct } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = yield staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffInstagramAcct = yield staffModel_1.default.findByIdAndUpdate(staff._id, { instagramAcct: instagramAcct }, { new: true });
                return res.status(201).json({
                    message: "Staff IG Acct Updated Succesfully",
                    data: updateStaffInstagramAcct,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "No Staff Found",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "No School Found",
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
            status: 404,
        });
    }
});
exports.updateStaffInstagramAcct = updateStaffInstagramAcct;
const updateStaffLinkedinAcct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { linkedinAcct } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = yield staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffLinkedinAcct = yield staffModel_1.default.findByIdAndUpdate(staff._id, { linkedinAcct: linkedinAcct }, { new: true });
                return res.status(210).json({
                    message: "Staff Linkedin Updated Successfully",
                    data: updateStaffLinkedinAcct,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating LinkedinAcct",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
});
exports.updateStaffLinkedinAcct = updateStaffLinkedinAcct;
//Update Socials Ends Here
const readSchooTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const students = yield schoolModel_1.default.findById(schoolID).populate({
            path: "staff",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "staff read successfully",
            data: students,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school staff",
            status: 404,
        });
    }
});
exports.readSchooTeacher = readSchooTeacher;
const readTeacherDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffID } = req.params;
        const staff = yield staffModel_1.default.findById(staffID);
        return res.status(200).json({
            message: "satff read successfully",
            data: staff,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Reading Teachers Details",
            status: 404,
        });
    }
});
exports.readTeacherDetail = readTeacherDetail;
const updateTeacherSalary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffID } = req.params;
        const { salary } = req.body;
        const staff = yield staffModel_1.default.findByIdAndUpdate(staffID, {
            salary,
        }, { new: true });
        return res.status(201).json({
            message: "satff read successfully",
            data: staff,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school staff",
            status: 404,
        });
    }
});
exports.updateTeacherSalary = updateTeacherSalary;
const logoutTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.logoutTeacher = logoutTeacher;
const updateStaffAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffID } = req.params;
        const school = yield staffModel_1.default.findById(staffID);
        if (school) {
            const { secure_url, public_id } = yield (0, streamifier_1.streamUpload)(req);
            const updatedSchool = yield staffModel_1.default.findByIdAndUpdate(staffID, {
                avatar: secure_url,
                avatarID: public_id,
            }, { new: true });
            return res.status(200).json({
                message: "staff avatar has been, added",
                data: updatedSchool,
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
exports.updateStaffAvatar = updateStaffAvatar;
const updateStaffActiveness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const { teacherName } = req.body;
        const student = yield studentModel_1.default.findById(studentID);
        const teacher = yield staffModel_1.default.findOne({ staffName: teacherName });
        if (teacher && student) {
            const updatedSchool = yield staffModel_1.default.findByIdAndUpdate(teacher === null || teacher === void 0 ? void 0 : teacher._id, {
                activeStatus: true,
            }, { new: true });
            const timing = 40 * 60 * 1000;
            const job = new cron_1.CronJob("*/2 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
                yield staffModel_1.default.findByIdAndUpdate(teacher === null || teacher === void 0 ? void 0 : teacher._id, {
                    activeStatus: false,
                }, { new: true });
                job.stop();
            }), null, true);
            // const taskId = setTimeout(async () => {
            //   await staffModel.findByIdAndUpdate(
            //     teacher?._id,
            //     {
            //       activeStatus: false,
            //     },
            //     { new: true }
            //   );
            //   clearTimeout(taskId);
            // }, timing);
            return res.status(201).json({
                message: "staff activity has been, active",
                data: updatedSchool,
                status: 201,
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
exports.updateStaffActiveness = updateStaffActiveness;
const deleteStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const { schoolID, staffID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = yield staffModel_1.default.findByIdAndDelete(staffID);
            (_d = school === null || school === void 0 ? void 0 : school.staff) === null || _d === void 0 ? void 0 : _d.pull(new mongoose_1.Types.ObjectId(staffID));
            school.save();
            return res.status(200).json({
                message: "Successfully Deleted Staff",
                status: 200,
                data: staff,
            });
        }
        else {
            return res.status(404).json({
                message: "No School Found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error deleting Staff",
            status: 404,
            data: error.message,
        });
    }
});
exports.deleteStaff = deleteStaff;
