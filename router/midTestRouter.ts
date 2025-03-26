import { Router } from "express";

import { fileUploads } from "../utils/multer";
import {
  createSubjectMidTest,
  readMidTest,
  readSubjectMidTest,
  startSubjectMidTest,
  deleteMidTest,
  updateSubjectMidTest,
} from "../controller/midTestController";

const router: Router = Router();

// examination
router
  .route("/create-subject-mid-test/:classID/:subjectID")
  .post(fileUploads, createSubjectMidTest);

router.route("/start-subject-mid-test/:midTestID/").patch(startSubjectMidTest);
router
  .route("/update-subject-mid-test/:midTestID/")
  .patch(updateSubjectMidTest);

router.route("/view-subject-mid-test/:subjectID").get(readSubjectMidTest);

router.route("/view-mid-test/:midTestID").get(readMidTest);
router
  .route("/delete-mid-test/:teacherID/:subjectID/:midTestID")
  .delete(deleteMidTest);

export default router;
