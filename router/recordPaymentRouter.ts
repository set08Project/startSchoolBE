import { Router } from "express";
import {
  deleteFeesRecord,
  getAllFeeRecords,
  recordFeesPayment,
} from "../controller/recordPaymentController";

const router: Router = Router();

router.route("/record-payment/:schoolID/:studentID").post(recordFeesPayment);

router.route("/getall-fee-records/:schoolID").get(getAllFeeRecords);

router.route("/delete-fee-record/:schoolID/:recordID").delete(deleteFeesRecord);

export default router;
