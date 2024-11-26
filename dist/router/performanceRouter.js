"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performanceController_1 = require("../controller/performanceController");
const router = (0, express_1.Router)();
router
    .route("/create-subject-quiz-performance/:studentID/:quizID/:subjectID")
    .post(performanceController_1.createQuizPerformance);
router
    .route("/view-subject-quiz-performance/:subjectID")
    .get(performanceController_1.readSubjectQuizResult);
router
    .route("/view-onesubject-quiz-performance/:subjectID/:quizID")
    .get(performanceController_1.readOneSubjectQuizResult);
router
    .route("/view-student-quiz-performance/:studentID")
    .get(performanceController_1.readStudentQuizResult);
router.route("/view-quiz-performance/:quizID").get(performanceController_1.readQuizResult);
// Examination
router
    .route("/create-subject-exam-performance/:studentID/:examID/:subjectID")
    .post(performanceController_1.createExamPerformance);
router
    .route("/view-subject-exam-performance/:subjectID")
    .get(performanceController_1.readSubjectExamResult);
router
    .route("/view-onesubject-exam-performance/:subjectID/:quizID")
    .get(performanceController_1.readOneSubjectExamResult);
router
    .route("/view-student-exam-performance/:studentID")
    .get(performanceController_1.readStudentExamResult);
router.route("/view-exam-performance/:quizID").get(performanceController_1.readExamResult);
exports.default = router;
