"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classController_1 = require("../controller/classController");
const router = (0, express_1.Router)();
router.route("/create-classroom/:schoolID").post(classController_1.createSchoolClasses);
router.route("/view-classrooms/:schoolID").get(classController_1.viewSchoolClasses);
router.route("/view-classroom-info/:classID").get(classController_1.viewClassRM);
router
    .route("/view-classroom-info-timetable/:classID")
    .get(classController_1.viewClassesByTimeTable);
router.route("/view-classroom-info-subject/:classID").get(classController_1.viewClassesBySubject);
router.route("/view-classroom-info-student/:classID").get(classController_1.viewClassesByStudent);
router.route("/view-classroom-info-name/").post(classController_1.viewSchoolClassesByName);
router.route("/view-classroom-performance/:classID").get(classController_1.viewClassTopStudent);
router
    .route("/update-classrooms-teacher/:schoolID/:classID")
    .patch(classController_1.updateSchoolClassTeacher);
router.route("/delete-classrooms/:schoolID/:classID").delete(classController_1.deleteSchoolClass);
exports.default = router;
