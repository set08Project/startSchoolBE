import { Router } from "express";
import {
  createSubjectQuiz,
  readSubjectQuiz,
  readTeacherSubjectQuiz,
} from "../controller/quizController";

const router: Router = Router();

router
  .route("/create-subject-quiz/:classID/:subjectID")
  .post(createSubjectQuiz);
router.route("/view-subject-quiz/:subjectID").get(readSubjectQuiz);
router.route("/view-teacher-quiz/:teacherID").get(readTeacherSubjectQuiz);
export default router;
