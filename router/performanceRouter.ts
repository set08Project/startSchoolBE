import { Router } from "express";
import {
  createQuizPerformance,
  readQuizResult,
  readStudentQuizResult,
  readSubjectQuizResult,
} from "../controller/performanceController";

const router: Router = Router();

router
  .route("/create-subject-quiz-performance/:studentID/:quizID")
  .post(createQuizPerformance);

router
  .route("/view-subject-quiz-performance/:subjectID")
  .get(readSubjectQuizResult);

router
  .route("/view-student-quiz-performance/:studentID")
  .get(readStudentQuizResult);

router.route("/view-quiz-performance/:quizID").get(readQuizResult);
export default router;
