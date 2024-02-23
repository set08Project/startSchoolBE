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
exports.viewSchoolStore = exports.createStore = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const mongoose_1 = require("mongoose");
const storeModel_1 = __importDefault(require("../model/storeModel"));
const streamifier_1 = require("../utils/streamifier");
const createStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { title, description, cost } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const { secure_url, public_id } = yield (0, streamifier_1.streamUpload)(req);
        if (school) {
            const store = yield storeModel_1.default.create({
                title,
                description,
                cost: parseInt(cost),
                avatar: secure_url,
                avatarID: public_id,
            });
            school === null || school === void 0 ? void 0 : school.store.push(new mongoose_1.Types.ObjectId(store._id));
            school.save();
            return res.status(201).json({
                message: "remark created successfully",
                data: store,
                status: 201,
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
exports.createStore = createStore;
const viewSchoolStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const student = yield schoolModel_1.default.findById(schoolID).populate({
            path: "store",
        });
        return res.status(200).json({
            message: "viewing school store",
            data: student === null || student === void 0 ? void 0 : student.store,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
});
exports.viewSchoolStore = viewSchoolStore;
