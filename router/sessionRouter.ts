import { Router } from "express";
import {
  createNewSchoolSession,
  createSchoolSession,
  studentsPerSession,
  termPerSession,
  viewSchoolPresentSession,
  viewSchoolPresentSessionTerm,
  viewSchoolSession,
} from "../controller/sessionController";

const router: Router = Router();

router.route("/create-school-session").post(createSchoolSession);
router
  .route("/create-new-school-session/:schoolID")
  .post(createNewSchoolSession);
router.route("/view-school-session/:schoolID").get(viewSchoolSession);
router.route("/update-students").patch(studentsPerSession);
router.route("/create-school-term/:sessionID").post(termPerSession);

router.route("/view-school-session/:sessionID").get(viewSchoolPresentSession);
router.route("/view-school-term/:termID").get(viewSchoolPresentSessionTerm);
export default router;
