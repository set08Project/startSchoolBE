import { Router } from "express";

import { fileUploads } from "../utils/multer";
import {
  createSubjectExam,
  readSubjectExamination,
  startSubjectExamination,
} from "../controller/examinationController";

const router: Router = Router();

// examination
router
  .route("/create-subject-examination-now/:classID/:subjectID")
  .post(fileUploads, createSubjectExam);

router.route("/start-subject-exam-now/:examID/").patch(startSubjectExamination);
router.route("/view-subject-exam-now/:subjectID").get(readSubjectExamination);

export default router;
