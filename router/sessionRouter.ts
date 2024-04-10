import { Router } from "express";
import {
  createNewSchoolSession,
  createSchoolSession,
  getAllSession,
  studentsPerSession,
  termPerSession,
  updateTermPay,
  viewSchoolPresentSession,
  viewSchoolPresentSessionTerm,
  viewSchoolSession,
  viewTerm,
} from "../controller/sessionController";
import { createSchoolPaynemtReceipt } from "../controller/announcementController";

const router: Router = Router();

router.route("/create-school-session").post(createSchoolSession);
router
  .route("/create-new-school-session/:schoolID")
  .post(createNewSchoolSession);
router.route("/view-school-session/:schoolID").get(viewSchoolSession);
router.route("/update-students").patch(studentsPerSession);

router.route("/create-school-term/:sessionID").post(termPerSession);

router.route("/school-term-payment-updated/:termID").patch(updateTermPay);
router.route("/view-school-term-detail/:termID").get(viewTerm);

router.route("/payment-receipt/:schoolID").post(createSchoolPaynemtReceipt);

router
  .route("/view-present-school-session/:sessionID")
  .get(viewSchoolPresentSession);
router.route("/view-school-term/:termID").get(viewSchoolPresentSessionTerm);

router.route("/view-all-session").get(getAllSession);
export default router;
