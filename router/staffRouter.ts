import { Router } from "express";
import {
  createSchoolPrincipal,
  createSchoolTeacher,
  createSchoolTeacherByAdmin,
  createSchoolTeacherByPrincipal,
  createSchoolTeacherByVicePrincipal,
  createSchoolVicePrincipal,
  readSchooTeacher,
  readTeacherDetail,
  updateTeacherSalary,
} from "../controller/staffController";

const router: Router = Router();

router.route("/create-school-teacher/:schoolID").post(createSchoolTeacher);
router.route("/view-school-teacher/:schoolID").get(readSchooTeacher);

router.route("/view-teacher-detail/:staffID").get(readTeacherDetail);
router.route("/update-teacher-salery/:staffID").patch(updateTeacherSalary);

// others

router.route("/create-school-principal/:schoolID").post(createSchoolPrincipal);

router
  .route("/create-school-vice-principal/:schoolID")
  .post(createSchoolVicePrincipal);
router
  .route("/create-school-teacher-admin/:schoolID")
  .post(createSchoolTeacherByAdmin);
router
  .route("/create-school-teacher-prinicipal/:schoolID")
  .post(createSchoolTeacherByPrincipal);
router
  .route("/create-school-teacher-vice-prinicipal/:schoolID")
  .post(createSchoolTeacherByVicePrincipal);

export default router;
