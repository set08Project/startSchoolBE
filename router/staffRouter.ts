import { Router } from "express";
import {
  createSchoolPrincipal,
  createSchoolTeacher,
  createSchoolTeacherByAdmin,
  createSchoolTeacherByPrincipal,
  createSchoolTeacherByVicePrincipal,
  createSchoolVicePrincipal,
  loginTeacher,
  readSchooTeacher,
  readTeacherCookie,
  readTeacherDetail,
  updateStaffAvatar,
  updateTeacherSalary,
} from "../controller/staffController";
import multer from "multer";
const upload = multer({
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
}).single("avatar");

const router: Router = Router();

router.route("/create-school-teacher/:schoolID").post(createSchoolTeacher);
router.route("/view-school-teacher/:schoolID").get(readSchooTeacher);

router.route("/login-teacher").post(loginTeacher);
router.route("/read-teacher-cookie").get(readTeacherCookie);

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

router.route("/upload-staff-avatar/:staffID").patch(upload, updateStaffAvatar);

export default router;
