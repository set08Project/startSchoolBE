"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classController_1 = require("../controller/classController");
const router = (0, express_1.Router)();
router.route("/create-classroom/:schoolID").post(classController_1.createSchoolClasses);
router.route("/view-classrooms/:schoolID").get(classController_1.viewSchoolClasses);
router
    .route("/update-classrooms-teacher/:schoolID/:classID")
    .patch(classController_1.updateSchoolClassTeacher);
router.route("/delete-classrooms/:schoolID/:classID").delete(classController_1.deleteSchoolClass);
exports.default = router;
