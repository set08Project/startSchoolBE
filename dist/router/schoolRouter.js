"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schoolController_1 = require("../controller/schoolController");
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
router.route("/register-school/").post(schoolController_1.createSchool);
router.route("/login-school/").post(schoolController_1.loginSchool);
router.route("/delete-school/:schoolID").delete(schoolController_1.deleteSchool);
router.route("/get-school-by-name/:schoolName").get(schoolController_1.viewSchoolStatusByName);
router.route("/verify-school/:schoolID").get(schoolController_1.verifySchool);
router.route("/view-school/:schoolID").get(schoolController_1.viewSchoolStatus);
router.route("/view-all-school").get(schoolController_1.viewAllSchools);
router.route("/logout-school").delete(schoolController_1.logoutSchool);
router.route("/read-school-cookie").get(schoolController_1.readSchoolCookie);
router.route("/change-school-name/:schoolID").patch(schoolController_1.changeSchoolName);
router.route("/change-school-location/:schoolID").patch(schoolController_1.changeSchoolAddress);
router
    .route("/upload-school-avatar/:schoolID")
    .patch(upload, schoolController_1.updateSchoolAvatar);
router.route("/change-school-tag/:schoolID").patch(schoolController_1.changeSchoolTag);
router
    .route("/change-school-started/:schoolID")
    .patch(schoolController_1.updateSchoolStartPossition);
exports.default = router;
