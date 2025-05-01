import { Router } from "express";
import {
  createResultHistory,
  viewResultHistory,
} from "../controller/historicalResultController";

const router: Router = Router();

router
  .route("/create-result-history/:schoolID/:studentID")
  .post(createResultHistory);

router.route("/view-student-result-history/:studentID").get(viewResultHistory);

export default router;
