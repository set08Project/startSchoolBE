import { Router } from "express";
import {
  approveRegistration,
  changeSchoolAddress,
  changeSchoolName,
  changeSchoolPersonalName,
  changeSchoolPhoneNumber,
  changeSchoolTag,
  createSchool,
  createSchoolTimetableRecord,
  deleteSchool,
  getSchoolRegistered,
  loginSchool,
  logoutSchool,
  readSchoolCookie,
  updateAdminCode,
  updateRegisterationStatus,
  updateSchoolAccountDetail,
  updateSchoolAvatar,
  updateSchoolName,
  updateSchoolPaymentOptions,
  updateSchoolSignature,
  updateSchoolStartPossition,
  verifySchool,
  viewAllSchools,
  viewSchoolStatus,
  viewSchoolStatusByName,
  viewSchoolTopStudent,
} from "../controller/schoolController";
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
  .route("/approved-school-registration/:schoolID")
  .patch(approveRegistration);

router.route("/school-request-registration").post(updateRegisterationStatus);

router.route("/view-school-top-student/:schoolID").get(viewSchoolTopStudent);
router.route("/register-school/").post(createSchool);
router.route("/login-school/").post(loginSchool);

router.route("/delete-school/:schoolID").delete(deleteSchool);

router.route("/get-school-by-name/:schoolName").get(viewSchoolStatusByName);

router.route("/verify-school/:schoolID").get(verifySchool);

router.route("/view-school/:schoolID").get(viewSchoolStatus);

router.route("/view-all-school").get(viewAllSchools);

router.route("/logout-school").delete(logoutSchool);
router.route("/get-school").get(getSchoolRegistered);
router.route("/read-school-cookie").get(readSchoolCookie);

router.route("/change-school-name/:schoolID").patch(changeSchoolName);

router.route("/change-school-location/:schoolID").patch(changeSchoolAddress);
router.route("/update-account-info/:schoolID").patch(updateSchoolAccountDetail);

router
  .route("/upload-school-avatar/:schoolID")
  .patch(upload, updateSchoolAvatar);

router
  .route("/upload-school-signature/:schoolID")
  .patch(upload, updateSchoolSignature);

router.route("/change-school-phone/:schoolID").patch(changeSchoolPhoneNumber);
router
  .route("/change-school-personal-name/:schoolID")
  .patch(changeSchoolPersonalName);

router.route("/change-school-tag/:schoolID").patch(changeSchoolTag);
router.route("/change-school-name/:schoolID").patch(updateSchoolName);
router
  .route("/change-school-started/:schoolID")
  .patch(updateSchoolStartPossition);

router
  .route("/create-school-time-table/:schoolID")
  .patch(createSchoolTimetableRecord);

router
  .route("/add-more-payment-option/:schoolID")
  .patch(updateSchoolPaymentOptions);

router.route("/update-school-admin-code/:schoolID").patch(updateAdminCode);

export default router;
