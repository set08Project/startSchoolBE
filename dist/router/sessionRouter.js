"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionController_1 = require("../controller/sessionController");
const router = (0, express_1.Router)();
router.route("/create-school-session").post(sessionController_1.createSchoolSession);
router
    .route("/create-new-school-session/:schoolID")
    .post(sessionController_1.createNewSchoolSession);
router.route("/view-school-session/:schoolID").get(sessionController_1.viewSchoolSession);
router.route("/update-students").patch(sessionController_1.studentsPerSession);
router.route("/create-school-term/:sessionID").post(sessionController_1.termPerSession);
router
    .route("/view-present-school-session/:sessionID")
    .get(sessionController_1.viewSchoolPresentSession);
router.route("/view-school-term/:termID").get(sessionController_1.viewSchoolPresentSessionTerm);
router.route("/view-all-session").get(sessionController_1.getAllSession);
router
    .route("/view-class-result-history/:classID")
    .get(sessionController_1.getAllClassSessionResults);
router.route("/create-history-session/:classID").post(sessionController_1.createSessionHistory);
router
    .route("/create-school-history-session/:schoolID")
    .post(sessionController_1.createSessionHistory);
// router.route("/create-school-term-history/:session").post(createSessionHistory);
exports.default = router;
