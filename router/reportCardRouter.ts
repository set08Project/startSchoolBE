import { Router } from "express";
import { createStudentreportCard } from "../controller/reportCardController";
import {
  adminReportRemark,
  classTeacherReportRemark,
  createReportCardEntry,
  studentReportRemark,
  updatePsyChoReport,
  updateReportScores,
} from "../controller/cardReportController";

const router: Router = Router();

router
  .route("/create-report-card/:schoolID/:staffID/:studentID")
  .post(createStudentreportCard);

router
  .route("/create-report-card/:teacherID/:studentID")
  .post(createReportCardEntry);

router
  .route("/update-report-card/:teacherID/:studentID")
  .patch(updateReportScores);

router
  .route("/update-psycho-report/:teacherID/:studentID")
  .patch(updatePsyChoReport);

router
  .route("/admin-report-card/:schoolID/:studentID")
  .patch(adminReportRemark);

router
  .route("/teacher-report-card/:teacherID/:studentID")
  .patch(classTeacherReportRemark);

router.route("/student-report-card/:studentID").get(studentReportRemark);

export default router;
