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
exports.getBankAccount = exports.createPaymentAccount = exports.paymentFromStore = exports.viewVerifyTransaction = exports.makePayment = exports.makeSchoolPayment = exports.viewSchoolPayment = exports.makePaymentWithCron = exports.createPayment = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const paymentModel_1 = __importDefault(require("../model/paymentModel"));
const mongoose_1 = require("mongoose");
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const cron_1 = require("cron");
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
                console.log("work out this...!");
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
const makePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, email } = req.body;
        const params = JSON.stringify({
            email,
            amount: (parseInt(amount) * 100).toString(),
            callback_url: `${process.env.APP_URL_DEPLOY}`,
            metadata: {
                cancel_action: "http://localhost:5173/",
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
        const request = https_1.default
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
const viewVerifyTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ref } = req.params;
        console.log(ref);
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
        const request = https_1.default
            .request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                console.log(JSON.parse(data));
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
        const request = https_1.default
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
        https_1.default
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
