import { Router } from "express";
import {
  createExamPerformance,
  createQuizPerformance,
  readExamResult,
  readOneSubjectExamResult,
  readOneSubjectQuizResult,
  readQuizResult,
  readStudentExamResult,
  readStudentQuizResult,
  readSubjectExamResult,
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
  .route("/view-onesubject-quiz-performance/:subjectID/:quizID")
  .get(readOneSubjectQuizResult);

router
  .route("/view-student-quiz-performance/:studentID")
  .get(readStudentQuizResult);

router.route("/view-quiz-performance/:quizID").get(readQuizResult);

// Examination

router
  .route("/create-subject-exam-performance/:studentID/:examID/:subjectID")
  .post(createExamPerformance);

router
  .route("/view-subject-exam-performance/:subjectID")
  .get(readSubjectExamResult);

router
  .route("/view-onesubject-exam-performance/:subjectID/:quizID")
  .get(readOneSubjectExamResult);

router
  .route("/view-student-exam-performance/:studentID")
  .get(readStudentExamResult);

router.route("/view-exam-performance/:quizID").get(readExamResult);

export default router;
