import { Request, Response } from "express";
import { Types } from "mongoose";
import studentModel from "../model/studentModel";
import quizModel from "../model/quizModel";
import subjectModel from "../model/subjectModel";
import performanceModel from "../model/performanceModel";
import examinationModel from "../model/examinationModel";
import midTestModel from "../model/midTestModel";

export const createQuizPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, quizID, subjectID } = req.params;
    const {
      studentScore,
      studentGrade,
      remark,
      totalQuestions,
      markPerQuestion,
      status,
    } = req.body;

    if (!studentID || !quizID || !subjectID) {
      return res.status(400).json({
        message: "studentID, quizID and subjectID are required",
        status: 400,
      });
    }

    const studentInfo: any = await studentModel.findById(studentID);
    if (!studentInfo) {
      return res
        .status(404)
        .json({ message: "Student not found", status: 404 });
    }

    const quizData: any = await quizModel.findById(quizID);

    if (!quizData) {
      return res.status(404).json({ message: "Exam not found", status: 404 });
    }

    const subject = await subjectModel.findById(subjectID);
    if (!subject) {
      return res
        .status(404)
        .json({ message: "Subject not found", status: 404 });
    }

    // compute performanceRating safely
    const questionCount = Array.isArray(quizData?.quiz?.question)
      ? quizData.quiz.question.length
      : typeof quizData?.quiz === "number"
      ? quizData.quiz
      : 0;

    const perfRating =
      questionCount > 0 && typeof studentScore === "number"
        ? Number(((studentScore / questionCount) * 100).toFixed(2))
        : 0;

    // count existing attempts for this student and this quiz
    const existingAttempts = await performanceModel.countDocuments({
      student: studentID,
      quizID,
    });
    const attemptNumber = existingAttempts + 1;

    // create performance document
    const performanceDoc: any = await performanceModel.create({
      remark,
      subjectTitle: quizData?.subjectTitle,
      studentScore,
      studentGrade,
      totalQuestions,
      markPerQuestion,
      quizDone: true,
      status,
      performanceRating: perfRating,
      attemptNumber,
      className: studentInfo?.classAssigned,
      quizID: quizID,
      studentName: `${studentInfo?.studentFirstName || ""} ${
        studentInfo?.studentLastName || ""
      }`.trim(),
      studentAvatar: studentInfo?.avatar,
      subjectID: subject._id,
      student: studentID,
    });

    // push performance id to examination, student and subject safely
    const perfId = new Types.ObjectId(performanceDoc._id);

    const ensureAndPush = async (Model: any, id: any) => {
      const doc: any = await Model.findById(id).select("performance");
      if (!doc) return;
      if (!Array.isArray(doc.performance)) {
        // initialize to empty array if null or not an array
        doc.performance = [];
      }
      doc.performance.push(perfId);
      await doc.save();
    };

    await Promise.all([
      ensureAndPush(examinationModel, quizID),
      ensureAndPush(studentModel, studentID),
      ensureAndPush(subjectModel, subjectID),
    ]);

    // Recalculate student's totalPerformance from performanceModel (source of truth)
    const performances = await performanceModel
      .find({ student: studentID })
      .select("performanceRating")
      .lean();

    const ratings: number[] = (performances || [])
      .map((p: any) =>
        typeof p.performanceRating === "number" && !isNaN(p.performanceRating)
          ? p.performanceRating
          : null
      )
      .filter((r: number | null): r is number => r !== null);

    const totalSum = ratings.reduce((a: number, b: number) => a + b, 0);
    const count = ratings.length;
    const avg = count > 0 ? totalSum / count : 0;

    await studentModel.findByIdAndUpdate(studentID, { totalPerformance: avg });

    return res.status(201).json({
      message: "exam performance created successfully",
      data: performanceDoc,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error creating exam performance",
      status: 500,
      data: error?.message,
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

export const updateSubjectQuizResultRecorded = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { performanceID } = req.params;

    const subject = await performanceModel.findByIdAndUpdate(
      performanceID,
      {
        quizRecorded: true,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "subject quiz performance recorded successfully",
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

export const readOneSubjectQuizResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID, quizID } = req.params;
    const quiz = await quizModel.findById(quizID);
    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
      options: { sort: { time: 1 } },
    });

    if (!quiz || !subject) {
      return res.status(404).json({
        message: "Subject or Quiz not found",
        status: 404,
      });
    }

    const idCompare = subject?.quiz?.some(
      (id: any) => id.toString() === quiz._id.toString()
    );

    if (idCompare) {
      const filteredPerformance = subject?.performance?.filter(
        (el: any) => el.quizID.toString() === quiz._id.toString()
      );

      return res.status(201).json({
        message: "Filtered quiz performance read successfully",
        data: filteredPerformance,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "QuizID and Subject Quiz don't align",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error reading subject quiz performance",
      status: 500,
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
          createdAt: -1,
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

// Examination

export const createExamPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, quizID, subjectID } = req.params;
    const {
      studentScore,
      studentGrade,
      remark,
      totalQuestions,
      markPerQuestion,
      status,
    } = req.body;

    const studentInfo: any = await studentModel
      .findById(studentID)
      .populate({ path: "performance" });

    const quizData: any = await examinationModel.findById(quizID);

    const subject = await subjectModel.findById(subjectID);

    if (quizData) {
      const existingAttempts = await performanceModel.countDocuments({
        student: studentID,
        quizID,
      });
      const attemptNumber = existingAttempts + 1;

      const quizes = await performanceModel.create({
        remark,
        subjectTitle: quizData?.subjectTitle,
        studentScore,
        studentGrade,
        totalQuestions,
        markPerQuestion,
        quizDone: true,
        status,
        performanceRating: parseInt(
          ((studentScore / quizData?.quiz?.question.length) * 100).toFixed(2)
        ),
        attemptNumber,
        className: studentInfo?.classAssigned,
        quizID: quizID,
        studentName: `${studentInfo?.studentFirstName} ${studentInfo?.studentLastName}`,
        studentAvatar: studentInfo.avatar,
        subjectID: subject?._id,
        student: studentID,
      });

      quizData?.performance?.push(new Types.ObjectId(quizes._id));
      await quizData?.save();

      studentInfo?.performance?.push(new Types.ObjectId(quizes._id));
      await studentInfo?.save();

      subject?.performance?.push(new Types.ObjectId(quizes._id));
      await subject?.save();

      const getStudent = await studentModel.findByIdAndUpdate(
        studentID,
        { $push: { performance: new Types.ObjectId(quizes._id) } },
        { new: true }
      );

      const ratings: number[] = [];
      const totalSum = ratings.reduce((a: number, b: number) => a + b, 0);
      const count = ratings.length;
      const avg = count > 0 ? totalSum / count : 0;

      await studentModel.findByIdAndUpdate(
        studentID,
        { totalPerformance: avg },
        { new: true }
      );

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
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
      data: error.message,
    });
  }
};

// Mid Test

export const createMidTestPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, quizID, subjectID } = req.params;
    const {
      studentScore,
      studentGrade,
      remark,
      totalQuestions,
      markPerQuestion,
      status,
    } = req.body;

    const studentInfo: any = await studentModel
      .findById(studentID)
      .populate({ path: "performance" });

    const quizData: any = await midTestModel.findById(quizID);

    const subject = await subjectModel.findById(subjectID);

    if (quizData) {
      const existingAttempts = await performanceModel.countDocuments({
        student: studentID,
        quizID,
      });
      const attemptNumber = existingAttempts + 1;

      const quizes = await performanceModel.create({
        remark,
        subjectTitle: quizData?.subjectTitle,
        studentScore,
        studentGrade,
        totalQuestions,
        markPerQuestion,
        quizDone: true,
        status,
        performanceRating: parseInt(
          ((studentScore / quizData?.quiz?.question.length) * 100).toFixed(2)
        ),
        attemptNumber,
        className: studentInfo?.classAssigned,
        quizID: quizID,
        studentID,
        studentName: `${studentInfo?.studentFirstName} ${studentInfo?.studentLastName}`,
        studentAvatar: studentInfo.avatar,
        subjectID: subject?._id,
        student: studentID,
      });

      quizData?.performance?.push(new Types.ObjectId(quizes._id));
      await quizData?.save();

      // studentInfo?.performance?.push(new Types.ObjectId(quizes._id));
      // await studentInfo?.save();

      await studentModel.findByIdAndUpdate(
        studentID,
        { $push: { performance: new Types.ObjectId(quizes._id) } },
        { new: true }
      );

      subject?.performance?.push(new Types.ObjectId(quizes._id));
      await subject?.save();

      // Recalculate student's totalPerformance using only valid numeric ratings
      const getStudent = await studentModel.findById(studentID).populate({
        path: "performance",
      });

      const ratings: number[] = [];
      getStudent?.performance?.forEach((el: any) => {
        if (
          typeof el.performanceRating === "number" &&
          !isNaN(el.performanceRating)
        ) {
          ratings.push(el.performanceRating);
        }
      });

      const totalSum = ratings.reduce((a: number, b: number) => a + b, 0);
      const count = ratings.length;
      const avg = count > 0 ? totalSum / count : 0;

      await studentModel.findByIdAndUpdate(
        studentID,
        { totalPerformance: avg },
        { new: true }
      );

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
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
      data: error.message,
    });
  }
};

export const readSubjectMidTestResult = async (
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

export const readSubjectExamResult = async (
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

export const readOneSubjectExamResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID, quizID } = req.params;
    const quiz = await examinationModel.findById(quizID);

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
      options: { sort: { time: 1 } },
    });

    if (!quiz || !subject) {
      return res.status(404).json({
        message: "Subject or Quiz not found",
        status: 404,
      });
    }

    const idCompare = subject?.examination?.some(
      (id: any) => id.toString() === quiz._id.toString()
    );

    if (idCompare) {
      const filteredPerformance = subject?.performance?.filter(
        (el: any) => el.quizID.toString() === quiz._id.toString()
      );

      return res.status(201).json({
        message: "Filtered quiz performance read successfully",
        data: filteredPerformance,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "QuizID and Subject Quiz don't align",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error reading subject quiz performance",
      status: 500,
    });
  }
};

export const readStudentExamResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const subject = await studentModel.findById(studentID).populate({
      path: "performance",
      options: {
        sort: {
          createdAt: -1,
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

export const readExamResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const subject = await examinationModel.findById(quizID).populate({
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

export const readOneSubjectMidTestResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID, quizID } = req.params;
    const quiz = await midTestModel.findById(quizID);

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
      options: { sort: { time: 1 } },
    });

    if (!quiz || !subject) {
      return res.status(404).json({
        message: "Subject or Quiz not found",
        status: 404,
      });
    }

    const idCompare = subject?.examination?.some(
      (id: any) => id.toString() === quiz._id.toString()
    );

    if (idCompare) {
      const filteredPerformance = subject?.performance?.filter(
        (el: any) => el.quizID.toString() === quiz._id.toString()
      );

      return res.status(201).json({
        message: "Filtered quiz performance read successfully",
        data: filteredPerformance,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "QuizID and Subject Quiz don't align",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error reading subject quiz performance",
      status: 500,
    });
  }
};

export const readStudentMidTestResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const subject = await studentModel.findById(studentID).populate({
      path: "performance",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    const x = subject?.performance?.filter(
      (el: any) => el.status === "midTest"
    );

    return res.status(201).json({
      message: "subject quiz performance read successfully",
      data: x,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      status: 404,
    });
  }
};

export const readMidTestResult = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const subject = await midTestModel.findById(quizID).populate({
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

export const readOneSubjectMidTestResultPreformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID, quizID } = req.params;
    const quiz = await midTestModel.findById(quizID);

    const subject = await subjectModel.findById(subjectID).populate({
      path: "performance",
      options: { sort: { time: 1 } },
    });

    if (!quiz || !subject) {
      return res.status(404).json({
        message: "Subject or Quiz not found",
        status: 404,
      });
    }

    const idCompare = subject?.examination?.some(
      (id: any) => id.toString() === quiz._id.toString()
    );

    if (idCompare) {
      const filteredPerformance = subject?.performance?.filter(
        (el: any) => el.quizID.toString() === quiz._id.toString()
      );

      return res.status(201).json({
        message: "Filtered quiz performance read successfully",
        data: filteredPerformance,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "QuizID and Subject Quiz don't align",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error reading subject quiz performance",
      status: 500,
    });
  }
};

export const deletePerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { performanceID } = req.params;

    if (!performanceID) {
      return res
        .status(400)
        .json({ message: "performanceID is required", status: 400 });
    }

    const perf: any = await performanceModel.findById(performanceID);

    if (!perf) {
      return res
        .status(404)
        .json({ message: "Performance not found", status: 404 });
    }

    const studentID = perf.student;
    const quizID = perf.quizID;

    // Delete the performance document
    await performanceModel.findByIdAndDelete(performanceID);

    // Remove references from possible quiz/exam/midTest entries
    await quizModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );
    await examinationModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );
    await midTestModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );

    // Remove from subject and student
    await subjectModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );
    await studentModel.updateMany(
      { performance: performanceID },
      { $pull: { performance: performanceID } }
    );

    // Recalculate student's totalPerformance
    if (studentID) {
      const student = await studentModel
        .findById(studentID)
        .populate({ path: "performance" });
      if (student) {
        const ratings: number[] = [];
        student.performance?.forEach((el: any) => {
          if (
            typeof el.performanceRating === "number" &&
            !isNaN(el.performanceRating)
          ) {
            ratings.push(el.performanceRating);
          }
        });

        const totalSum = ratings.reduce((a: number, b: number) => a + b, 0);
        const count = ratings.length;
        const avg = count > 0 ? totalSum / count : 0;

        await studentModel.findByIdAndUpdate(
          studentID,
          { totalPerformance: avg },
          { new: true }
        );
      }
    }

    return res
      .status(200)
      .json({ message: "Performance deleted successfully", status: 200 });
  } catch (error: any) {
    return res
      .status(500)
      .json({
        message: "Error deleting performance",
        data: error.message,
        status: 500,
      });
  }
};
