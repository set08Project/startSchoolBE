"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recordPaymentController_1 = require("../controller/recordPaymentController");
const router = (0, express_1.Router)();
router.route("/record-payment/:schoolID/:studentID").post(recordPaymentController_1.recordFeesPayment);
router.route("/getall-fee-records/:schoolID").get(recordPaymentController_1.getAllFeeRecords);
router.route("/delete-fee-record/:schoolID/:recordID").delete(recordPaymentController_1.deleteFeesRecord);
exports.default = router;
