import { Router } from "express";
import {
  assignClassMonitor,
  changeStudentClass,
  createBulkSchoolStudent,
  createSchoolFeePayment,
  createSchoolStudent,
  createStorePurchased,
  createStorePurchasedTeacher,
  deleteAllStudents,
  deleteStudent,
  loginStudent,
  loginStudentWithToken,
  readSchoolStudents,
  readStudentCookie,
  readStudentDetail,
  updatePurchaseRecord,
  updateSchoolSchoolFee,
  updateSchoolStorePurchased,
  updateStudent1stFees,
  updateStudent2ndFees,
  updateStudent3rdFees,
  updateStudentAddress,
  updateStudentAvatar,
  updateStudentFirstName,
  updateStudentGender,
  updateStudentLastName,
  updateStudentParentEmail,
  updateStudentParentNumber,
  updateStudentPhone,
  viewSchoolFeeRecord,
  viewSchoolSchoolFeeRecord,
  viewSchoolStorePurchased,
  viewStorePurchased,
  viewStorePurchasedTeacher,
} from "../controller/studentController";
import multer from "multer";
import { fileUpload } from "../utils/multer";

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
router
  .route("/create-bulk-student/:schoolID/")
  .post(fileUpload, createBulkSchoolStudent);

router.route("/read-student/:schoolID").get(readSchoolStudents);

router.route("/read-student-info/:studentID").get(readStudentDetail);

router
  .route("/upload-student-avatar/:studentID")
  .patch(upload, updateStudentAvatar);

router.route("/login-student-token").post(loginStudentWithToken);
router.route("/login-student").post(loginStudent);

router.route("/read-student-cookie").get(readStudentCookie);
router
  .route("/update-parent-email/:schoolID/:studentID")
  .patch(updateStudentParentEmail);

router.route("/purchase/:studentID").post(createStorePurchased);

router.route("/pay-student-schoolfee/:studentID").post(createSchoolFeePayment);

router
  .route("/view-student-schoolfee-detail/:studentID")
  .get(viewSchoolFeeRecord);

router
  .route("/view-school-schoolfee-detail/:schoolID")
  .get(viewSchoolSchoolFeeRecord);

router.route("/view-purchase/:studentID").get(viewStorePurchased);

router
  .route("/update-school-school-fee/:schoolFeeID")
  .post(updateSchoolSchoolFee);

router.route("/view-school-purchase/:schoolID").get(viewSchoolStorePurchased);

router.route("/teacher-purchase/:staffID").post(createStorePurchasedTeacher);

router.route("/view-teacher-purchase/:staffID").get(viewStorePurchasedTeacher);

router
  .route("/assign-class-monitor/:teacherID/:studentID")
  .patch(assignClassMonitor);

router.route("/change-student-class/:studentID").patch(changeStudentClass);

router.route("/delete-student/:schoolID/:studentID").delete(deleteStudent);
<<<<<<< HEAD
router
  .route("/update-student-firstname/:schoolID/:studentID")
  .patch(updateStudentFirstName);
router
  .route("/update-student-lastname/:schoolID/:studentID")
  .patch(updateStudentLastName);

router
  .route("/update-student-address/:schoolID/:studentID")
  .patch(updateStudentAddress);

router
  .route("/update-parent-number/:schoolID/:studentID")
  .patch(updateStudentParentNumber);

router
  .route("/update-student-gender/:schoolID/:studentID")
  .patch(updateStudentGender);

router
  .route("/update-student-phone/:schoolID/:studentID")
  .patch(updateStudentPhone);
=======
router.route("/delete-all-students/:schoolID").delete(deleteAllStudents);
>>>>>>> 882e412986534dc5785f2c99fea171b136082c1e

export default router;
