import { Router } from "express";
import {
  createSchoolStudent,
  loginStudent,
  readSchoolStudents,
  readStudentCookie,
  readStudentDetail,
  updateStudentAvatar,
} from "../controller/studentController";
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

router.route("/create-student/:schoolID").post(createSchoolStudent);

router.route("/read-student/:schoolID").get(readSchoolStudents);

router.route("/read-student-info/:studentID").get(readStudentDetail);

router
  .route("/upload-student-avatar/:studentID")
  .patch(upload, updateStudentAvatar);

router.route("/login-student").post(loginStudent);
router.route("/read-student-cookie").get(readStudentCookie);

export default router;
