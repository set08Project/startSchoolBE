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
exports.default = router;
