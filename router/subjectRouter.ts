import { Router } from "express";
import {
  createSchoolSubject,
  updateSchoolSubjectTeacher,
  viewSchoolSubjects,
  deleteSchoolSubject,
  viewSubjectDetail,
} from "../controller/subjectController";

const router: Router = Router();

router.route("/create-subject/:schoolID").post(createSchoolSubject);

router.route("/view-subjects/:schoolID").get(viewSchoolSubjects);
router.route("/view-subjects-info/:subjectID").get(viewSubjectDetail);

router
  .route("/update-subject-teacher/:schoolID/:subjectID")
  .patch(updateSchoolSubjectTeacher);

// router
//   .route("/update-subject-teacher/:schoolID/:subjectID")
//   .patch(updateSchoolSubjectTeacher);

router
  .route("/delete-subject/:schoolID/:subjectID")
  .delete(deleteSchoolSubject);

export default router;
