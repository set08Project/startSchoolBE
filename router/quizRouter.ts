import { Router } from "express";
import {
  createSubjectQuiz,
  readQuiz,
  readSubjectQuiz,
  readTeacherSubjectQuiz,
} from "../controller/quizController";

const router: Router = Router();

router
  .route("/create-subject-quiz/:classID/:subjectID")
  .post(createSubjectQuiz);
router.route("/view-subject-quiz/:subjectID").get(readSubjectQuiz);
router.route("/view-subject-quiz/:quizID").get(readTeacherSubjectQuiz);
router.route("/view-quiz/:quizID").get(readQuiz);
export default router;
