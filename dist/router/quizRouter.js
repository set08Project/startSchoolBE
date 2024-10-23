"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizController_1 = require("../controller/quizController");
const router = (0, express_1.Router)();
router
    .route("/create-subject-quiz/:classID/:subjectID")
    .post(quizController_1.createSubjectQuiz);
router.route("/view-subject-quiz/:subjectID").get(quizController_1.readSubjectQuiz);
router.route("/view-subject-quiz/:quizID").get(quizController_1.readTeacherSubjectQuiz);
router.route("/view-quiz/:quizID").get(quizController_1.readQuiz);
router.route("/view-quiz").get(quizController_1.readQuizes);
router.delete("/delete-quiz/:quizID", quizController_1.deleteQuiz);
router.route("/view-quiz-record/:studentID").get(quizController_1.getQuizRecords);
router.route('/quiz/:teacherID/records').get(quizController_1.getStudentQuizRecords);
exports.default = router;
