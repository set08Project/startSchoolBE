"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const articleModel = new mongoose_1.Schema({
    content: {
        type: String,
    },
    title: {
        type: String,
    },
    student: {
        type: String,
    },
    desc: {
        type: String,
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("articles", articleModel);
