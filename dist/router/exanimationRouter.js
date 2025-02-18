"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../utils/multer");
const examinationController_1 = require("../controller/examinationController");
const router = (0, express_1.Router)();
// examination
router
    .route("/create-subject-examination/:classID/:subjectID")
    .post(multer_1.fileUploads, examinationController_1.createSubjectExam);
router.route("/start-subject-exam/:examID/").patch(examinationController_1.startSubjectExamination);
router.route("/view-subject-exam/:subjectID").get(examinationController_1.readSubjectExamination);
router.route("/view-exam/:examID").get(examinationController_1.readExamination);
exports.default = router;
