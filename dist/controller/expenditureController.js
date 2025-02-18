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
exports.readTermDailyExpenses = exports.createDailyExpenses = exports.setTermlyBudget = exports.readTermBudget = exports.readTermExpenditure = exports.createExpenditure = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const termModel_1 = __importDefault(require("../model/termModel"));
const expenseModel_1 = __importDefault(require("../model/expenseModel"));
const mongoose_1 = require("mongoose");
const moment_1 = __importDefault(require("moment"));
const lodash_1 = __importDefault(require("lodash"));
const createExpenditure = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { item, description, amount, paymentCategory, paymentMode } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const getTerm = yield termModel_1.default.findById(school.presentTermID);
            if (getTerm) {
                let createExpense = yield expenseModel_1.default.create({
                    item,
                    description,
                    amount,
                    paymentCategory,
                    paymentMode,
                });
                getTerm === null || getTerm === void 0 ? void 0 : getTerm.expense.push(new mongoose_1.Types.ObjectId(createExpense === null || createExpense === void 0 ? void 0 : createExpense._id));
                getTerm === null || getTerm === void 0 ? void 0 : getTerm.save();
                return res.status(201).json({
                    message: "expense added successfully",
                    data: createExpense,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "unable to read school term",
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
            message: "Error creating school session",
            data: error.message,
        });
    }
});
exports.createExpenditure = createExpenditure;
const readTermExpenditure = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const getTerm = yield termModel_1.default.findById(school.presentTermID).populate({
                path: "expense",
                options: {
                    sort: {
                        createdAt: -1,
                    },
                },
            });
            return res.status(201).json({
                message: "retriving expense successfully",
                data: getTerm,
                status: 200,
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
            data: error.message,
        });
    }
});
exports.readTermExpenditure = readTermExpenditure;
const readTermBudget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const getTerm = yield termModel_1.default.findById(school.presentTermID).populate({
                path: "expense",
                options: {
                    sort: {
                        createdAt: -1,
                    },
                },
            });
            return res.status(201).json({
                message: "retriving term budget successfully",
                data: getTerm === null || getTerm === void 0 ? void 0 : getTerm.budget,
                status: 200,
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
            data: error.message,
        });
    }
});
exports.readTermBudget = readTermBudget;
const setTermlyBudget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { budget } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const getTerm = yield termModel_1.default.findByIdAndUpdate(school.presentTermID, {
                budget,
            }, { new: true });
            return res.status(201).json({
                message: "budget set successfully",
                data: getTerm,
                status: 200,
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
            data: error.message,
        });
    }
});
exports.setTermlyBudget = setTermlyBudget;
const createDailyExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { item, description, amount, paymentCategory, paymentMode } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const getTerm = yield termModel_1.default.findById(school.presentTermID);
            const getWeekNumber = (date) => {
                const currentDate = new Date(date.getTime());
                const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
                const diffInMillis = currentDate - startOfYear;
                const diffInDays = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));
                const startDayOfWeek = startOfYear.getDay();
                const adjustedDay = diffInDays + startDayOfWeek;
                return Math.ceil(adjustedDay / 7);
            };
            const today = new Date();
            if (getTerm) {
                let createExpense = yield termModel_1.default.findByIdAndUpdate(getTerm._id, {
                    expensePayOut: [
                        ...getTerm.expensePayOut,
                        {
                            item,
                            description,
                            amount,
                            paymentCategory,
                            paymentMode,
                            createdAt: (0, moment_1.default)(new Date().getTime()).format("LL"),
                            month: (0, moment_1.default)(new Date().getTime()).format("LL").split(" ")[0],
                            day: (0, moment_1.default)(new Date().getTime()).format("dddd"),
                            weekValue: getWeekNumber(today),
                        },
                    ],
                }, { new: true });
                return res.status(201).json({
                    message: "daily expense added successfully",
                    data: createExpense,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "unable to read school term",
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
            message: "Error creating school session",
            data: error.message,
        });
    }
});
exports.createDailyExpenses = createDailyExpenses;
const readTermDailyExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const school = yield schoolModel_1.default.findById(schoolID);
        if (school) {
            const getTerm = yield termModel_1.default.findById(school.presentTermID);
            let filterByMonth = lodash_1.default.groupBy(getTerm === null || getTerm === void 0 ? void 0 : getTerm.expensePayOut, "month");
            let filterByWeek = lodash_1.default.groupBy(getTerm === null || getTerm === void 0 ? void 0 : getTerm.expensePayOut, "weekValue");
            return res.status(201).json({
                message: "retriving daily expenses successfully",
                data: {
                    allData: getTerm === null || getTerm === void 0 ? void 0 : getTerm.expensePayOut,
                    week: filterByWeek,
                    month: filterByMonth,
                },
                status: 200,
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
            data: error.message,
        });
    }
});
exports.readTermDailyExpenses = readTermDailyExpenses;
