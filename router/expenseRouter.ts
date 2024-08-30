import { Router } from "express";
import {
  createExpenditure,
  readTermBudget,
  readTermExpenditure,
  setTermlyBudget,
} from "../controller/expenditureController";

const router: Router = Router();

router.route("/create-expense/:schoolID").post(createExpenditure);

router.route("/set-budget/:schoolID").patch(setTermlyBudget);

router.route("/read-expense/:schoolID").get(readTermExpenditure);
router.route("/read-term-budget/:schoolID").get(readTermBudget);

export default router;
