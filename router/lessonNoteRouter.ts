import { Router } from "express";
import {
  approveTeacherLessonNote,
  createClasslessonNote,
  readAdminLessonNote,
  readTeacherLessonNote,
} from "../controller/lessonNoteController";

const router: Router = Router();

router
  .route("/create-lesson-note/:schoolID/:staffID")
  .post(createClasslessonNote);

router.route("/view-lesson-note/:schoolID/").get(readAdminLessonNote);

router.route("/view-lesson-note/:schoolID/:staffID").get(readTeacherLessonNote);

router
  .route("/approve-lesson-note/:schoolID/:lessonID")
  .patch(approveTeacherLessonNote);

export default router;
