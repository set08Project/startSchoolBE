import { Router } from "express";
import {
  createSchoolPrincipal,
  createSchoolTeacher,
  createSchoolTeacherByAdmin,
  createSchoolTeacherByPrincipal,
  createSchoolTeacherByVicePrincipal,
  createSchoolVicePrincipal,
  deleteStaff,
  loginStaffWithToken,
  loginTeacher,
  readSchooTeacher,
  readTeacherCookie,
  readTeacherDetail,
  updateStaffActiveness,
  updateStaffAdress,
  updateStaffAvatar,
  updateStaffGender,
  updateStaffName,
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
router.route("/login-teacher-token").post(loginStaffWithToken);
router.route("/read-teacher-cookie").get(readTeacherCookie);

router.route("/view-teacher-detail/:staffID").get(readTeacherDetail);
router.route("/update-teacher-salery/:staffID").patch(updateTeacherSalary);
router.route("/update-staffAddress/:schoolID/:stafffID").patch(updateStaffAdress);

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

router.route("/update-staffName/:schoolID/:staffID").patch(updateStaffName);
router.route("/update-staffgender/:schoolID/:staffID").patch(updateStaffGender);
router.route("/upload-staff-avatar/:staffID").patch(upload, updateStaffAvatar);

router.route("/staff-active/:studentID").patch(updateStaffActiveness);

router.route("/delete-staff/:schoolID/:staffID").delete(deleteStaff);

export default router;
