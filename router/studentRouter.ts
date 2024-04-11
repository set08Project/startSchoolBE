import { Router } from "express";
import {
  createSchoolStudent,
  createStorePurchased,
  loginStudent,
  readSchoolStudents,
  readStudentCookie,
  readStudentDetail,
  updatePurchaseRecord,
  updateStudent1stFees,
  updateStudent2ndFees,
  updateStudent3rdFees,
  updateStudentAvatar,
  updateStudentParentEmail,
  viewStorePurchased,
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

router
  .route("/update-student-fees-1st/:schoolID/:studentID")
  .patch(updateStudent1stFees);
router
  .route("/update-student-fees-2nd/:schoolID/:studentID")
  .patch(updateStudent2ndFees);
router
  .route("/update-student-fees-3rd/:schoolID/:studentID")
  .patch(updateStudent3rdFees);

router.route("/create-student/:schoolID").post(createSchoolStudent);

router.route("/read-student/:schoolID").get(readSchoolStudents);

router.route("/read-student-info/:studentID").get(readStudentDetail);

router
  .route("/upload-student-avatar/:studentID")
  .patch(upload, updateStudentAvatar);

router.route("/login-student").post(loginStudent);
router.route("/read-student-cookie").get(readStudentCookie);
router
  .route("/update-parent-email/:schoolID/:studentID")
  .patch(updateStudentParentEmail);
router.route("/purchase/:studentID").post(createStorePurchased);
router.route("/view-purchase/:studentID").get(viewStorePurchased);

export default router;
