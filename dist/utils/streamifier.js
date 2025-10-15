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
exports.uploadDataUri = exports.uploadBuffer = exports.streamUpload = void 0;
const cloudinary_1 = __importDefault(require("./cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
const streamUpload = (req) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        let stream = cloudinary_1.default.uploader.upload_stream((error, result) => {
            if (result) {
                return resolve(result);
            }
            else {
                return reject(error);
            }
        });
        streamifier_1.default.createReadStream(req.file.buffer).pipe(stream);
    }));
});
exports.streamUpload = streamUpload;
// Upload a Buffer to Cloudinary using an upload stream
const uploadBuffer = (buffer, folder) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const options = {};
        if (folder)
            options.folder = folder;
        const stream = cloudinary_1.default.uploader.upload_stream(options, (err, result) => {
            if (err)
                return reject(err);
            return resolve(result);
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
});
exports.uploadBuffer = uploadBuffer;
// Upload a data URI (data:...;base64,...) by decoding to Buffer then uploading
const uploadDataUri = (dataUri, folder) => __awaiter(void 0, void 0, void 0, function* () {
    const match = dataUri.match(/^data:(.+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid data URI");
    }
    const base64 = match[2];
    const buffer = Buffer.from(base64, "base64");
    return (0, exports.uploadBuffer)(buffer, folder);
});
exports.uploadDataUri = uploadDataUri;
