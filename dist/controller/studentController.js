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
exports.deleteStudent = exports.changeStudentClass = exports.assignClassMonitor = exports.updateSchoolSchoolFee = exports.viewSchoolSchoolFeeRecord = exports.viewSchoolFeeRecord = exports.createSchoolFeePayment = exports.viewStorePurchasedTeacher = exports.createStorePurchasedTeacher = exports.updateSchoolStorePurchased = exports.viewSchoolStorePurchased = exports.viewStorePurchased = exports.createStorePurchased = exports.updatePurchaseRecord = exports.updateStudent3rdFees = exports.updateStudent2ndFees = exports.updateStudent1stFees = exports.updateStudentParentEmail = exports.updateStudentAvatar = exports.logoutStudent = exports.readStudentCookie = exports.loginStudent = exports.readStudentDetail = exports.readSchoolStudents = exports.createSchoolStudent = void 0;
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
const createSchoolStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
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
                    presentClassID: findClass === null || findClass === void 0 ? void 0 : findClass._id,
                    classTermFee: (findClass === null || findClass === void 0 ? void 0 : findClass.presentTerm) === "1st Term"
                        ? findClass === null || findClass === void 0 ? void 0 : findClass.class1stFee
                        : (findClass === null || findClass === void 0 ? void 0 : findClass.presentTerm) === "2nd Term"
                            ? findClass === null || findClass === void 0 ? void 0 : findClass.class2ndFee
                            : (findClass === null || findClass === void 0 ? void 0 : findClass.presentTerm) === "3rd Term"
                                ? findClass === null || findClass === void 0 ? void 0 : findClass.class3rdFee
                                : null,
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
                (_c = school === null || school === void 0 ? void 0 : school.historys) === null || _c === void 0 ? void 0 : _c.push(new mongoose_1.Types.ObjectId(student._id));
                yield school.save();
                findClass === null || findClass === void 0 ? void 0 : findClass.students.push(new mongoose_1.Types.ObjectId(student._id));
                yield findClass.save();
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
        const { studentID } = req.params;
        const school = yield studentModel_1.default.findById(studentID);
        if (school) {
            const { secure_url, public_id } = yield (0, streamifier_1.streamUpload)(req);
            const updatedStudent = yield studentModel_1.default.findByIdAndUpdate(studentID, {
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
});
exports.updateStudentAvatar = updateStudentAvatar;
const updateStudentParentEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, studentID } = req.params;
        const { parentEmail } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const student = yield studentModel_1.default.findByIdAndUpdate(studentID, { parentEmail }, { new: true });
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
});
exports.updateStudentParentEmail = updateStudentParentEmail;
const updateStudent1stFees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, studentID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        const getStudent = yield studentModel_1.default.findById(studentID);
        if ((school === null || school === void 0 ? void 0 : school.status) === "school-admin" && school) {
            const students = yield studentModel_1.default.findByIdAndUpdate(studentID, { feesPaid1st: !(getStudent === null || getStudent === void 0 ? void 0 : getStudent.feesPaid1st) }, { new: true });
            (0, email_1.verifySchoolFees)(students, 1);
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
});
exports.updateStudent1stFees = updateStudent1stFees;
const updateStudent2ndFees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, studentID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if ((school === null || school === void 0 ? void 0 : school.status) === "school-admin" && school) {
            let students = yield studentModel_1.default.findById(studentID);
            if ((students === null || students === void 0 ? void 0 : students.feesPaid1st) === true) {
                let student = yield studentModel_1.default.findByIdAndUpdate(students === null || students === void 0 ? void 0 : students._id, { feesPaid2nd: !(students === null || students === void 0 ? void 0 : students.feesPaid2nd) }, { new: true });
                (0, email_1.verifySchoolFees)(student, 2);
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
});
exports.updateStudent2ndFees = updateStudent2ndFees;
const updateStudent3rdFees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID, studentID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if ((school === null || school === void 0 ? void 0 : school.status) === "school-admin" && school) {
            const student = yield studentModel_1.default.findById(studentID);
            if ((student === null || student === void 0 ? void 0 : student.feesPaid2nd) === true) {
                yield studentModel_1.default.findByIdAndUpdate(studentID, { feesPaid3rd: !(student === null || student === void 0 ? void 0 : student.feesPaid3rd) }, { new: true });
                (0, email_1.verifySchoolFees)(student, 3);
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
});
exports.updateStudent3rdFees = updateStudent3rdFees;
const updatePurchaseRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { studentID } = req.params;
        const { purchased } = req.body;
        const student = yield studentModel_1.default.findById(studentID);
        const school = yield schoolModel_1.default.findById(student === null || student === void 0 ? void 0 : student.schoolIDs);
        if ((school === null || school === void 0 ? void 0 : school.status) === "school-admin" && school) {
            yield studentModel_1.default.findById(studentID, {
                purchaseHistory: (_a = student === null || student === void 0 ? void 0 : student.purchaseHistory) === null || _a === void 0 ? void 0 : _a.push(purchased),
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
});
exports.updatePurchaseRecord = updatePurchaseRecord;
const createStorePurchased = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const { date, amount, cart, reference, purchasedID, delievered } = req.body;
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "purchaseHistory",
        });
        const school = yield schoolModel_1.default.findById(student === null || student === void 0 ? void 0 : student.schoolIDs);
        if (school) {
            const check = student === null || student === void 0 ? void 0 : student.purchaseHistory.some((el) => {
                return el.reference === reference;
            });
            if (!check) {
                const store = yield historyModel_1.default.create({
                    date,
                    amount,
                    cart,
                    reference,
                    purchasedID,
                    delievered: false,
                    studentName: `${student === null || student === void 0 ? void 0 : student.studentFirstName} ${student === null || student === void 0 ? void 0 : student.studentLastName}`,
                    studentClass: student === null || student === void 0 ? void 0 : student.classAssigned,
                });
                student === null || student === void 0 ? void 0 : student.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                student === null || student === void 0 ? void 0 : student.save();
                school === null || school === void 0 ? void 0 : school.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                school === null || school === void 0 ? void 0 : school.save();
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
});
exports.createStorePurchased = createStorePurchased;
const viewStorePurchased = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "purchaseHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student === null || student === void 0 ? void 0 : student.purchaseHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
});
exports.viewStorePurchased = viewStorePurchased;
const viewSchoolStorePurchased = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const student = yield schoolModel_1.default.findById(schoolID).populate({
            path: "purchaseHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student === null || student === void 0 ? void 0 : student.purchaseHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
});
exports.viewSchoolStorePurchased = viewSchoolStorePurchased;
const updateSchoolStorePurchased = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { purchaseID } = req.params;
        const { delievered } = req.body;
        const item = yield historyModel_1.default.findByIdAndUpdate(purchaseID, {
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
});
exports.updateSchoolStorePurchased = updateSchoolStorePurchased;
const createStorePurchasedTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffID } = req.params;
        const { date, amount, cart, reference, purchasedID } = req.body;
        const student = yield staffModel_1.default.findById(staffID).populate({
            path: "purchaseHistory",
        });
        const school = yield schoolModel_1.default.findById(student === null || student === void 0 ? void 0 : student.schoolIDs);
        if (school) {
            const check = student === null || student === void 0 ? void 0 : student.purchaseHistory.some((el) => {
                return el.reference === reference;
            });
            if (!check) {
                const store = yield historyModel_1.default.create({
                    date,
                    amount,
                    cart,
                    reference,
                    purchasedID,
                    delievered: false,
                    studentName: student === null || student === void 0 ? void 0 : student.staffName,
                    studentClass: student === null || student === void 0 ? void 0 : student.classesAssigned,
                });
                student === null || student === void 0 ? void 0 : student.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                student === null || student === void 0 ? void 0 : student.save();
                school === null || school === void 0 ? void 0 : school.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                school === null || school === void 0 ? void 0 : school.save();
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
});
exports.createStorePurchasedTeacher = createStorePurchasedTeacher;
const viewStorePurchasedTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffID } = req.params;
        const student = yield staffModel_1.default.findById(staffID).populate({
            path: "purchaseHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student === null || student === void 0 ? void 0 : student.purchaseHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
});
exports.viewStorePurchasedTeacher = viewStorePurchasedTeacher;
const createSchoolFeePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { studentID } = req.params;
        const { date, amount, purchasedID, reference } = req.body;
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "schoolFeesHistory",
        });
        const classOne = yield classroomModel_1.default.findById(student === null || student === void 0 ? void 0 : student.presentClassID);
        const school = yield schoolModel_1.default.findById(student === null || student === void 0 ? void 0 : student.schoolIDs);
        if (school) {
            const check = student === null || student === void 0 ? void 0 : student.schoolFeesHistory.some((el) => {
                return el.reference === reference;
            });
            if (!check) {
                const store = yield schoolFeeHistory_1.default.create({
                    studentID,
                    session: school === null || school === void 0 ? void 0 : school.presentSession,
                    sessionID: school === null || school === void 0 ? void 0 : school.presentSessionID,
                    termID: school === null || school === void 0 ? void 0 : school.presentTermID,
                    confirm: false,
                    term: classOne === null || classOne === void 0 ? void 0 : classOne.presentTerm,
                    studentName: `${student === null || student === void 0 ? void 0 : student.studentFirstName} ${student === null || student === void 0 ? void 0 : student.studentLastName}`,
                    studentClass: student === null || student === void 0 ? void 0 : student.classAssigned,
                    image: student === null || student === void 0 ? void 0 : student.avatar,
                    date,
                    amount,
                    purchasedID,
                    reference,
                });
                student === null || student === void 0 ? void 0 : student.schoolFeesHistory.push(new mongoose_1.Types.ObjectId(store._id));
                student === null || student === void 0 ? void 0 : student.save();
                school === null || school === void 0 ? void 0 : school.schoolFeesHistory.push(new mongoose_1.Types.ObjectId(store._id));
                school === null || school === void 0 ? void 0 : school.save();
                if ((classOne === null || classOne === void 0 ? void 0 : classOne.presentTerm) === "1st Term") {
                    classOne === null || classOne === void 0 ? void 0 : classOne.schoolFeesHistory.push(new mongoose_1.Types.ObjectId(store._id));
                    classOne === null || classOne === void 0 ? void 0 : classOne.save();
                }
                else if ((classOne === null || classOne === void 0 ? void 0 : classOne.presentTerm) === "2nd Term") {
                    classOne === null || classOne === void 0 ? void 0 : classOne.schoolFeesHistory2.push(new mongoose_1.Types.ObjectId(store._id));
                    classOne === null || classOne === void 0 ? void 0 : classOne.save();
                }
                else if ((classOne === null || classOne === void 0 ? void 0 : classOne.presentTerm) === "3rd Term") {
                    classOne === null || classOne === void 0 ? void 0 : classOne.schoolFeesHistory3.push(new mongoose_1.Types.ObjectId(store._id));
                    classOne === null || classOne === void 0 ? void 0 : classOne.save();
                }
                if ((classOne === null || classOne === void 0 ? void 0 : classOne.presentTerm) === "1st Term") {
                    const classData = yield classroomModel_1.default
                        .findById(student === null || student === void 0 ? void 0 : student.presentClassID)
                        .populate({
                        path: "schoolFeesHistory",
                    });
                    const amount = (_a = classData === null || classData === void 0 ? void 0 : classData.schoolFeesHistory) === null || _a === void 0 ? void 0 : _a.filter((el) => {
                        return (el.sessionID === (school === null || school === void 0 ? void 0 : school.presentSessionID) &&
                            el.termID === (school === null || school === void 0 ? void 0 : school.presentTermID) &&
                            el.term === "1st Term");
                    }).map((el) => {
                        return el.amount;
                    }).reduce((a, b) => {
                        return a + b;
                    }, 0);
                    const real = yield classroomModel_1.default.findByIdAndUpdate(classData === null || classData === void 0 ? void 0 : classData._id, {
                        class1stFee: amount,
                    }, { new: true });
                    console.log(classData);
                    console.log(amount);
                    console.log(real);
                }
                else if ((classOne === null || classOne === void 0 ? void 0 : classOne.presentTerm) === "2nd Term") {
                    const classData = yield classroomModel_1.default
                        .findById(student === null || student === void 0 ? void 0 : student.presentClassID)
                        .populate({
                        path: "schoolFeesHistory2",
                    });
                    const amount = (_b = classData === null || classData === void 0 ? void 0 : classData.schoolFeesHistory) === null || _b === void 0 ? void 0 : _b.filter((el) => {
                        return (el.sessionID === (school === null || school === void 0 ? void 0 : school.presentSessionID) &&
                            el.termID === (school === null || school === void 0 ? void 0 : school.presentTermID) &&
                            el.term === "2nd Term");
                    }).map((el) => {
                        return el.amount;
                    }).reduce((a, b) => {
                        return a + b;
                    }, 0);
                    classroomModel_1.default.findByIdAndUpdate(classData === null || classData === void 0 ? void 0 : classData._id, {
                        class2ndFee: amount,
                    }, { new: true });
                }
                else if ((classOne === null || classOne === void 0 ? void 0 : classOne.presentTerm) === "3rd Term") {
                    const classData = yield classroomModel_1.default
                        .findById(student === null || student === void 0 ? void 0 : student.presentClassID)
                        .populate({
                        path: "schoolFeesHistory3",
                    });
                    const amount = (_c = classData === null || classData === void 0 ? void 0 : classData.schoolFeesHistory) === null || _c === void 0 ? void 0 : _c.filter((el) => {
                        return (el.sessionID === (school === null || school === void 0 ? void 0 : school.presentSessionID) &&
                            el.termID === (school === null || school === void 0 ? void 0 : school.presentTermID) &&
                            el.term === "3rd Term");
                    }).map((el) => {
                        return el.amount;
                    }).reduce((a, b) => {
                        return a + b;
                    }, 0);
                    classroomModel_1.default.findByIdAndUpdate(classData === null || classData === void 0 ? void 0 : classData._id, {
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
});
exports.createSchoolFeePayment = createSchoolFeePayment;
const viewSchoolFeeRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const student = yield studentModel_1.default.findById(studentID).populate({
            path: "schoolFeesHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student === null || student === void 0 ? void 0 : student.schoolFeesHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
});
exports.viewSchoolFeeRecord = viewSchoolFeeRecord;
const viewSchoolSchoolFeeRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const student = yield schoolModel_1.default.findById(schoolID).populate({
            path: "schoolFeesHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student === null || student === void 0 ? void 0 : student.schoolFeesHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
});
exports.viewSchoolSchoolFeeRecord = viewSchoolSchoolFeeRecord;
const updateSchoolSchoolFee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolFeeID } = req.params;
        const { confirm } = req.body;
        const item = yield schoolFeeHistory_1.default.findByIdAndUpdate(schoolFeeID, {
            confirm,
        }, { new: true });
        let studentRecord = yield studentModel_1.default.findById(item.studentID);
        let studetClass = yield classroomModel_1.default.findById(studentRecord === null || studentRecord === void 0 ? void 0 : studentRecord.presentClassID);
        if ((studetClass === null || studetClass === void 0 ? void 0 : studetClass.presentTerm) === "1st Term") {
            yield studentModel_1.default.findByIdAndUpdate(item === null || item === void 0 ? void 0 : item.studentID, {
                feesPaid1st: true,
            }, { new: true });
        }
        else if ((studetClass === null || studetClass === void 0 ? void 0 : studetClass.presentTerm) === "2nd Term") {
            yield studentModel_1.default.findByIdAndUpdate(item === null || item === void 0 ? void 0 : item.studentID, {
                feesPaid2nd: true,
            }, { new: true });
        }
        else if ((studetClass === null || studetClass === void 0 ? void 0 : studetClass.presentTerm) === "3rd Term") {
            yield studentModel_1.default.findByIdAndUpdate(item === null || item === void 0 ? void 0 : item.studentID, {
                feesPaid3rd: true,
            }, { new: true });
        }
        return res.status(201).json({
            message: `schoolfee confirm successfully`,
            data: item,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating school's school fee",
            data: error.message,
        });
    }
});
exports.updateSchoolSchoolFee = updateSchoolSchoolFee;
const assignClassMonitor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { teacherID, studentID } = req.params;
        const teacher = yield staffModel_1.default.findById(teacherID);
        const getClass = yield classroomModel_1.default
            .findById(teacher === null || teacher === void 0 ? void 0 : teacher.presentClassID)
            .populate({
            path: "students",
        });
        let readStudent = (_a = getClass === null || getClass === void 0 ? void 0 : getClass.students) === null || _a === void 0 ? void 0 : _a.find((el) => {
            return (el === null || el === void 0 ? void 0 : el.monitor) === true;
        });
        yield studentModel_1.default.findByIdAndUpdate(readStudent === null || readStudent === void 0 ? void 0 : readStudent._id, {
            monitor: false,
        }, { new: true });
        const student = yield studentModel_1.default.findByIdAndUpdate(studentID, {
            monitor: true,
        }, { new: true });
        return res.status(201).json({
            message: `class monitor assigned to ${student === null || student === void 0 ? void 0 : student.studentFirstName} `,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating class's monitor",
            data: error.message,
        });
    }
});
exports.assignClassMonitor = assignClassMonitor;
const changeStudentClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { studentID } = req.params;
        const { classID } = req.body;
        const getClass = yield classroomModel_1.default.findById(classID).populate({
            path: "students",
        });
        const studentData = yield studentModel_1.default.findById(studentID);
        const getStudentClass = yield classroomModel_1.default.findById(studentData === null || studentData === void 0 ? void 0 : studentData.presentClassID);
        (_a = getStudentClass === null || getStudentClass === void 0 ? void 0 : getStudentClass.students) === null || _a === void 0 ? void 0 : _a.pull(new mongoose_1.Types.ObjectId(studentID));
        getStudentClass === null || getStudentClass === void 0 ? void 0 : getStudentClass.save();
        const student = yield studentModel_1.default.findByIdAndUpdate(studentID, {
            classAssigned: getClass === null || getClass === void 0 ? void 0 : getClass.className,
            presentClassID: getClass === null || getClass === void 0 ? void 0 : getClass._id,
            classTermFee: (getClass === null || getClass === void 0 ? void 0 : getClass.presentTerm) === "1st Term"
                ? getClass === null || getClass === void 0 ? void 0 : getClass.class1stFee
                : (getClass === null || getClass === void 0 ? void 0 : getClass.presentTerm) === "2nd Term"
                    ? getClass === null || getClass === void 0 ? void 0 : getClass.class2ndFee
                    : (getClass === null || getClass === void 0 ? void 0 : getClass.presentTerm) === "3rd Term"
                        ? getClass === null || getClass === void 0 ? void 0 : getClass.class3rdFee
                        : null,
        }, { new: true });
        (_b = getClass === null || getClass === void 0 ? void 0 : getClass.students) === null || _b === void 0 ? void 0 : _b.push(new mongoose_1.Types.ObjectId(student === null || student === void 0 ? void 0 : student._id));
        getClass === null || getClass === void 0 ? void 0 : getClass.save();
        return res.status(201).json({
            message: `class monitor assigned to ${student === null || student === void 0 ? void 0 : student.studentFirstName} `,
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
});
exports.changeStudentClass = changeStudentClass;
const deleteStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { schoolID, studentID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = yield studentModel_1.default.findByIdAndDelete(studentID);
            const checkClass = yield classroomModel_1.default.find();
            if (checkClass.length > 0) {
                const teacherClass = checkClass[0];
                (_a = school === null || school === void 0 ? void 0 : school.students) === null || _a === void 0 ? void 0 : _a.pull(new mongoose_1.Types.ObjectId(studentID));
                (_b = teacherClass === null || teacherClass === void 0 ? void 0 : teacherClass.students) === null || _b === void 0 ? void 0 : _b.pull(new mongoose_1.Types.ObjectId(studentID));
                school.save();
                teacherClass.save();
            }
            return res.status(200).json({
                message: "Successfully Deleted Student",
                status: 200,
                data: student,
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
            message: "Error deleting student",
            status: 404,
            data: error.message,
        });
    }
});
exports.deleteStudent = deleteStudent;
