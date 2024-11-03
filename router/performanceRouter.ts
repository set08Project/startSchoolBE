import { Router } from "express";
import {
  createQuizPerformance,
  readOneSubjectQuizResult,
  readQuizResult,
  readStudentQuizResult,
  readSubjectQuizResult,
} from "../controller/performanceController";

const router: Router = Router();

router
  .route("/create-subject-quiz-performance/:studentID/:quizID/:subjectID")
  .post(createQuizPerformance);

router
  .route("/view-subject-quiz-performance/:subjectID")
  .get(readSubjectQuizResult);

router
  .route("/view-onesubject-quiz-performance/:subjectID")
  .get(readOneSubjectQuizResult);

router
  .route("/view-student-quiz-performance/:studentID")
  .get(readStudentQuizResult);

router.route("/view-quiz-performance/:quizID").get(readQuizResult);
export default router;
