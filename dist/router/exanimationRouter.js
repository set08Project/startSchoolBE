"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../utils/multer");
const examinationController_1 = require("../controller/examinationController");
const router = (0, express_1.Router)();
// examination
router
    .route("/create-subject-examination-now/:classID/:subjectID")
    .post(multer_1.fileUploads, examinationController_1.createSubjectExam);
router.route("/start-subject-exam-now/:examID/").patch(examinationController_1.startSubjectExamination);
router.route("/view-subject-exam-now/:subjectID").get(examinationController_1.readSubjectExamination);
exports.default = router;
