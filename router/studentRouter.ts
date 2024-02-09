import { Router } from "express";
import {
  createSchoolStudent,
  readSchoolStudents,
  readStudentDetail,
} from "../controller/studentController";

const router: Router = Router();

router.route("/create-student/:schoolID").post(createSchoolStudent);

router.route("/read-school-student/:schoolID").get(readSchoolStudents);

router.route("/read-student-info/:StudentID").get(readStudentDetail);

export default router;
