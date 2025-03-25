import { Router } from "express";
import { createStudentreportCard } from "../controller/reportCardController";
import {
  adminReportRemark,
  classTeacherReportRemark,
  createReportCardEntry,
  studentReportRemark,
  classTeacherPhychoReportRemark,
  updateReportScores,
  createMidReportCardEntry,
  studentMidReportRemark,
  classTeacherMidReportRemark,
  adminMidReportRemark,
} from "../controller/cardReportController";

const router: Router = Router();

router
  .route("/create-report-card/:schoolID/:staffID/:studentID")
  .post(createStudentreportCard);

router
  .route("/create-report-card/:teacherID/:studentID")
  .post(createReportCardEntry);

router
  .route("/create-mid-report-card/:teacherID/:studentID")
  .post(createMidReportCardEntry);

router
  .route("/update-report-card/:teacherID/:studentID")
  .patch(updateReportScores);

router
  .route("/update-psycho-report/:teacherID/:studentID")
  .patch(classTeacherPhychoReportRemark);

router
  .route("/admin-report-card/:schoolID/:studentID")
  .patch(adminReportRemark);

router
  .route("/teacher-report-card/:teacherID/:studentID")
  .patch(classTeacherReportRemark);

router
  .route("/admin-mid-report-card/:schoolID/:studentID")
  .patch(adminMidReportRemark);

router
  .route("/teacher-mid-report-card/:teacherID/:studentID")
  .patch(classTeacherMidReportRemark);

router.route("/student-report-card/:studentID").get(studentReportRemark);
router.route("/student-mid-report-card/:studentID").get(studentMidReportRemark);

export default router;
