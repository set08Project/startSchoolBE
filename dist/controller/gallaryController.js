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
exports.viewSchoolGallary = exports.createRestrictedSchoolGallary = exports.createSchoolGallary = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const mongoose_1 = require("mongoose");
const streamifier_1 = require("../utils/streamifier");
const gallaryModel_1 = __importDefault(require("../model/gallaryModel"));
const createSchoolGallary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const { title, description } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID);
        const { secure_url, public_id } = yield (0, streamifier_1.streamUpload)(req);
        if (school) {
            const store = yield gallaryModel_1.default.create({
                title,
                description,
                avatar: secure_url,
                avatarID: public_id,
            });
            school === null || school === void 0 ? void 0 : school.gallaries.push(new mongoose_1.Types.ObjectId(store._id));
            school.save();
            return res.status(201).json({
                message: "image uploaded gallary successfully",
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
exports.createSchoolGallary = createSchoolGallary;
const createRestrictedSchoolGallary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { schoolID } = req.params;
        const { title, description } = req.body;
        const school = yield schoolModel_1.default.findById(schoolID).populate({
            path: "gallaries",
        });
        if (school) {
            if (((_a = school === null || school === void 0 ? void 0 : school.gallaries) === null || _a === void 0 ? void 0 : _a.length) > 10) {
                return res.status(404).json({
                    message: "Please upgrade your account to upload more images",
                    status: 404,
                });
            }
            else {
                const { secure_url, public_id } = yield (0, streamifier_1.streamUpload)(req);
                const gallary = yield gallaryModel_1.default.create({
                    title,
                    description,
                    avatar: secure_url,
                    avatarID: public_id,
                });
                school === null || school === void 0 ? void 0 : school.gallaries.push(new mongoose_1.Types.ObjectId(gallary._id));
                school.save();
                return res.status(201).json({
                    message: "image uploaded gallary successfully",
                    data: gallary,
                    status: 201,
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
exports.createRestrictedSchoolGallary = createRestrictedSchoolGallary;
const viewSchoolGallary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolID } = req.params;
        const gallary = yield schoolModel_1.default.findById(schoolID).populate({
            path: "gallaries",
        });
        return res.status(200).json({
            message: "viewing school gallaries",
            data: gallary === null || gallary === void 0 ? void 0 : gallary.gallaries,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school session",
        });
    }
});
exports.viewSchoolGallary = viewSchoolGallary;
