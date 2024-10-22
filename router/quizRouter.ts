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
} from "../controller/quizController";

const router: Router = Router();

router
  .route("/create-subject-quiz/:classID/:subjectID")
  .post(createSubjectQuiz);   
router.route("/view-subject-quiz/:subjectID").get(readSubjectQuiz);
router.route("/view-subject-quiz/:quizID").get(readTeacherSubjectQuiz);         
router.route("/view-quiz/:quizID").get(readQuiz);
router.route("/view-quiz").get(readQuizes);
router.delete("/delete-quiz/:quizID", deleteQuiz);
router.route("/view-quiz-record/:studentID").get(getQuizRecords);
router.route('/quiz/:teacherID/records').get(getStudentQuizRecords);
export default router;
