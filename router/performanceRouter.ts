import { Router } from "express";
import {
  createExamPerformance,
  createMidTestPerformance,
  createQuizPerformance,
  readExamResult,
  readMidTestResult,
  readOneSubjectExamResult,
  readOneSubjectMidTestResult,
  readOneSubjectQuizResult,
  readQuizResult,
  readStudentExamResult,
  readStudentMidTestResult,
  readStudentQuizResult,
  readSubjectExamResult,
  readSubjectMidTestResult,
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
  .route("/create-subject-exam-performance/:studentID/:quizID/:subjectID")
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

// Mid Test

router
  .route("/create-subject-mid-test-performance/:studentID/:quizID/:subjectID")
  .post(createMidTestPerformance);

router
  .route("/view-subject-mid-test-performance/:subjectID")
  .get(readSubjectMidTestResult);

router
  .route("/view-onesubject-mid-test-performance/:subjectID/:quizID")
  .get(readOneSubjectMidTestResult);

router
  .route("/view-student-mid-test-performance/:studentID")
  .get(readStudentMidTestResult);

router.route("/view-mid-test-performance/:quizID").get(readMidTestResult);

export default router;
