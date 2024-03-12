import { Request, Response } from "express";
import pQuestionModel from "../model/pastQuestionModel";
import studentModel from "../model/studentModel";
import { Types } from "mongoose";

export const createPastQuestionHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const { year, subject, percent, score } = req.body;

    const student = await studentModel.findById(studentID);

    if (student) {
      const history = await pQuestionModel.create({
        year,
        subject,
        percent,
        score,
      });

      student.pastQuestionHistory.push(new Types.ObjectId(history?._id));
      student?.save();

      return res.status(201).json({
        message: "lesson note created",
        data: history,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Error finding student",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
      data: error.message,
    });
  }
};

export const getOneStudentHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const student = await studentModel
      .findById(studentID)
      .populate({ path: "pastQuestionHistory" });

    return res.status(201).json({
      message: "lesson note created",
      data: student?.pastQuestionHistory,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
      data: error.message,
    });
  }
};
