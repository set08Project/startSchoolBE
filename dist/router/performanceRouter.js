"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performanceController_1 = require("../controller/performanceController");
const router = (0, express_1.Router)();
router
    .route("/create-subject-quiz-performance/:studentID/:quizID")
    .post(performanceController_1.createQuizPerformance);
router
    .route("/view-subject-quiz-performance/:subjectID")
    .get(performanceController_1.readSubjectQuizResult);
router
    .route("/view-student-quiz-performance/:studentID")
    .get(performanceController_1.readStudentQuizResult);
router.route("/view-quiz-performance/:quizID").get(performanceController_1.readQuizResult);
exports.default = router;
