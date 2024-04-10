import { Router } from "express";
import {
  createPayment,
  createPaymentAccount,
  getBankAccount,
  makePayment,
  paymentFromStore,
  verifyTransaction,
  viewSchoolPayment,
} from "../controller/paymentController";

const router: Router = Router();

router.route("/payment/:schoolID").post(createPayment);

router.route("/get-banks/:schoolID").get(getBankAccount);

router.route("/payment/:schoolID").get(viewSchoolPayment);
router.route("/store-payment/:schoolID").post(paymentFromStore);
router.route("/create-payment-account/:schoolID").post(createPaymentAccount);

// selected
router.route("/make-payment/:schoolID").post(makePayment);
router.route("/verify-payment/:ref").get(verifyTransaction);

export default router;
