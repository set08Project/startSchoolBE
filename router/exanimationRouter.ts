import { Router } from "express";

import { fileUploads } from "../utils/multer";
import {
  createSubjectExam,
  readSubjectExamination,
  startSubjectExamination,
  readExamination,
  deleteExamination,
  randomizeSubjectExamination,
} from "../controller/examinationController";

const router: Router = Router();

// examination
router
  .route("/create-subject-examination/:classID/:subjectID")
  .post(fileUploads, createSubjectExam);

router.route("/start-subject-exam/:examID/").patch(startSubjectExamination);
router
  .route("/randomize-subject-exam/:examID/")
  .patch(randomizeSubjectExamination);

router.route("/view-subject-exam/:subjectID").get(readSubjectExamination);

router.route("/view-exam/:examID").get(readExamination);

router
  .route("/delete-exam/:teacherID/:subjectID/:examID")
  .delete(deleteExamination);

export default router;
