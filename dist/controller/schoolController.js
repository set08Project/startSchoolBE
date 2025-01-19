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
exports.createSchoolTimetableRecord = exports.changeSchoolTag = exports.approveRegistration = exports.getSchoolRegistered = exports.updateRegisterationStatus = exports.updateSchoolName = exports.updateAdminCode = exports.updateSchoolPaymentOptions = exports.updateSchoolAccountDetail = exports.updateSchoolStartPossition = exports.updateSchoolSignature = exports.updateSchoolAvatar = exports.changeSchoolPersonalName = exports.changeSchoolPhoneNumber = exports.changeSchoolAddress = exports.changeSchoolName = exports.deleteSchool = exports.viewAllSchools = exports.readSchoolCookie = exports.logoutSchool = exports.viewSchoolStatusByName = exports.viewSchoolStatus = exports.verifySchool = exports.createSchool = exports.loginSchool = exports.viewSchoolTopStudent = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../utils/email");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const streamifier_1 = require("../utils/streamifier");
const lodash_1 = __importDefault(require("lodash"));
const cron_1 = require("cron");
const sessionModel_1 = __importDefault(require("../model/sessionModel"));
const termModel_1 = __importDefault(require("../model/termModel"));
const classHistory_1 = __importDefault(require("../model/classHistory"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const viewSchoolTopStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const schoolClasses = yield schoolModel_1.default.findById(schoolID).populate({
            path: "students",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        const rate = lodash_1.default.orderBy(schoolClasses === null || schoolClasses === void 0 ? void 0 : schoolClasses.students, ["totalPerformance"], ["desc"]);
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
});
exports.viewSchoolTopStudent = viewSchoolTopStudent;
const loginSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, enrollmentID } = req.body;
        const school = yield schoolModel_1.default.findOne({
            email,
        });
        if (school) {
            if (school.enrollmentID === enrollmentID) {
                if (school.verify) {
                    const token = jsonwebtoken_1.default.sign({ status: school.status }, "school", {
                        expiresIn: "1d",
                    });
                    req.session.isAuth = true;
                    req.session.isSchoolID = school._id;
                    return res.status(201).json({
                        message: "welcome back",
                        data: token,
                        user: school === null || school === void 0 ? void 0 : school.status,
                        id: req.session.isSchoolID,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "please check your email to verify your account",
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "Error reading your school enrollment ID",
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
            message: "Error creating school",
            data: error.message,
        });
    }
});
exports.loginSchool = loginSchool;
const createSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const id = crypto_1.default.randomBytes(4).toString("hex");
        const adminCode = crypto_1.default.randomBytes(6).toString("hex");
        const school = yield schoolModel_1.default.create({
            email,
            enrollmentID: id,
            adminCode,
            status: "school-admin",
        });
        // verifiedEmail(school);
        const job = new cron_1.CronJob(" * * * * 7", // cronTime
        () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const viewSchool = yield schoolModel_1.default.findById(school._id);
            if (((_a = viewSchool === null || viewSchool === void 0 ? void 0 : viewSchool.staff) === null || _a === void 0 ? void 0 : _a.length) === 0 &&
                ((_b = viewSchool === null || viewSchool === void 0 ? void 0 : viewSchool.students) === null || _b === void 0 ? void 0 : _b.length) === 0 &&
                ((_c = viewSchool === null || viewSchool === void 0 ? void 0 : viewSchool.classRooms) === null || _c === void 0 ? void 0 : _c.length) === 0 &&
                ((_d = viewSchool === null || viewSchool === void 0 ? void 0 : viewSchool.subjects) === null || _d === void 0 ? void 0 : _d.length) === 0 &&
                !(viewSchool === null || viewSchool === void 0 ? void 0 : viewSchool.started) &&
                !(viewSchool === null || viewSchool === void 0 ? void 0 : viewSchool.verify)) {
                yield schoolModel_1.default.findByIdAndDelete(school._id);
            }
            job.stop();
        }), // onTick
        null, // onComplete
        true // start
        );
        return res.status(201).json({
            message: "creating school",
            data: school,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school",
            data: error.message,
            status: 404,
        });
    }
});
exports.createSchool = createSchool;
const verifySchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = yield schoolModel_1.default.findByIdAndUpdate(schoolID, { verify: true }, { new: true });
            return res.status(201).json({
                message: "school verified successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.verifySchool = verifySchool;
const viewSchoolStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        return res.status(200).json({
            message: "viewing school record",
            data: school,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.viewSchoolStatus = viewSchoolStatus;
const viewSchoolStatusByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolName } = req.params;
        const school = yield schoolModel_1.default.findOne({ schoolName });
        return res.status(200).json({
            message: "viewing school record by her name",
            data: school,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.viewSchoolStatusByName = viewSchoolStatusByName;
const logoutSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy();
        return res.status(200).json({
            message: "GoodBye",
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.logoutSchool = logoutSchool;
const readSchoolCookie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const readSchool = req.session.isSchoolID;
        return res.status(200).json({
            message: "GoodBye",
            data: readSchool,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.readSchoolCookie = readSchoolCookie;
const viewAllSchools = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const school = yield schoolModel_1.default.find();
        return res.status(200).json({
            total: `Number of Schools: ${school.length} on our platform`,
            length: school.length,
            message: "viewing all school",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.viewAllSchools = viewAllSchools;
const deleteSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        let id = "678d4e5060a0cbcd2e27dc51";
        const getSchool = yield schoolModel_1.default.findById(schoolID);
        console.log("here hmm: ", getSchool === null || getSchool === void 0 ? void 0 : getSchool.session);
        for (let i of getSchool === null || getSchool === void 0 ? void 0 : getSchool.session) {
            let sessTerm = yield (sessionModel_1.default === null || sessionModel_1.default === void 0 ? void 0 : sessionModel_1.default.findById(i.toString()));
            for (let i of sessTerm === null || sessTerm === void 0 ? void 0 : sessTerm.term) {
                console.log("here reading: ", i);
                yield (termModel_1.default === null || termModel_1.default === void 0 ? void 0 : termModel_1.default.findByIdAndDelete(i.toString()));
            }
            console.log("here done");
            yield (sessionModel_1.default === null || sessionModel_1.default === void 0 ? void 0 : sessionModel_1.default.findByIdAndDelete(i.toString()));
        }
        for (let i of getSchool === null || getSchool === void 0 ? void 0 : getSchool.classHistory) {
            yield (classHistory_1.default === null || classHistory_1.default === void 0 ? void 0 : classHistory_1.default.findByIdAndDelete(i.toString()));
        }
        for (let i of getSchool === null || getSchool === void 0 ? void 0 : getSchool.subjects) {
            yield (subjectModel_1.default === null || subjectModel_1.default === void 0 ? void 0 : subjectModel_1.default.findByIdAndDelete(i.toString()));
        }
        console.log("class");
        for (let i of getSchool === null || getSchool === void 0 ? void 0 : getSchool.classRooms) {
            yield (classroomModel_1.default === null || classroomModel_1.default === void 0 ? void 0 : classroomModel_1.default.findByIdAndDelete(i.toString()));
        }
        for (let i of getSchool === null || getSchool === void 0 ? void 0 : getSchool.students) {
            yield (studentModel_1.default === null || studentModel_1.default === void 0 ? void 0 : studentModel_1.default.findByIdAndDelete(i.toString()));
        }
        yield schoolModel_1.default.findByIdAndDelete(schoolID);
        return res.status(200).json({
            message: "school deleted successfully",
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.deleteSchool = deleteSchool;
const changeSchoolName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { schoolName } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = yield schoolModel_1.default.findByIdAndUpdate(schoolID, { schoolName }, { new: true });
            return res.status(201).json({
                message: "school verified successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.changeSchoolName = changeSchoolName;
const changeSchoolAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { address } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = yield schoolModel_1.default.findByIdAndUpdate(schoolID, { address }, { new: true });
            return res.status(201).json({
                message: "school verified successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.changeSchoolAddress = changeSchoolAddress;
const changeSchoolPhoneNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { phone } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = yield schoolModel_1.default.findByIdAndUpdate(schoolID, { phone }, { new: true });
            return res.status(201).json({
                message: "school phone number changes successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.changeSchoolPhoneNumber = changeSchoolPhoneNumber;
const changeSchoolPersonalName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { name, name2 } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = yield schoolModel_1.default.findByIdAndUpdate(schoolID, { name, name2 }, { new: true });
            return res.status(201).json({
                message: "school name changes successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.changeSchoolPersonalName = changeSchoolPersonalName;
// school Image/Logo
const updateSchoolAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const { secure_url, public_id } = yield (0, streamifier_1.streamUpload)(req);
            const updatedSchool = yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                avatar: secure_url,
                avatarID: public_id,
            }, { new: true });
            return res.status(200).json({
                message: "school avatar has been, added",
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
exports.updateSchoolAvatar = updateSchoolAvatar;
const updateSchoolSignature = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const { secure_url, public_id } = yield (0, streamifier_1.streamUpload)(req);
            const updatedSchool = yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                signature: secure_url,
                signatureID: public_id,
            }, { new: true });
            return res.status(200).json({
                message: "school signature has been, added",
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
exports.updateSchoolSignature = updateSchoolSignature;
// school shool has started
const updateSchoolStartPossition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school.schoolName) {
            const updatedSchool = yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                started: true,
            }, { new: true });
            return res.status(200).json({
                message: "school has started, operation",
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
exports.updateSchoolStartPossition = updateSchoolStartPossition;
// school school Account info
const updateSchoolAccountDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { bankDetails } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school.schoolName) {
            const updatedSchool = yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                bankDetails,
            }, { new: true });
            return res.status(200).json({
                message: "school account detail updated successfully",
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
            message: "Error updating account details",
        });
    }
});
exports.updateSchoolAccountDetail = updateSchoolAccountDetail;
const updateSchoolPaymentOptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { paymentDetails, paymentAmount } = req.body;
        let id = crypto_1.default.randomBytes(4).toString("hex");
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school.schoolName) {
            const updatedSchool = yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                paymentOptions: [
                    ...school === null || school === void 0 ? void 0 : school.paymentOptions,
                    { id, paymentDetails, paymentAmount },
                ],
            }, { new: true });
            return res.status(201).json({
                message: "school account detail updated successfully",
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
            message: "Error updating account details",
        });
    }
});
exports.updateSchoolPaymentOptions = updateSchoolPaymentOptions;
const updateAdminCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { adminCode } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        // const adminCode = crypto.randomBytes(6).toString("hex");
        if (school.schoolName) {
            const updatedSchoolAdminCode = yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                adminCode,
            }, { new: true });
            return res.status(200).json({
                message: "school admin code has been updated successfully",
                data: updatedSchoolAdminCode,
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
            message: "Error updating admin code details",
        });
    }
});
exports.updateAdminCode = updateAdminCode;
const updateSchoolName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { schoolName } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school.schoolName) {
            const updatedSchool = yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                schoolName,
            }, { new: true });
            return res.status(200).json({
                message: "school name has been updated successfully",
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
            message: "Error updating account details",
        });
    }
});
exports.updateSchoolName = updateSchoolName;
const updateRegisterationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolName, email, schoolPhoneNumber, schoolCategory, schoolLocation, schoolOrganization, } = req.body;
        const id = crypto_1.default.randomBytes(4).toString("hex");
        const adminCode = crypto_1.default.randomBytes(6).toString("hex");
        // if (school) {
        const updatedSchool = yield schoolModel_1.default.create({
            adminCode,
            enrollmentID: id,
            status: "school-admin",
            schoolName,
            email,
            phone: schoolPhoneNumber,
            categoryType: schoolCategory,
            address: schoolLocation,
            organizationType: schoolOrganization,
        });
        return res.status(201).json({
            message: "school detail has been updated successfully",
            data: updatedSchool,
            status: 201,
        });
        // } else {
        //   return res.status(404).json({
        //     message: "Something went wrong",
        //   });
        // }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating account details",
            error: error,
        });
    }
});
exports.updateRegisterationStatus = updateRegisterationStatus;
// export const approvedRegisteration = async (req: any, res: Response) => {
//   try {
//     const { email } = req.body;
//     const school: any = await schoolModel.findOne({ email });
//     if (school) {
//       const updatedSchool = await schoolModel.findByIdAndUpdate(
//         school?._id,
//         {
//           started: true,
//         },
//         { new: true }
//       );
//       verifiedEmail(school);
//       return res.status(200).json({
//         message: "school Has Approved",
//         data: updatedSchool,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Something went wrong",
//       });
//     }
//   } catch (error) {
//     return res.status(404).json({
//       message: "Error updating account details",
//     });
//   }
// };
const getSchoolRegistered = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const school = yield schoolModel_1.default.find();
        return res.status(200).json({
            message: "school Has Approved",
            data: school,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating account details",
        });
    }
});
exports.getSchoolRegistered = getSchoolRegistered;
const approveRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { email } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const updatedSchool = yield schoolModel_1.default.findByIdAndUpdate(school._id, {
                started: true,
            }, { new: true });
            yield (0, email_1.verifiedEmail)(school);
            return res.status(200).json({
                message: "School has been approved",
                data: updatedSchool,
                status: 200,
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
            message: "Error approving registration",
            error: error.message,
        });
    }
});
exports.approveRegistration = approveRegistration;
const changeSchoolTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { schoolTags } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const verified = yield schoolModel_1.default.findByIdAndUpdate(schoolID, { schoolTags }, { new: true });
            return res.status(201).json({
                message: "school verified successfully",
                data: verified,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying school",
        });
    }
});
exports.changeSchoolTag = changeSchoolTag;
const createSchoolTimetableRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { startBreak, startClass, endClass, endBreak, peroid } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const timeStructure = (startTime, endTime, interval) => {
            const timeSlots = [];
            let [startHour, startMinute] = startTime.split(":").map(Number);
            let [endHour, endMinute] = endTime.split(":").map(Number);
            // Convert everything to minutes
            let currentMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;
            while (currentMinutes < endMinutes) {
                // Calculate start time
                let startHours = Math.floor(currentMinutes / 60);
                let startMinutes = currentMinutes % 60;
                // Increment current time by interval (40 minutes)
                currentMinutes += interval;
                // Calculate end time
                let endHours = Math.floor(currentMinutes / 60);
                let endMinutes = currentMinutes % 60;
                // Convert to 12-hour format with AM/PM for both start and end
                const startPeriod = startHours >= 12 ? "PM" : "AM";
                startHours = startHours % 12 || 12; // Handle 12-hour format
                const endPeriod = endHours >= 12 ? "PM" : "AM";
                endHours = endHours % 12 || 12;
                // Format the times and push to the result
                const startFormatted = `${startHours
                    .toString()
                    .padStart(2, "0")}:${startMinutes
                    .toString()
                    .padStart(2, "0")}${startPeriod}`;
                const endFormatted = `${endHours
                    .toString()
                    .padStart(2, "0")}:${endMinutes
                    .toString()
                    .padStart(2, "0")}${endPeriod}`;
                timeSlots.push(`${startFormatted} - ${endFormatted}`);
            }
            return timeSlots;
        };
        const startPeriod = parseInt(startBreak) >= 12 ? "PM" : "AM";
        const endPeriod = parseInt(endBreak) >= 12 ? "PM" : "AM";
        if (school) {
            const classStructure = yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                startBreak,
                startClass,
                endClass,
                endBreak,
                peroid,
                timeTableStructure: timeStructure(startClass, startBreak, parseInt(peroid)).concat(`${startBreak}${startPeriod} - ${endBreak}${endPeriod}`, timeStructure(endBreak, endClass, parseInt(peroid))),
            }, { new: true });
            return res.status(201).json({
                message: "school time-table structure created successfully",
                data: classStructure,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "error finding school",
                data: school,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school timetable",
        });
    }
});
exports.createSchoolTimetableRecord = createSchoolTimetableRecord;
