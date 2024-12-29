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
exports.verifySchoolTransaction = exports.makeOtherSchoolPayment = exports.schoolFeePayment = exports.makeSplitSchoolfeePayment = exports.storePayment = exports.makeSplitPayment = exports.verifyTransaction = exports.makePayment = exports.createPayment = exports.getBankAccount = exports.createPaymentAccount = exports.paymentFromStore = exports.viewVerifyTransaction = exports.makeSchoolPayment = exports.viewSchoolPayment = exports.makePaymentWithCron = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const paymentModel_1 = __importDefault(require("../model/paymentModel"));
const mongoose_1 = require("mongoose");
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const cron_1 = require("cron");
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import https from "https";
const dotenv_1 = __importDefault(require("dotenv"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const termModel_1 = __importDefault(require("../model/termModel"));
const sessionModel_1 = __importDefault(require("../model/sessionModel"));
dotenv_1.default.config();
const URL = process.env.APP_URL_DEPLOY;
const https = require("https");
const makePaymentWithCron = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const startDate = new Date();
            const startedDate = new Date().setTime(startDate.getTime());
            // const dataPeriod = startDate.setFullYear(startDate.getFullYear() + 1);
            const dataPeriod = startDate.setMinutes(startDate.getMinutes() + 1);
            const paymentID = crypto_1.default.randomBytes(3).toString("hex");
            const payments = yield paymentModel_1.default.create({
                cost: 200000,
                schoolName: school === null || school === void 0 ? void 0 : school.schoolName,
                expiryDate: (0, moment_1.default)(dataPeriod).format("LLLL"),
                datePaid: (0, moment_1.default)(startedDate).format("LLLL"),
                paymentID,
            });
            school.payments.push(new mongoose_1.Types.ObjectId(payments._id));
            school.save();
            yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                plan: "active",
            }, { new: true });
            const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                    plan: "in active",
                }, { new: true });
                clearTimeout(timer);
            }), 1000 * 60);
            // const cronParser = require("cron-parser");
            return res.status(201).json({
                message: "payment created successfully",
                data: school,
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
exports.makePaymentWithCron = makePaymentWithCron;
const viewSchoolPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "payments",
        });
        return res.status(200).json({
            message: "viewing school payments",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school payments",
        });
    }
});
exports.viewSchoolPayment = viewSchoolPayment;
const makeSchoolPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            cron_1.CronJob;
        }
        return res.status(200).json({
            message: "viewing school payments",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school payments",
        });
    }
});
exports.makeSchoolPayment = makeSchoolPayment;
const viewVerifyTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ref } = req.params;
        yield axios_1.default
            .get(`https://api.paystack.co/transaction/verify/${ref}`, {
            headers: {
                authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "content-type": "application/json",
                "cache-control": "no-cache",
            },
        })
            .then((resp) => {
            return res.status(201).json({
                message: "welcome",
                data: resp.data,
                status: 201,
            });
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error.message,
            error: error,
            status: 404,
        });
    }
});
exports.viewVerifyTransaction = viewVerifyTransaction;
const paymentFromStore = (req, res) => {
    try {
        const { account } = req.body;
        const params = JSON.stringify({
            email: "customer@email.com",
            amount: "20000",
            subaccount: account,
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => { });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Error",
            status: 404,
        });
    }
};
exports.paymentFromStore = paymentFromStore;
const createPaymentAccount = (req, res) => {
    try {
        const { account } = req.body;
        const params = JSON.stringify({
            // business_name: "Cheese Sticks",
            // bank_code: "058",
            account_number: "2254710854",
            percentage_charge: 20,
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/subaccount",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                res.status(200).json({
                    message: "gotten",
                    data: JSON.parse(data),
                    status: 200,
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Error",
            status: 404,
        });
    }
};
exports.createPaymentAccount = createPaymentAccount;
const getBankAccount = (req, res) => {
    try {
        const { account } = req.body;
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/bank",
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
            },
        };
        https
            .request(options, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                res.status(200).json({
                    message: "gotten",
                    data: JSON.parse(data),
                    status: 200,
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
    }
    catch (error) {
        res.status(404).json({
            message: "Error",
            status: 404,
        });
    }
};
exports.getBankAccount = getBankAccount;
// Perfect integration and selected...
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        // const { cost, schoolName, expiryDate, datePaid, paymentID } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const startDate = new Date();
            const startedDate = new Date().setTime(startDate.getTime());
            // const dataPeriod = startDate.setFullYear(startDate.getFullYear() + 1);
            const dataPeriod = startDate.setMinutes(startDate.getMinutes() + 1);
            const paymentID = crypto_1.default.randomBytes(3).toString("hex");
            const payments = yield paymentModel_1.default.create({
                cost: (school === null || school === void 0 ? void 0 : school.students.length) * 1000,
                schoolName: school === null || school === void 0 ? void 0 : school.schoolName,
                expiryDate: (0, moment_1.default)(dataPeriod).format("LLLL"),
                datePaid: (0, moment_1.default)(startedDate).format("LLLL"),
                paymentID,
            });
            school.payments.push(new mongoose_1.Types.ObjectId(payments._id));
            school.save();
            yield schoolModel_1.default.findByIdAndUpdate(schoolID, {
                plan: "active",
            }, { new: true });
            // const timer = setTimeout(async () => {
            //   console.log("work out this...!");
            //   await schoolModel.findByIdAndUpdate(
            //     schoolID,
            //     {
            //       plan: "in active",
            //     },
            //     { new: true }
            //   );
            //   clearTimeout(timer);
            // }, 1000 * 60);
            return res.status(201).json({
                message: "payment created successfully",
                data: school,
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
exports.createPayment = createPayment;
const makePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        let amount = (school === null || school === void 0 ? void 0 : school.students.length) * 1000;
        let termID = school === null || school === void 0 ? void 0 : school.presentTermID;
        let token = jsonwebtoken_1.default.sign({ termID }, process.env.API_SECRET_KEY, {
            expiresIn: "3d",
        });
        const params = JSON.stringify({
            email,
            amount: (amount * 100).toString(),
            callback_url: `${process.env.APP_URL_DEPLOY}/${token}/successful-payment`,
            metadata: {
                cancel_action: `${process.env.APP_URL_DEPLOY}`,
            },
            channels: ["card"],
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(201).json({
                    message: "processing payment",
                    data: JSON.parse(data),
                    status: 201,
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error.message,
            status: 404,
        });
    }
});
exports.makePayment = makePayment;
const verifyTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ref } = req.params;
        const url = `https://api.paystack.co/transaction/verify/${ref}`;
        yield axios_1.default
            .get(url, {
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
            },
        })
            .then((data) => {
            return res.status(200).json({
                message: "payment verified",
                status: 200,
                data: data.data,
            });
        });
    }
    catch (error) {
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
});
exports.verifyTransaction = verifyTransaction;
const makeSplitPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountName, accountNumber, accountBankCode } = req.body;
        const params = JSON.stringify({
            business_name: accountName,
            settlement_bank: accountBankCode,
            account_number: accountNumber,
            percentage_charge: 10,
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/subaccount",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "sub-account created",
                    status: 200,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing store",
        });
    }
});
exports.makeSplitPayment = makeSplitPayment;
const storePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subAccountCode, email, amount } = req.body;
        const params = JSON.stringify({
            email,
            amount: `${amount * 100}`,
            subaccount: subAccountCode,
            callback_url: `${URL}/purchase-history`,
            meta: {
                cancel: `${URL}`,
            },
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "sub account payment ",
                    status: 200,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
});
exports.storePayment = storePayment;
const makeSplitSchoolfeePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountName, accountNumber, accountBankCode } = req.body;
        const params = JSON.stringify({
            business_name: accountName,
            settlement_bank: accountBankCode,
            account_number: accountNumber,
            percentage_charge: 5,
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/subaccount",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "sub-account created",
                    status: 200,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing store",
        });
    }
});
exports.makeSplitSchoolfeePayment = makeSplitSchoolfeePayment;
const schoolFeePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subAccountCode, email, amount } = req.body;
        const params = JSON.stringify({
            email,
            amount: `${amount * 100}`,
            subaccount: subAccountCode,
            callback_url: `${URL}/school-fee-payment`,
            meta: {
                cancel: `${URL}`,
            },
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "sub account payment ",
                    status: 200,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
});
exports.schoolFeePayment = schoolFeePayment;
const makeOtherSchoolPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subAccountCode, email, paymentAmount, paymentName } = req.body;
        const params = JSON.stringify({
            email,
            amount: `${paymentAmount * 100}`,
            subaccount: subAccountCode,
            callback_url: `${URL}/school-fee-payment`,
            meta: {
                cancel: `${URL}`,
            },
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "other payment made successfully",
                    status: 201,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
});
exports.makeOtherSchoolPayment = makeOtherSchoolPayment;
const verifySchoolTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { ref, studentID } = req.params;
        const student = yield studentModel_1.default.findById(studentID);
        const school = yield schoolModel_1.default.findById(student === null || student === void 0 ? void 0 : student.schoolIDs).populate({
            path: "session",
        });
        const readSession = (_a = school === null || school === void 0 ? void 0 : school.session) === null || _a === void 0 ? void 0 : _a.find((el) => (el === null || el === void 0 ? void 0 : el._id) === (school === null || school === void 0 ? void 0 : school.presentSessionID));
        const termly = yield sessionModel_1.default.findById(readSession === null || readSession === void 0 ? void 0 : readSession._id).populate({
            path: "term",
        });
        const readTerm = (_b = termly === null || termly === void 0 ? void 0 : termly.term) === null || _b === void 0 ? void 0 : _b.find((el) => (el === null || el === void 0 ? void 0 : el.presentTerm) === (school === null || school === void 0 ? void 0 : school.presentTerm) &&
            el.presentTermID === (school === null || school === void 0 ? void 0 : school.presentTermID));
        const mainTerm = yield termModel_1.default.findById(readTerm === null || readTerm === void 0 ? void 0 : readTerm._id);
        const url = `https://api.paystack.co/transaction/verify/${ref}`;
        yield axios_1.default
            .get(url, {
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
            },
        })
            .then((data) => __awaiter(void 0, void 0, void 0, function* () {
            let id = crypto_1.default.randomBytes(4).toString("hex");
            yield termModel_1.default.findByIdAndUpdate(mainTerm === null || mainTerm === void 0 ? void 0 : mainTerm._id, {
                otherPaymentRecord: [
                    ...mainTerm === null || mainTerm === void 0 ? void 0 : mainTerm.otherPaymentRecord,
                    { id, paymentDetails: "payment", paymentAmount: data === null || data === void 0 ? void 0 : data.amount },
                ],
            }, { new: true });
            return res.status(200).json({
                message: "payment verified",
                status: 200,
                data: data.data,
            });
        }));
    }
    catch (error) {
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
});
exports.verifySchoolTransaction = verifySchoolTransaction;
