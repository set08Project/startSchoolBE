import { Router } from "express";
import {
  createNewSchoolSession,
  createSchoolSession,
  studentsPerSession,
  termPerSession,
  viewSchoolSession,
} from "../controller/sessionController";

const router: Router = Router();

router.route("/create-school-session").post(createSchoolSession);
router
  .route("/create-new-school-session/:schoolID")
  .post(createNewSchoolSession);
router.route("/view-school-session/:schoolID").get(viewSchoolSession);
router.route("/update-students").patch(studentsPerSession);
router.route("/edit-school-term").patch(termPerSession);
export default router;
