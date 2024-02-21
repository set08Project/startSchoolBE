"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controller/studentController");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg") {
            cb(null, true);
        }
        else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
}).single("avatar");
const router = (0, express_1.Router)();
router.route("/create-student/:schoolID").post(studentController_1.createSchoolStudent);
router.route("/read-student/:schoolID").get(studentController_1.readSchoolStudents);
router.route("/read-student-info/:studentID").get(studentController_1.readStudentDetail);
router
    .route("/upload-student-avatar/:studentID")
    .patch(upload, studentController_1.updateStudentAvatar);
router.route("/login-student").post(studentController_1.loginStudent);
router.route("/read-student-cookie").get(studentController_1.readStudentCookie);
exports.default = router;
