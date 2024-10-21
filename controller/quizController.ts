import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import timetableModel from "../model/timetableModel";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import quizModel from "../model/quizModel";
import { staffDuty } from "../utils/enums";
import { log } from "console";
import studentModel from "../model/studentModel";

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

export const readQuizes = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const quiz: any = await quizModel.find().populate({
      path: "performance",
    });

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

export const getQuizRecords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const quizzes: any = await studentModel
      .findById(studentID)
      .populate({ path: "performance" });

    return res.status(200).json({
      message: "Quiz records fetched successfully",
      data: quizzes,
      status: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching quiz records",
      data: error.message,
      status: 500,
    });
  }
};

export const deleteQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const quiz = await quizModel.findByIdAndDelete(quizID);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
        status: 404,
      });
    }

    const subjectUpdate = await subjectModel.updateMany(
      { quiz: quizID },
      { $pull: { quiz: quizID } }
    );

    const staffUpdate = await staffModel.updateMany(
      { quiz: quizID },
      { $pull: { quiz: quizID } }
    );

    const studentUpdate = await studentModel.updateMany(
      { quiz: quizID },
      { $pull: { quiz: quizID } }
    );

    return res.status(200).json({
      message: "Quiz deleted successfully",
      data: {
        deletedQuiz: quiz, 
        subjectUpdate,
        staffUpdate,
        studentUpdate,
      },
      status: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error deleting quiz",
      data: error.message,
      status: 500,
    });
  }
};

export const getStudentQuizRecords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;

    console.log("teacherID", teacherID);

    const staff = await staffModel.findById(teacherID).populate({
      path: 'quiz',
      populate: {
        path: 'performance',
        select: 'studentName studentScore studentGrade subjectTitle date',
      },
    });

    if (!staff) {
      return res.status(404).json({
        message: "Teacher not found or no quiz data available",
        status: 404,
      });
    }

    return res.status(200).json({
      message: "Student quiz records retrieved successfully",
      data: staff,
      status: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error retrieving student quiz records",
      data: error.message,
      status: 500,
    });
  }
};


