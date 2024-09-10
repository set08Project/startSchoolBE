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
router
    .route("/update-student-fees-1st/:schoolID/:studentID")
    .patch(studentController_1.updateStudent1stFees);
router
    .route("/update-student-fees-2nd/:schoolID/:studentID")
    .patch(studentController_1.updateStudent2ndFees);
router
    .route("/update-student-fees-3rd/:schoolID/:studentID")
    .patch(studentController_1.updateStudent3rdFees);
router.route("/create-student/:schoolID").post(studentController_1.createSchoolStudent);
router.route("/read-student/:schoolID").get(studentController_1.readSchoolStudents);
router.route("/read-student-info/:studentID").get(studentController_1.readStudentDetail);
router
    .route("/upload-student-avatar/:studentID")
    .patch(upload, studentController_1.updateStudentAvatar);
router.route("/login-student-token").post(studentController_1.loginStudentWithToken);
router.route("/login-student").post(studentController_1.loginStudent);
router.route("/read-student-cookie").get(studentController_1.readStudentCookie);
router
    .route("/update-parent-email/:schoolID/:studentID")
    .patch(studentController_1.updateStudentParentEmail);
router.route("/purchase/:studentID").post(studentController_1.createStorePurchased);
router.route("/pay-student-schoolfee/:studentID").post(studentController_1.createSchoolFeePayment);
router
    .route("/view-student-schoolfee-detail/:studentID")
    .get(studentController_1.viewSchoolFeeRecord);
router
    .route("/view-school-schoolfee-detail/:schoolID")
    .get(studentController_1.viewSchoolSchoolFeeRecord);
router.route("/view-purchase/:studentID").get(studentController_1.viewStorePurchased);
router
    .route("/update-school-school-fee/:schoolFeeID")
    .post(studentController_1.updateSchoolSchoolFee);
router.route("/view-school-purchase/:schoolID").get(studentController_1.viewSchoolStorePurchased);
router.route("/teacher-purchase/:staffID").post(studentController_1.createStorePurchasedTeacher);
router.route("/view-teacher-purchase/:staffID").get(studentController_1.viewStorePurchasedTeacher);
router
    .route("/assign-class-monitor/:teacherID/:studentID")
    .patch(studentController_1.assignClassMonitor);
router.route("/change-student-class/:studentID").patch(studentController_1.changeStudentClass);
router.route("/delete-student/:schoolID/:studentID").delete(studentController_1.deleteStudent);
exports.default = router;
