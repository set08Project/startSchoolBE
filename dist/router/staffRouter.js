"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staffController_1 = require("../controller/staffController");
const router = (0, express_1.Router)();
router.route("/create-teacher/:schoolID").post(staffController_1.createSchoolTeacher);
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
exports.default = router;
