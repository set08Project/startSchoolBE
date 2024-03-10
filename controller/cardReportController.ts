import { Request, Response } from "express";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import { Types } from "mongoose";
import cardReportModel from "../model/cardReportModel";
import studentModel from "../model/studentModel";
import schoolModel from "../model/schoolModel";
import classroomModel from "../model/classroomModel";
import { forEach, update } from "lodash";

export const createReportCardEntry = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID } = req.params;
    const { subject, test1, test2, test3, exam } = req.body;

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

    const studentCheck = student?.reportCard.some((el: any) => {
      return (
        el.classInfo ===
        `${student?.classAssigned} session: ${school?.session[0]
          ?.year!}(${school?.session[0]?.term!})`
      );
    });

    // console.log(studentCheck);

    if (teacher && student) {
      if (studentCheck) {
        // check
        const getReportSubject: any = await studentModel
          .findById(studentID)
          .populate({
            path: "reportCard",
          });

        // console.log("read: ", getReportSubject);

        const getData: any = getReportSubject?.reportCard?.find((el: any) => {
          return (
            el.classInfo ===
            `${student?.classAssigned} session: ${school?.session[0]
              ?.year!}(${school?.session[0]?.term!})`
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
          let mark = parseInt(
            (!test1 ? read?.[`1st Test`] : test1 ? test1 : 0) +
              (!test2 ? read?.[`2nd Test`] : test2 ? test2 : 0) +
              (!test3 ? read?.[`3rd Test`] : test3 ? test3 : 0) +
              (!exam ? read?.Exam : exam ? exam : 0)
          );

          let myTest1: number;
          let myTest2: number;
          let myTest3: number;
          let examination: number;

          if (test1 !== null && read?.[`1st Test`]) {
            myTest1 = 10;
          } else {
            myTest1 = 0;
          }

          if (test2 !== null && read?.[`2nd Test`]) {
            myTest2 = 10;
          } else {
            myTest2 = 0;
          }

          if (test3 !== null && read?.[`3rd Test`]) {
            myTest3 = 10;
          } else {
            myTest3 = 0;
          }

          if (test1 !== null && read?.[`Exam`]) {
            examination = 70;
          } else {
            examination = 0;
          }

          let score = myTest1 + myTest2 + myTest3 + examination;

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
                  "1st Test": !test1 ? read?.[`1st Test`] : test1,
                  "2nd Test": !test2 ? read?.[`2nd Test`] : test2,
                  "3rd Test": !test3 ? read?.[`3rd Test`] : test3,
                  Exam: !exam ? exam : read?.exam,
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
          let mark = parseInt(
            (!test1 ? read?.[`1st Test`] : test1 ? test1 : 0) +
              (!test2 ? read?.[`2nd Test`] : test2 ? test2 : 0) +
              (!test3 ? read?.[`3rd Test`] : test3 ? test3 : 0) +
              (!exam ? read?.Exam : exam ? exam : 0)
          );

          let myTest1: number;
          let myTest2: number;
          let myTest3: number;
          let examination: number;

          if (test1 !== null && read?.[`1st Test`]) {
            myTest1 = 10;
          } else {
            myTest1 = 0;
          }

          if (test2 !== null && read?.[`2nd Test`]) {
            myTest2 = 10;
          } else {
            myTest2 = 0;
          }

          if (test3 !== null && read?.[`3rd Test`]) {
            myTest3 = 10;
          } else {
            myTest3 = 0;
          }

          if (test1 !== null && read?.[`Exam`]) {
            examination = 70;
          } else {
            examination = 0;
          }

          let score = myTest1 + myTest2 + myTest3 + examination;

          const report = await cardReportModel.findByIdAndUpdate(
            getData?._id,
            {
              result: [
                ...getData.result,
                {
                  subject: !subject ? read?.subject : subject,
                  "1st Test": !test1 ? read?.[`1st Test`] : test1,
                  "2nd Test": !test2 ? read?.[`2nd Test`] : test2,
                  "3rd Test": !test3 ? read?.[`3rd Test`] : test3,
                  Exam: !exam ? exam : read?.exam,
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
              "1st Test": test1,
              "2nd Test": test2,
              "3rd Test": test3,
            },
          ],
          classInfo: `${student?.classAssigned} session: ${school?.session[0]
            ?.year!}(${school?.session[0]?.term!})`,
        });

        student?.reportCard.push(new Types.ObjectId(report._id));
        student?.save();

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
      return (
        el?.classInfo ===
        `${student?.classAssigned} session: ${school?.session[0]
          ?.year!}(${school?.session[0]?.term!})`
      );
    });

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
      message: "class Teacher report remark successfully",
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
