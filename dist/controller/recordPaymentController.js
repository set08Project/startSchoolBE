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
exports.deleteFeesRecord = exports.getOneFeeRecord = exports.getAllFeeRecords = exports.recordSecondFeePayment = exports.recordFeesPayment = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const recordPaymentModel_1 = __importDefault(require("../model/recordPaymentModel"));
const mongoose_1 = require("mongoose");
const recordFeesPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { studentID } = req.params;
        const { feePaid, feePaidDate, paidByWho, paymentMode } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const student = yield studentModel_1.default.findById(studentID);
        if (school) {
            const getTerm = school === null || school === void 0 ? void 0 : school.presentTerm;
            if (getTerm) {
                const getStudentClassFee = student === null || student === void 0 ? void 0 : student.classTermFee;
                const currentBalance = getStudentClassFee - feePaid;
                const recordSchoolFeesPayment = yield recordPaymentModel_1.default.create({
                    feePaid,
                    feePaidDate,
                    paidByWho,
                    paymentMode,
                    feeBalance: currentBalance,
                    classFees: getStudentClassFee,
                    getTerm: getTerm,
                    studentID: student === null || student === void 0 ? void 0 : student._id,
                    studentFirstName: student === null || student === void 0 ? void 0 : student.studentFirstName,
                    studentLastName: student === null || student === void 0 ? void 0 : student.studentLastName,
                    studentClass: student === null || student === void 0 ? void 0 : student.classAssigned,
                    studentAvatar: student === null || student === void 0 ? void 0 : student.avatar,
                    parentMail: student === null || student === void 0 ? void 0 : student.parentEmail,
                });
                school === null || school === void 0 ? void 0 : school.recordPayments.push(new mongoose_1.Types.ObjectId(recordSchoolFeesPayment._id));
                student === null || student === void 0 ? void 0 : student.recordPayments.push(new mongoose_1.Types.ObjectId(recordSchoolFeesPayment._id));
                school === null || school === void 0 ? void 0 : school.save();
                student === null || student === void 0 ? void 0 : student.save();
                return res.status(201).json({
                    message: "Sucessfully Recorded School fees Payment",
                    data: recordSchoolFeesPayment,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Current Term Not Selected",
                    status: 404,
                });
            }
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
            message: "Error Recording Term Fees",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
});
exports.recordFeesPayment = recordFeesPayment;
const recordSecondFeePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { feePaid } = req.body;
        const { recordID } = req.params;
        const record = yield recordPaymentModel_1.default.findById(recordID);
        if (record) {
            const pushRecord = (_a = record === null || record === void 0 ? void 0 : record.feePaid) === null || _a === void 0 ? void 0 : _a.push(feePaid);
            if (pushRecord) {
                const getRecord = record === null || record === void 0 ? void 0 : record.feePaid;
                const totalFees = getRecord === null || getRecord === void 0 ? void 0 : getRecord.reduce((accumulator, currentVal) => {
                    return accumulator + currentVal;
                });
                const lastFeePaid = getRecord[(getRecord === null || getRecord === void 0 ? void 0 : getRecord.length) - 1];
                const getClassFees = record === null || record === void 0 ? void 0 : record.classFees;
                if (totalFees === getClassFees) {
                    const update = yield recordPaymentModel_1.default.findByIdAndUpdate(record._id, { feePaymentComplete: true, feeBalance: totalFees }, { new: true });
                    yield record.save();
                    return res.status(201).json({
                        message: "Successfully Recorded New Payment. Payment Now Complete",
                        data: {
                            main: update,
                            total: totalFees,
                        },
                        status: 201,
                    });
                }
                else {
                    const convertNum = Number(totalFees);
                    const balance = getClassFees - convertNum;
                    yield record.save();
                    return res.status(201).json({
                        message: "Successfully Recorded New Payment.",
                        data: {
                            paid: lastFeePaid,
                            totalPaid: totalFees,
                            balance: balance,
                        },
                        status: 201,
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "No Payment Added",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error Recording New Payment",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Recording Second Fees Payment",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
});
exports.recordSecondFeePayment = recordSecondFeePayment;
const getAllFeeRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const getAll = yield schoolModel_1.default.findById(schoolID).populate({
            path: "recordPayments",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "Successfully Gotten All The Fees Data",
            data: getAll,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Getting ALL Fees Records",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
});
exports.getAllFeeRecords = getAllFeeRecords;
const getOneFeeRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentID } = req.params;
        const getAll = yield studentModel_1.default.findById(studentID).populate({
            path: "recordPayments",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "Successfully Gotten All The Fees Data",
            data: getAll,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Getting ALL Fees Records",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
});
exports.getOneFeeRecord = getOneFeeRecord;
const deleteFeesRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const { schoolID } = req.params;
        const { studentID } = req.params;
        const { recordID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        const student = yield studentModel_1.default.findById(studentID);
        if (school) {
            const findRecord = yield recordPaymentModel_1.default.findByIdAndDelete(recordID);
            (_b = school === null || school === void 0 ? void 0 : school.recordPayments) === null || _b === void 0 ? void 0 : _b.pull(new mongoose_1.Types.ObjectId(recordID));
            (_c = student === null || student === void 0 ? void 0 : student.recordPayments) === null || _c === void 0 ? void 0 : _c.pull(new mongoose_1.Types.ObjectId(recordID));
            yield school.save();
            yield student.save();
            return res.status(200).json({
                message: "Successfully Deleted Fees Record",
                data: findRecord,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "Error Deleting Fees Record",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Deleting Fees Record",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
});
exports.deleteFeesRecord = deleteFeesRecord;
