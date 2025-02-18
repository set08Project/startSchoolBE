import { Router } from "express";

import { fileUploads } from "../utils/multer";
import {
  createSubjectExam,
  readSubjectExamination,
  startSubjectExamination,
  readExamination,
} from "../controller/examinationController";

const router: Router = Router();

// examination
router
  .route("/create-subject-examination/:classID/:subjectID")
  .post(fileUploads, createSubjectExam);

router.route("/start-subject-exam/:examID/").patch(startSubjectExamination);

router.route("/view-subject-exam/:subjectID").get(readSubjectExamination);

router.route("/view-exam/:examID").get(readExamination);

export default router;
