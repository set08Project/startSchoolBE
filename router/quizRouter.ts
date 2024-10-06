import { Router } from "express";
import {
  createSubjectQuiz,
  readQuiz,
  readSubjectQuiz,
  readTeacherSubjectQuiz,
  updateQuiz,
} from "../controller/quizController";

const router: Router = Router();

router
  .route("/create-subject-quiz/:classID/:subjectID")
  .post(createSubjectQuiz);
router.route("/view-subject-quiz/:subjectID").get(readSubjectQuiz);
router.route("/view-subject-quiz/:quizID").get(readTeacherSubjectQuiz);
router.route("/update-quiz/:subjectID/:quizID").patch(updateQuiz);
router.route("/view-quiz/:quizID").get(readQuiz);
export default router;
