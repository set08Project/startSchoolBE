import { Router } from "express";
import {
  createSubjectQuiz,
  deleteQuiz,
  getQuizRecords,
  readQuiz,
  readQuizes,
  readSubjectQuiz,
  getStudentQuizRecords,
  readTeacherSubjectQuiz,
  createSubjectExam,
  readSubjectExamination,
  startSubjectExamination,
} from "../controller/quizController";
import { fileUploads } from "../utils/multer";

const router: Router = Router();

// examination
// routercreate-subject-quiz
//   .route("/create-subject-examination/:classID/:subjectID")
//   .post(fileUploads, createSubjectExam);

// router.route("/start-subject-exam/:examID/").patch(startSubjectExamination);
// router.route("/view-subject-exam/:subjectID").get(readSubjectExamination);

// quiz

router
  .route("/create-subject-quiz/:classID/:subjectID")
  .post(createSubjectQuiz);

router.route("/view-subject-quiz/:subjectID").get(readSubjectQuiz);

router.route("/view-subject-quiz/:quizID").get(readTeacherSubjectQuiz);
router.route("/view-quiz/:quizID").get(readQuiz);
router.route("/view-quiz").get(readQuizes);
router.delete("/delete-quiz/:quizID", deleteQuiz);
router.route("/view-quiz-record/:studentID").get(getQuizRecords);
router.route("/quiz/:teacherID/records").get(getStudentQuizRecords);
export default router;
