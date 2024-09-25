import { Router } from "express";
import { fileUpload } from "../utils/multer";
import { createScheme } from "../controller/SchemeController";

const router: Router = Router();



router.route("/upload-schemes/:schoolID").post(fileUpload, createScheme);

export default router