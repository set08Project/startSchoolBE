import { Request, Response } from "express";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import { Types } from "mongoose";
import cardReportModel from "../model/cardReportModel";
import studentModel from "../model/studentModel";
import schoolModel from "../model/schoolModel";
import classroomModel from "../model/classroomModel";
import lodash from "lodash";

export const createReportCardEntry = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID } = req.params;
    const { subject, test1, test2, test3, test4, exam } = req.body;

    const teacher = await staffModel.findById(teacherID);
    const school: any = await schoolModel
      .findById(teacher?.schoolIDs)
      .populate({
        path: "session",
        options: {
          sort: {
            createdAt: -1,
          },
        },
      });

    const student: any = await studentModel.findById(studentID).populate({
      path: "reportCard",
    });

    const subjectData = await subjectModel.findOne({ subjectTitle: subject });

    const studentCheck = student?.reportCard.some((el: any) => {
      return (
        el.classInfo ===
        `${student?.classAssigned} session: ${school?.session[0]
          ?.year!}(${school?.session[0]?.presentTerm!})`
      );
    });

    if (teacher && student) {
      if (studentCheck) {
        // check
        const getReportSubject: any = await studentModel
          .findById(studentID)
          .populate({
            path: "reportCard",
          });

        const getData: any = getReportSubject?.reportCard?.find((el: any) => {
          return (
            el.classInfo ===
            `${student?.classAssigned} session: ${school?.session[0]
              ?.year!}(${school?.session[0]?.presentTerm!})`
          );
        });

        const data = getReportSubject?.reportCard?.find((el: any) => {
          return el.result.find((el: any) => {
            return el.subject === subject;
          });
        });

        const dataFIle = getReportSubject?.reportCard?.find((el: any) => {
          return el.result.find((el: any) => {
            return el.subject === subject;
          });
        });

        const read = dataFIle?.result.find((el: any) => {
          return el.subject === subject;
        });

        if (data) {
          let x1 = !test1 ? read?.test1 : test1 ? test1 : 0;
          let x2 = !test2 ? read?.test2 : test2 ? test2 : 0;
          let x3 = !test3 ? read?.test3 : test3 ? test3 : 0;
          let x4 = !test4 ? read?.test4 : test4 ? test4 : 0;
          let x5 = !exam ? read?.exam : exam ? exam : 0;

          let y1 = x1 !== null ? x1 : 0;
          let y2 = x2 !== null ? x2 : 0;
          let y3 = x3 !== null ? x3 : 0;
          let y4 = x4 !== null ? x4 : 0;
          let y5 = x5 !== null ? x5 : 0;

          let mark = y1 + y2 + y3 + y4 + y5;

          let myTest1: number;
          let myTest2: number;
          let myTest3: number;
          let myTest4: number;
          let examination: number;

          let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
          let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
          let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
          let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
          let w5 = x5 !== 0 ? (examination = 60) : 0;

          let score = w1 + w2 + w3 + w4 + w5;

          let updated = getData.result.filter((el: any) => {
            return el.subject !== subject;
          });

          const report = await cardReportModel.findByIdAndUpdate(
            getData?._id,
            {
              result: [
                ...updated,
                {
                  subject: !subject ? read?.subject : subject,
                  test1: y1,
                  test2: y2,
                  test3: y3,
                  test4: y4,
                  exam: y5,
                  mark,
                  score,
                  points: parseFloat(((mark / score) * 100).toFixed(2)),
                  grade:
                    (mark / score) * 100 >= 0 && (mark / score) * 100 <= 39
                      ? "F"
                      : (mark / score) * 100 >= 40 && (mark / score) * 100 <= 49
                      ? "E"
                      : (mark / score) * 100 >= 50 && (mark / score) * 100 <= 59
                      ? "D"
                      : (mark / score) * 100 >= 60 && (mark / score) * 100 <= 69
                      ? "C"
                      : (mark / score) * 100 >= 70 && (mark / score) * 100 <= 79
                      ? "B"
                      : (mark / score) * 100 >= 80 &&
                        (mark / score) * 100 <= 100
                      ? "A"
                      : null,
                },
              ],
            },
            { new: true }
          );

          return res.status(201).json({
            message: "teacher updated report successfully",
            data: report,
            status: 201,
          });
        } else {
          let x1 = !test1 ? read?.test1 : test1 ? test1 : 0;
          let x2 = !test2 ? read?.test2 : test2 ? test2 : 0;
          let x3 = !test3 ? read?.test3 : test3 ? test3 : 0;
          let x4 = !test4 ? read?.test4 : test4 ? test4 : 0;
          let x5 = !exam ? read?.exam : exam ? exam : 0;

          let y1 = x1 !== null ? x1 : 0;
          let y2 = x2 !== null ? x2 : 0;
          let y3 = x3 !== null ? x3 : 0;
          let y4 = x4 !== null ? x4 : 0;
          let y5 = x5 !== null ? x5 : 0;

          let mark = y1 + y2 + y3 + y4 + y5;

          let myTest1: number;
          let myTest2: number;
          let myTest3: number;
          let myTest4: number;
          let examination: number;

          let w1 = x1 !== 0 ? (myTest1 = 10) : 0;
          let w2 = x2 !== 0 ? (myTest2 = 10) : 0;
          let w3 = x3 !== 0 ? (myTest3 = 10) : 0;
          let w4 = x4 !== 0 ? (myTest4 = 10) : 0;
          let w5 = x5 !== 0 ? (examination = 60) : 0;

          let score = w1 + w2 + w3 + w4 + w5;
          const report = await cardReportModel.findByIdAndUpdate(
            getData?._id,
            {
              result: [
                ...getData.result,
                {
                  subject: !subject ? read?.subject : subject,
                  test1: y1,
                  test2: y2,
                  test3: y3,
                  test4: y4,
                  exam: y5,
                  mark,
                  score,
                  points: parseFloat(((mark / score) * 100).toFixed(2)),
                  grade:
                    (mark / score) * 100 >= 0 && (mark / score) * 100 <= 39
                      ? "F"
                      : (mark / score) * 100 >= 40 && (mark / score) * 100 <= 49
                      ? "E"
                      : (mark / score) * 100 >= 50 && (mark / score) * 100 <= 59
                      ? "D"
                      : (mark / score) * 100 >= 60 && (mark / score) * 100 <= 69
                      ? "C"
                      : (mark / score) * 100 >= 70 && (mark / score) * 100 <= 79
                      ? "B"
                      : (mark / score) * 100 >= 80 &&
                        (mark / score) * 100 <= 100
                      ? "A"
                      : null,
                },
              ],
            },
            { new: true }
          );

          return res.status(201).json({
            message: "can't report entry created successfully",
            data: report,
            status: 201,
          });
        }
      } else {
        const report = await cardReportModel.create({
          result: [
            {
              subject,
              test1,
              test2,
              test3,
              test4,
              exam,
            },
          ],
          classInfo: `${student?.classAssigned} session: ${school?.session[0]
            ?.year!}(${school?.session[0]?.presentTerm!})`,
        });

        student?.reportCard.push(new Types.ObjectId(report._id));
        student?.save();

        subjectData?.reportCard.push(new Types.ObjectId(report._id));
        subjectData?.save();

        // school?.reportCard.push(new Types.ObjectId(report._id));
        // school?.save();

        return res.status(201).json({
          message: "report entry created successfully",
          data: { report, student },
          status: 201,
        });
      }
    } else {
      return res.status(404).json({
        message: "student and teacher doesn't exist for this class",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating class subject report",
      data: error.message,
      status: 404,
    });
  }
};

export const updateReportScores = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, teacherID } = req.params;
    const { subject, test1, test2, test3, exam } = req.body;

    const student = await studentModel.findById(studentID).populate({
      path: "reportCard",
    });

    const getReportSubject: any = student?.reportCard.find((el: any) => {
      return el?.result?.find((el: any) => {
        return el?.subject === subject;
      });
    });

    const teacher = await staffModel.findById(teacherID);

    if (teacher && student) {
      if (teacher) {
        const data = getReportSubject.result.find((el: any) => {
          return el.subject === subject;
        });

        const report = await cardReportModel.findByIdAndUpdate(
          getReportSubject?._id,
          {
            result: [
              {
                subject: !subject ? data?.subject : subject,
                "1st Test": !test1 ? data?.[`1st Test`] : test1,
                "2nd Test": !test2 ? data?.[`2nd Test`] : test2,
                "3rd Test": !test3 ? data?.[`3rd Test`] : test3,
                Exam: !exam ? exam : data?.exam,
              },
            ],
          },
          { new: true }
        );

        return res.status(201).json({
          message: "teacher updated report successfully",
          data: report,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "unable to find school Teacher",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const adminReportRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, schoolID } = req.params;
    const { adminComment } = req.body;

    const student = await studentModel.findById(studentID).populate({
      path: "reportCard",
    });

    const school: any = await schoolModel.findById(schoolID).populate({
      path: "session",
    });

    const getReportSubject: any = student?.reportCard.find((el: any) => {
      return (
        el?.classInfo ===
        `${student?.classAssigned} session: ${school?.session[0]
          ?.year!}(${school?.session[0]?.term!})`
      );
    });

    if (school) {
      const report = await cardReportModel.findByIdAndUpdate(
        getReportSubject?._id,
        {
          approve: true,
          adminComment,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "admin report remark successfully",
        data: report,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "unable to find school",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const classTeacherReportRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID, classID } = req.params;
    const { teacherComment } = req.body;

    const student: any = await studentModel
      .findById(studentID)
      .populate({ path: "reportCard" });

    const classRM = await classroomModel.findById(classID);

    const school: any = await schoolModel
      .findById(student?.schoolIDs)
      .populate({
        path: "session",
      });

    const getReportSubject: any = student?.reportCard.find((el: any) => {
      return el?.classInfo === `JSS 1A session: 2024/2025(Second Term)`;
    });
    //  `${student?.classAssigned} session: ${school?.session[0]
    //           ?.year!}(${school?.session[0]?.presentTerm!})`
    const teacher = await staffModel.findById(teacherID);

    if (teacher?.classesAssigned === student?.classAssigned) {
      const report = await cardReportModel.findByIdAndUpdate(
        getReportSubject?._id,
        {
          classTeacherComment: teacherComment,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "class Teacher report remark successfully",
        data: report,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
      data: error.message,
    });
  }
};

export const studentReportRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const student: any = await studentModel
      .findById(studentID)
      .populate({ path: "reportCard" });

    return res.status(201).json({
      message: "class Teacher report grade",
      data: student,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
      data: error.message,
    });
  }
};
