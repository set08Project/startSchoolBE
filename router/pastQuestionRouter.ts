import { Router } from "express";
import {
  createPastQuestionHistory,
  getOneStudentHistory,
} from "../controller/pastQuestionController";

const router: Router = Router();

router
  .route("/create-question-history/:studentID")
  .post(createPastQuestionHistory);
router.route("/view-question-history/:studentID").get(getOneStudentHistory);

export default router;
