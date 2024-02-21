import { Router } from "express";
import {
  approveTeacherLessonNote,
  createClasslessonNote,
  rateLessonNote,
  readAdminLessonNote,
  readLessonNote,
  readTeacherClassLessonNote,
  readTeacherLessonNote,
} from "../controller/lessonNoteController";

const router: Router = Router();

router
  .route("/create-lesson-note/:schoolID/:staffID")
  .post(createClasslessonNote);

router.route("/admin-view-lesson-note/:schoolID/").get(readAdminLessonNote);

router.route("/view-lesson-note-detail/:lessonID/").get(readLessonNote);

router.route("/view-lesson-note/:schoolID/:staffID").get(readTeacherLessonNote);

router
  .route("/view-class-lesson-note/:classID")
  .get(readTeacherClassLessonNote);

router
  .route("/approve-lesson-note/:schoolID/:lessonID")
  .patch(approveTeacherLessonNote);

router.route("/rate-lesson-note/:studentID/:lessonID").patch(rateLessonNote);

export default router;
