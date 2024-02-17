import { Router } from "express";
import {
  createSchoolClasses,
  deleteSchoolClass,
  updateSchoolClassTeacher,
  viewClassRM,
  viewClassTopStudent,
  viewClassesByStudent,
  viewClassesBySubject,
  viewClassesByTimeTable,
  viewSchoolClasses,
  viewSchoolClassesByName,
} from "../controller/classController";

const router: Router = Router();

router.route("/create-classroom/:schoolID").post(createSchoolClasses);

router.route("/view-classrooms/:schoolID").get(viewSchoolClasses);
router.route("/view-classroom-info/:classID").get(viewClassRM);

router
  .route("/view-classroom-info-timetable/:classID")
  .get(viewClassesByTimeTable);

router.route("/view-classroom-info-subject/:classID").get(viewClassesBySubject);

router.route("/view-classroom-info-student/:classID").get(viewClassesByStudent);

router.route("/view-classroom-info-name/").post(viewSchoolClassesByName);
router.route("/view-classroom-performance/:classID").get(viewClassTopStudent);

router
  .route("/update-classrooms-teacher/:schoolID/:classID")
  .patch(updateSchoolClassTeacher);

router.route("/delete-classrooms/:schoolID/:classID").delete(deleteSchoolClass);

export default router;
