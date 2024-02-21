import { Router } from "express";
import {
  createArticle,
  deleteOneArticle,
  readAllArticles,
  readOneArticle,
} from "../controller/articleController";

const router: Router = Router();

router.route("/create-article/:schoolID/:studentID").post(createArticle);
router.route("/view-article/:articleID").get(readOneArticle);
router.route("/view-school-article/:schoolID").get(readAllArticles);
router
  .route("/delete-school-article/:schoolID/:studentName/:articleID")
  .delete(deleteOneArticle);

export default router;
