"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articleController_1 = require("../controller/articleController");
const router = (0, express_1.Router)();
router.route("/create-article/:schoolID/:studentID").post(articleController_1.createArticle);
router.route("/view-article/:articleID").get(articleController_1.readOneArticle);
router.route("/view-school-article/:schoolID").get(articleController_1.readAllArticles);
router
    .route("/delete-school-article/:schoolID/:studentName/:articleID")
    .delete(articleController_1.deleteOneArticle);
exports.default = router;
