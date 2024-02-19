import { Request, Response } from "express";
import { Types } from "mongoose";
import studentModel from "../model/studentModel";
import staffModel from "../model/staffModel";
import quizModel from "../model/quizModel";
import subjectModel from "../model/subjectModel";
import performanceModel from "../model/performanceModel";
import { number } from "joi";

export const createQuizPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, quizID } = req.params;
    const { studentScore, studentGrade, remark } = req.body;

    const studentInfo: any = await studentModel
      .findById(studentID)
      .populate({ path: "performance" });

    const quizData: any = await quizModel.findById(quizID);

    // const findTeacher = await staffModel.findById({
    //   classesAssigned: studentInfo?.classAssigned,
    // });

    const findSubject = await subjectModel.findOne({
      subjectTitle: quizData?.subjectTitle,
    });

    if (quizData) {
      const quizes = await performanceModel.create({
        remark,
        subjectTitle: quizData?.subjectTitle,
        studentScore,
        studentGrade,
        // subjectTeacher: findTeacher?.staffName,
        performanceRating: parseInt(
          ((studentScore / quizData?.quiz[1]?.question.length) * 100).toFixed(2)
        ),
        className: studentInfo?.classAssigned,
        quizID: quizID,
        studentName: `${studentInfo?.studentFirstName} ${studentInfo?.studentLastName}`,
      });

      quizData?.performance.push(new Types.ObjectId(quizes._id));
      quizData?.save();

      studentInfo?.performance.push(new Types.ObjectId(quizes._id));
      studentInfo?.save();

      findSubject?.performance.push(new Types.ObjectId(quizes._id));
      findSubject?.save();
      let view: number[] = [];
      let notView: number[] = [];

      const getStudent = await studentModel.findById(studentID).populate({
        path: "performance",
      });

      let total = getStudent?.performance.map((el: any) => {
        if (el.performanceRating !== undefined) {
          return view.push(el.performanceRating);
        } else {
          return notView.push(el.performanceRating);
        }
      });

      view.reduce((a: number, b: number) => {
        return a + b;
      }, 0);

      const record = await studentModel.findByIdAndUpdate(
        studentID,
        {
          totalPerformance:
            view.reduce((a: number, b: number) => {
              return a + b;
            }, 0) / studentInfo?.performance?.length,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "quiz entry created successfully",
        data: { quizes, record },
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Subject doesn't exist for this class",
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

export const readSubjectQuizResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "subject quiz performance read successfully",
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

export const readStudentQuizResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const subject = await studentModel.findById(studentID).populate({
      path: "performance",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "subject quiz performance read successfully",
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

export const readQuizResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const subject = await quizModel.findById(quizID).populate({
      path: "performance",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "subject quiz performance read successfully",
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
