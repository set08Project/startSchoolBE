import { Request, Response } from "express";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import { Types } from "mongoose";
import cardReportModel from "../model/cardReportModel";
import studentModel from "../model/studentModel";
import schoolModel from "../model/schoolModel";
import classroomModel from "../model/classroomModel";

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

          const report: any = await cardReportModel.findByIdAndUpdate(
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
                  score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
                  points: mark,
                  // y1 > 10
                  //   ? parseFloat(((mark / score) * 100).toFixed(2))
                  //   : parseFloat(((mark / score) * 100).toFixed(2)),
                  grade:
                    mark >= 0 && mark <= 39
                      ? "F9"
                      : mark >= 39 && mark <= 44
                      ? "E8"
                      : mark >= 44 && mark <= 49
                      ? "D7"
                      : mark >= 49 && mark <= 54
                      ? "C6"
                      : mark >= 54 && mark <= 59
                      ? "C5"
                      : mark >= 59 && mark <= 64
                      ? "C4"
                      : mark >= 64 && mark <= 69
                      ? "B3"
                      : mark >= 69 && mark <= 74
                      ? "B2"
                      : mark >= 74 && mark <= 100
                      ? "A1"
                      : null,
                },
              ],
            },
            { new: true }
          );

          let genPoint = parseFloat(
            (
              report?.result
                ?.map((el: any) => {
                  return el.points;
                })
                .reduce((a: number, b: number) => {
                  return a + b;
                }, 0) / report?.result?.length!
            ).toFixed(2)
          );

          let grade =
            genPoint >= 0 && genPoint <= 39
              ? "F9"
              : genPoint >= 39 && genPoint <= 44
              ? "E8"
              : genPoint >= 44 && genPoint <= 49
              ? "D7"
              : genPoint >= 49 && genPoint <= 54
              ? "C6"
              : genPoint >= 54 && genPoint <= 59
              ? "C5"
              : genPoint >= 59 && genPoint <= 64
              ? "C4"
              : genPoint >= 64 && genPoint <= 69
              ? "B3"
              : genPoint >= 69 && genPoint <= 74
              ? "B2"
              : genPoint >= 74 && genPoint <= 100
              ? "A1"
              : null;

          let x =
            genPoint >= 0 && genPoint <= 5
              ? "This is a very poor result."
              : genPoint >= 6 && genPoint <= 11
              ? "This result is poor; it's not satisfactory."
              : genPoint >= 11 && genPoint <= 15
              ? "Below average; needs significant improvement."
              : genPoint >= 16 && genPoint <= 21
              ? "Below average; more effort required."
              : genPoint >= 21 && genPoint <= 25
              ? "Fair but not satisfactory; strive harder."
              : genPoint >= 26 && genPoint <= 31
              ? "Fair performance; potential for improvement."
              : genPoint >= 31 && genPoint <= 35
              ? "Average; a steady effort is needed."
              : genPoint >= 36 && genPoint <= 41
              ? "Average; showing gradual improvement."
              : genPoint >= 41 && genPoint <= 45
              ? "Slightly above average; keep it up."
              : genPoint >= 46 && genPoint <= 51
              ? "Decent work; shows potential."
              : genPoint >= 51 && genPoint <= 55
              ? "Passable; satisfactory effort."
              : genPoint >= 56 && genPoint <= 61
              ? "Satisfactory; good progress."
              : genPoint >= 61 && genPoint <= 65
              ? "Good work; keep striving for excellence."
              : genPoint >= 66 && genPoint <= 71
              ? "Commendable effort; very good."
              : genPoint >= 71 && genPoint <= 75
              ? "Very good; consistent effort is visible."
              : genPoint >= 76 && genPoint <= 81
              ? "Excellent performance; well done!"
              : genPoint >= 81 && genPoint <= 85
              ? "Exceptional result; keep up the great work!"
              : genPoint >= 86 && genPoint <= 91
              ? "Outstanding achievement; impressive work!"
              : genPoint >= 91 && genPoint <= 95
              ? "Brilliant performance; you’re a star!"
              : genPoint >= 96 && genPoint <= 100
              ? "Outstanding achievement; impressive work!"
              : ``;

          let nice = await cardReportModel.findByIdAndUpdate(
            report?.id,
            {
              points: genPoint,
              adminComment: x,
              grade,
            },
            { new: true }
          );

          return res.status(201).json({
            message: "teacher updated report successfully",
            data: nice,

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
                  score: y1 > 10 ? (y5 ? 60 : 0) + (y1 ? 40 : 0) : score,
                  points:
                    y1 > 10
                      ? parseFloat(((mark / score) * 100).toFixed(2))
                      : parseFloat(((mark / score) * 100).toFixed(2)),
                  grade:
                    mark >= 0 && mark <= 39
                      ? "F9"
                      : mark >= 39 && mark <= 44
                      ? "E8"
                      : mark >= 44 && mark <= 49
                      ? "D7"
                      : mark >= 49 && mark <= 54
                      ? "C6"
                      : mark >= 54 && mark <= 59
                      ? "C5"
                      : mark >= 59 && mark <= 64
                      ? "C4"
                      : mark >= 64 && mark <= 69
                      ? "B3"
                      : mark >= 69 && mark <= 74
                      ? "B2"
                      : mark >= 74 && mark <= 100
                      ? "A1"
                      : null,
                },
              ],
            },
            { new: true }
          );

          let genPoint = parseFloat(
            (
              report?.result
                ?.map((el: any) => {
                  return el.points;
                })
                .reduce((a: number, b: number) => {
                  return a + b;
                }, 0) / report?.result?.length!
            ).toFixed(2)
          );

          let grade =
            genPoint >= 0 && genPoint <= 39
              ? "F9"
              : genPoint >= 39 && genPoint <= 44
              ? "E8"
              : genPoint >= 44 && genPoint <= 49
              ? "D7"
              : genPoint >= 49 && genPoint <= 54
              ? "C6"
              : genPoint >= 54 && genPoint <= 59
              ? "C5"
              : genPoint >= 59 && genPoint <= 64
              ? "C4"
              : genPoint >= 64 && genPoint <= 69
              ? "B3"
              : genPoint >= 69 && genPoint <= 74
              ? "B2"
              : genPoint >= 74 && genPoint <= 100
              ? "A1"
              : null;

          let nice = await cardReportModel.findByIdAndUpdate(
            report?.id,
            {
              points: genPoint,

              grade,
            },
            { new: true }
          );

          return res.status(201).json({
            message: "can't report entry created successfully",
            data: nice,
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
          studentID,
        });

        let genPoint = parseFloat(
          (
            report?.result
              ?.map((el: any) => {
                return el.points;
              })
              .reduce((a: number, b: number) => {
                return a + b;
              }, 0) / report?.result?.length!
          ).toFixed(2)
        );

        let numb = [test1, test2, test3, test4, exam];
        let count = 0;
        let resultNumb = 0;
        let resultNumbAva = 0;

        for (let i = 0; i < numb.length; i++) {
          if (numb[i] > 0) {
            resultNumb += numb[i];

            count++;
          }
        }

        resultNumbAva = resultNumb / count;

        let grade =
          genPoint >= 0 && genPoint <= 39
            ? "F"
            : genPoint >= 40 && genPoint <= 49
            ? "E"
            : genPoint >= 50 && genPoint <= 59
            ? "D"
            : genPoint >= 60 && genPoint <= 69
            ? "C"
            : genPoint >= 70 && genPoint <= 79
            ? "B"
            : genPoint >= 80 && genPoint <= 100
            ? "A"
            : null;

        const nice = await cardReportModel.findByIdAndUpdate(
          report?.id,
          {
            points: resultNumb,
            grade: "Nill",
          },
          { new: true }
        );
        student?.reportCard?.push(new Types.ObjectId(nice?._id));
        student?.save();

        subjectData?.reportCard?.push(new Types.ObjectId(nice?._id));
        subjectData?.save();

        // school?.reportCard.push(new Types.ObjectId(report._id));
        // school?.save();

        return res.status(201).json({
          message: "report entry created successfully",
          data: { nice, student },
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

export const classTeacherPhychoReportRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID, classID } = req.params;

    const {
      confidence,
      presentational,
      hardworking,
      resilient,
      sportship,
      empathy,
      punctuality,
      communication,
      leadership,
    } = req.body;

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
        el.classInfo ===
        `${
          student?.classAssigned
        } session: ${school?.presentSession!}(${school?.presentTerm!})`
      );
    });

    const teacher: any = await staffModel.findById(teacherID);

    const teacherClassDataRomm = teacher?.classesAssigned.find((el: any) => {
      return el.className === student?.classAssigned;
    });

    if (teacherClassDataRomm?.className === student?.classAssigned) {
      const report = await cardReportModel.findByIdAndUpdate(
        getReportSubject?._id,
        {
          peopleSkill: [
            {
              confidence,
              presentational,
              hardworking,
              resilient,
            },
          ],
          softSkill: [
            {
              empathy,
              punctuality,
              communication,
              leadership,
            },
          ],
          physicalSkill: [
            {
              sportship,
            },
          ],
          psycho: true,
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
        el.classInfo ===
        `${
          student?.classAssigned
        } session: ${school?.presentSession!}(${school?.presentTerm!})`
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
    const { teacherComment, attendance } = req.body;

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
        el.classInfo ===
        `${
          student?.classAssigned
        } session: ${school?.presentSession!}(${school?.presentTerm!})`
      );
    });

    const teacher: any = await staffModel.findById(teacherID);

    const teacherClassDataRomm = teacher?.classesAssigned.find((el: any) => {
      return el.className === student?.classAssigned;
    });

    if (teacherClassDataRomm?.className === student?.classAssigned) {
      const report = await cardReportModel.findByIdAndUpdate(
        getReportSubject?._id,
        {
          attendance,
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

export const studentPsychoReport = async (
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
