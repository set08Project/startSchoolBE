import { Router } from "express";
import {
  createSchoolPrincipal,
  createSchoolTeacher,
  createSchoolTeacherByAdmin,
  createSchoolTeacherByPrincipal,
  createSchoolTeacherByVicePrincipal,
  createSchoolVicePrincipal,
} from "../controller/staffController";

const router: Router = Router();

router.route("/create-teacher/:schoolID").post(createSchoolTeacher);

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
