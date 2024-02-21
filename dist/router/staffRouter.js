"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staffController_1 = require("../controller/staffController");
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
router.route("/create-school-teacher/:schoolID").post(staffController_1.createSchoolTeacher);
router.route("/view-school-teacher/:schoolID").get(staffController_1.readSchooTeacher);
router.route("/login-teacher").post(staffController_1.loginTeacher);
router.route("/read-teacher-cookie").get(staffController_1.readTeacherCookie);
router.route("/view-teacher-detail/:staffID").get(staffController_1.readTeacherDetail);
router.route("/update-teacher-salery/:staffID").patch(staffController_1.updateTeacherSalary);
// others
router.route("/create-school-principal/:schoolID").post(staffController_1.createSchoolPrincipal);
router
    .route("/create-school-vice-principal/:schoolID")
    .post(staffController_1.createSchoolVicePrincipal);
router
    .route("/create-school-teacher-admin/:schoolID")
    .post(staffController_1.createSchoolTeacherByAdmin);
router
    .route("/create-school-teacher-prinicipal/:schoolID")
    .post(staffController_1.createSchoolTeacherByPrincipal);
router
    .route("/create-school-teacher-vice-prinicipal/:schoolID")
    .post(staffController_1.createSchoolTeacherByVicePrincipal);
router.route("/upload-staff-avatar/:staffID").patch(upload, staffController_1.updateStaffAvatar);
exports.default = router;
