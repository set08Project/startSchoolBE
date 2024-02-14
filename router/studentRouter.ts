import { Router } from "express";
import {
  createSchoolStudent,
  readSchoolStudents,
  readStudentDetail,
} from "../controller/studentController";

const router: Router = Router();

router.route("/create-student/:schoolID").post(createSchoolStudent);

router.route("/read-student/:schoolID").get(readSchoolStudents);

router.route("/read-student-info/:studentID").get(readStudentDetail);

export default router;
