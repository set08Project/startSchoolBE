"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subjectController_1 = require("../controller/subjectController");
const router = (0, express_1.Router)();
router.route("/create-subject/:schoolID").post(subjectController_1.createSchoolSubject);
router.route("/view-subjects/:schoolID").get(subjectController_1.viewSchoolSubjects);
router
    .route("/update-subject-teacher/:schoolID/:subjectID")
    .patch(subjectController_1.updateSchoolSubjectTeacher);
router
    .route("/update-subject-teacher/:schoolID/:subjectID")
    .patch(subjectController_1.updateSchoolSubjectTeacher);
router
    .route("/delete-subject/:schoolID/:subjectID")
    .delete(subjectController_1.deleteSchoolSubject);
exports.default = router;
