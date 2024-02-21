import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import { Types } from "mongoose";
import articleModel from "../model/articleModel";
import studentModel from "../model/studentModel";
import { viewStudentAttendance } from "./attendanceController";

export const createArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { title, content, desc } = req.body;

    const school = await schoolModel.findById(schoolID);
    const student = await studentModel.findById(studentID);

    if (school && student) {
      const article = await articleModel.create({
        title,
        content,
        desc,
        student: `${student.studentFirstName} ${student.studentLastName}`,
      });

      school.articles.push(new Types.ObjectId(article?._id));
      school?.save();
      student.articles.push(new Types.ObjectId(article?._id));
      student?.save();

      return res.status(201).json({
        message: "Article created successfully",
        data: article,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Error creating article",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const readAllArticles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel
      .findById(schoolID)
      .populate({ path: "articles", options: { sort: { createdAt: -1 } } });

    console.log(school);

    if (school) {
      return res.status(201).json({
        message: "Article created successfully",
        data: school.articles,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Error reading article",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const readOneArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { articleID } = req.params;

    const article = await articleModel.findById(articleID);

    return res.status(200).json({
      message: "Reading one article",
      data: article,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const deleteOneArticle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, articleID, studentName } = req.params;

    const school: any = await schoolModel.findById(schoolID);
    const student: any = await studentModel.findOne({
      studentFirstName: `${studentName.split(" ")[0]}`,
    });

    if (school && student) {
      const article = await articleModel.findByIdAndDelete(articleID);
      school.articles.pull(new Types.ObjectId(articleID));
      school?.save();
      student.articles.pull(new Types.ObjectId(articleID));
      student?.save();

      return res.status(200).json({
        message: "Reading one article",
        data: article,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Error deleting article",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};
