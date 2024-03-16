"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sessionHistroyModel = new mongoose_1.Schema({
    school: {
        type: mongoose_1.Types.ObjectId,
        ref: "schools",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("sessionHistroys", sessionHistroyModel);
