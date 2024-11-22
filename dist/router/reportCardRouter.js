"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportCardController_1 = require("../controller/reportCardController");
const cardReportController_1 = require("../controller/cardReportController");
const router = (0, express_1.Router)();
router
    .route("/create-report-card/:schoolID/:staffID/:studentID")
    .post(reportCardController_1.createStudentreportCard);
router
    .route("/create-report-card/:teacherID/:studentID")
    .post(cardReportController_1.createReportCardEntry);
router
    .route("/update-report-card/:teacherID/:studentID")
    .patch(cardReportController_1.updateReportScores);
router
    .route("/update-psycho-report/:teacherID/:studentID")
    .patch(cardReportController_1.classTeacherPhychoReportRemark);
router
    .route("/admin-report-card/:schoolID/:studentID")
    .patch(cardReportController_1.adminReportRemark);
router
    .route("/teacher-report-card/:teacherID/:studentID")
    .patch(cardReportController_1.classTeacherReportRemark);
router.route("/student-report-card/:studentID").get(cardReportController_1.studentReportRemark);
exports.default = router;
