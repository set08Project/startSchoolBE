import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import timetableModel from "../model/timetableModel";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import quizModel from "../model/quizModel";
import { log } from "console";

export const createSubjectQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID, subjectID } = req.params;
    const { quiz } = req.body;

    const classRoom = await classroomModel.findById(classID);

    const checkForSubject = await subjectModel.findById(subjectID);

    const findTeacher = await staffModel.findById({
      _id: classRoom?.teacherID,
    });

    if (checkForSubject) {
      const quizes = await quizModel.create({
        subjectTitle: checkForSubject?.subjectTitle,
        quiz,
      });

      checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
      checkForSubject?.save();

      findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
      findTeacher?.save();

      return res.status(201).json({
        message: "quiz entry created successfully",
        data: quizes,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Subject doesn't exist for this class",
        status: 404,
      });
    }
  } catch (errorL) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const readSubjectQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "quiz",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "subject quiz read successfully",
      data: subject,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      status: 404,
    });
  }
};

export const readTeacherSubjectQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;

    const quiz: any = await staffModel
      .findById(teacherID)
      .populate({ path: "quiz" });

    return res.status(201).json({
      message: "subject quiz read successfully",
      data: quiz,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      data: error.message,
      status: 404,
    });
  }
};

export const readQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const quiz: any = await quizModel.findById(quizID);

    return res.status(201).json({
      message: "subject quiz read successfully",
      data: quiz,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      data: error.message,
      status: 404,
    });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { subjectID, quizID } = req.params;
    const { instruction, questions, options } = req.body;

    const subject = await subjectModel.findById(subjectID);
    // log("subject", subject);
    if (!subject) {
      return res
        .status(404)
        .json({ message: "Subject not found", status: 404 });
    }

    const quiz: any = await quizModel.findById(quizID);
    // log("quiz", quiz);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found", status: 404 });
    }

    if (!subject.quiz.includes(quiz._id)) {
      return res.status(400).json({
        message: "Quiz does not belong to the specified subject",
        status: 400,
      });
    }

    if (instruction) {
      quiz.instruction = { ...quiz.instruction, ...instruction };
    }

    // if (questions && Array.isArray(questions)) {
    //   questions.forEach((q: any) => {
    //     const questionToUpdate = quiz.questions?.id(q.id);
    //     log("questionupdate", questionToUpdate);
    //     if (questionToUpdate) {
    //       questionToUpdate.question = q.question || questionToUpdate.question;
    //       questionToUpdate.answer = q.answer || questionToUpdate.answer;
    //       questionToUpdate.options = q.options || questionToUpdate.options;
    //     }
    //   });
    // }
    if (quiz && subject) {
      const update = await quizModel.findByIdAndUpdate(
        quizID,
        {
          question: questions,
          options: options,
        },
        { new: true }
      );
      return res.status(200).json({
        message: "Quiz updated successfully",
        data: update,
        status: 200,
      });
    }

    await quiz.save();
  } catch (error: any) {
    return res.status(500).json({
      message: "Error updating quiz",
      data: error.message,
      status: 500,
    });
  }
};
