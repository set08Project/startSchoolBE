import { Router } from "express";
import {
  createClassTimeTable,
  readClassTimeTable,
  readTeacherSchedule,
} from "../controller/timeTableController";

const router: Router = Router();

router
  .route("/create-time-table/:schoolID/:classID")
  .post(createClassTimeTable);
router.route("/view-time-table/:classID").get(readClassTimeTable);
router.route("/view-teacher-schedule/:teacherID").get(readTeacherSchedule);
export default router;
