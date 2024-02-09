import { Router } from "express";
import {
  createSchoolClasses,
  deleteSchoolClass,
  updateSchoolClassTeacher,
  viewClassRM,
  viewSchoolClasses,
} from "../controller/classController";

const router: Router = Router();

router.route("/create-classroom/:schoolID").post(createSchoolClasses);

router.route("/view-classrooms/:schoolID").get(viewSchoolClasses);
router.route("/view-classroom-info/:classID").get(viewClassRM);

router
  .route("/update-classrooms-teacher/:schoolID/:classID")
  .patch(updateSchoolClassTeacher);

router.route("/delete-classrooms/:schoolID/:classID").delete(deleteSchoolClass);

export default router;
