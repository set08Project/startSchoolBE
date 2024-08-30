import { Router } from "express";
import {
  approvedRegisteration,
  changeSchoolAddress,
  changeSchoolName,
  changeSchoolPersonalName,
  changeSchoolPhoneNumber,
  changeSchoolTag,
  createSchool,
  deleteSchool,
  loginSchool,
  logoutSchool,
  readSchoolCookie,
  updateRegisterationStatus,
  updateSchoolAccountDetail,
  updateSchoolAvatar,
  updateSchoolName,
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

router.route("/approved-school-registration").patch(approvedRegisteration);

router.route("/school-request-registration").patch(updateRegisterationStatus);

router.route("/view-school-top-student/:schoolID").get(viewSchoolTopStudent);

router.route("/register-school/").post(createSchool);
router.route("/login-school/").post(loginSchool);

router.route("/delete-school/:schoolID").delete(deleteSchool);

router.route("/get-school-by-name/:schoolName").get(viewSchoolStatusByName);

router.route("/verify-school/:schoolID").get(verifySchool);
router.route("/view-school/:schoolID").get(viewSchoolStatus);
router.route("/view-all-school").get(viewAllSchools);

router.route("/logout-school").delete(logoutSchool);
router.route("/read-school-cookie").get(readSchoolCookie);

router.route("/change-school-name/:schoolID").patch(changeSchoolName);

router.route("/change-school-location/:schoolID").patch(changeSchoolAddress);
router.route("/update-account-info/:schoolID").patch(updateSchoolAccountDetail);

router
  .route("/upload-school-avatar/:schoolID")
  .patch(upload, updateSchoolAvatar);

router.route("/change-school-phone/:schoolID").patch(changeSchoolPhoneNumber);
router
  .route("/change-school-personal-name/:schoolID")
  .patch(changeSchoolPersonalName);

router.route("/change-school-tag/:schoolID").patch(changeSchoolTag);
router.route("/change-school-name/:schoolID").patch(updateSchoolName);
router
  .route("/change-school-started/:schoolID")
  .patch(updateSchoolStartPossition);

export default router;
