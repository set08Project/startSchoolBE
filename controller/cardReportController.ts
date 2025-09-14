import { Request, Response } from "express";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import { Types } from "mongoose";
import cardReportModel from "../model/cardReportModel";
import studentModel from "../model/studentModel";
import schoolModel from "../model/schoolModel";
import classroomModel from "../model/classroomModel";
import midReportCardModel from "../model/midReportCardModel";
import studentHistoricalResultModel from "../model/studentHistoricalResultModel";

export const createReportCardEntry = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID } = req.params;
    const {
      subject,
      test1 = 0,
      test2 = 0,
      test3 = 0,
      test4 = 0,
      exam = 0,
    } = req.body;

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
        `${
          student?.classAssigned
        } session: ${school?.presentSession!}(${school?.presentTerm!})`
      );
    });
    // presentSession;

    if (teacher && student) {
      if (studentCheck) {
        console.log("Awesome!!");

        const getReportSubject: any = await studentModel
          .findById(studentID)
          .populate({
            path: "reportCard",
          });

        const getData: any = getReportSubject?.reportCard?.find((el: any) => {
          return (
            el.classInfo ===
            `${
              student?.classAssigned
            } session: ${school?.presentSession!}(${school?.presentTerm!})`
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
          let x1 = 0;
          let x2 = 0;
          let x3 = 0;
          let x4 = !test4 ? read?.test4 : test4 ? test4 : 0;
          let x5 = !exam ? read?.exam : exam ? exam : 0;

          let y1 = 0;
          let y2 = 0;
          let y3 = 0;
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
                  test1: 0,
                  test2: 0,
                  test3: 0,
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

          let xx =
            genPoint >= 0 && genPoint <= 5
              ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
              : genPoint >= 6 && genPoint <= 11
              ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
              : genPoint >= 11 && genPoint <= 15
              ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
              : genPoint >= 16 && genPoint <= 21
              ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
              : genPoint >= 21 && genPoint <= 25
              ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
              : genPoint >= 26 && genPoint <= 31
              ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
              : genPoint >= 31 && genPoint <= 35
              ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
              : genPoint >= 36 && genPoint <= 41
              ? "You are starting to grasp the material, but more depth and accuracy are needed."
              : genPoint >= 41 && genPoint <= 45
              ? "An acceptable effort, but there is room for improvement in clarity and depth"
              : genPoint >= 46 && genPoint <= 51
              ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
              : genPoint >= 51 && genPoint <= 55
              ? "You are making progress but need to develop your analysis further to meet the standard"
              : genPoint >= 56 && genPoint <= 61
              ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
              : genPoint >= 61 && genPoint <= 65
              ? "Good work; keep striving for excellence."
              : genPoint >= 66 && genPoint <= 71
              ? "A solid understanding is evident, though there are areas to refine."
              : genPoint >= 71 && genPoint <= 75
              ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
              : genPoint >= 76 && genPoint <= 81
              ? "Strong work overall! A little more attention to detail could make it exceptional!"
              : genPoint >= 81 && genPoint <= 85
              ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
              : genPoint >= 86 && genPoint <= 91
              ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
              : genPoint >= 91 && genPoint <= 95
              ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
              : genPoint >= 96 && genPoint <= 100
              ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
              : ``;

          let nice = await cardReportModel.findByIdAndUpdate(
            report?.id,
            {
              points: genPoint,
              adminComment: x,
              classTeacherComment: xx,
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
          let x1 = 0;
          let x2 = 0;
          let x3 = 0;
          let x4 = !test4 ? read?.test4 : test4 ? test4 : 0;
          let x5 = !exam ? read?.exam : exam ? exam : 0;

          let y1 = 0;
          let y2 = 0;
          let y3 = 0;
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
              test1: 0,
              test2: 0,
              test3: 0,
              test4,
              exam,
            },
          ],
          classInfo: `${
            student?.classAssigned
          } session: ${school?.presentSession!}(${school?.presentTerm!})`,
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
        console.log("report data: ");
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

export const createMidReportCardEntry = async (
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
      path: "midReportCard",
    });

    const subjectData = await subjectModel.findOne({ subjectTitle: subject });

    const studentCheck = student?.midReportCard.some((el: any) => {
      return (
        el.classInfo ===
        `${
          student?.classAssigned
        } session: ${school?.presentSession!}(${school?.presentTerm!})`
      );
    });

    if (teacher && student) {
      if (studentCheck) {
        // check
        const getReportSubject: any = await studentModel
          .findById(studentID)
          .populate({
            path: "midReportCard",
          });

        const getData: any = getReportSubject?.midReportCard?.find(
          (el: any) => {
            return (
              el.classInfo ===
              `${
                student?.classAssigned
              } session: ${school?.presentSession!}(${school?.presentTerm!})`
            );
          }
        );

        const data = getReportSubject?.midReportCard?.find((el: any) => {
          return el.result.find((el: any) => {
            return el.subject === subject;
          });
        });

        const dataFIle = getReportSubject?.midReportCard?.find((el: any) => {
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
          console.log("This is Second Create");
          await midReportCardModel.create({
            result: [
              {
                subject,
                test1: 0,
                test2: 0,
                test3: 0,
                test4,
                exam,
                total: exam,
                grade:
                  exam >= 0 && exam <= 39
                    ? "F9"
                    : exam >= 39 && exam <= 44
                    ? "E8"
                    : exam >= 44 && exam <= 49
                    ? "D7"
                    : exam >= 49 && exam <= 54
                    ? "C6"
                    : exam >= 54 && exam <= 59
                    ? "C5"
                    : exam >= 59 && exam <= 64
                    ? "C4"
                    : exam >= 64 && exam <= 69
                    ? "B3"
                    : exam >= 69 && exam <= 74
                    ? "B2"
                    : exam >= 74 && exam <= 100
                    ? "A1"
                    : null,
              },
            ],
            classInfo: `${
              student?.classAssigned
            } session: ${school?.presentSession!}(${school?.presentTerm!})`,
            studentID,
          });

          const report: any = await midReportCardModel.findByIdAndUpdate(
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

          let xx =
            genPoint >= 0 && genPoint <= 5
              ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
              : genPoint >= 6 && genPoint <= 11
              ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
              : genPoint >= 11 && genPoint <= 15
              ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
              : genPoint >= 16 && genPoint <= 21
              ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
              : genPoint >= 21 && genPoint <= 25
              ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
              : genPoint >= 26 && genPoint <= 31
              ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
              : genPoint >= 31 && genPoint <= 35
              ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
              : genPoint >= 36 && genPoint <= 41
              ? "You are starting to grasp the material, but more depth and accuracy are needed."
              : genPoint >= 41 && genPoint <= 45
              ? "An acceptable effort, but there is room for improvement in clarity and depth"
              : genPoint >= 46 && genPoint <= 51
              ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
              : genPoint >= 51 && genPoint <= 55
              ? "You are making progress but need to develop your analysis further to meet the standard"
              : genPoint >= 56 && genPoint <= 61
              ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
              : genPoint >= 61 && genPoint <= 65
              ? "Good work; keep striving for excellence."
              : genPoint >= 66 && genPoint <= 71
              ? "A solid understanding is evident, though there are areas to refine."
              : genPoint >= 71 && genPoint <= 75
              ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
              : genPoint >= 76 && genPoint <= 81
              ? "Strong work overall! A little more attention to detail could make it exceptional!"
              : genPoint >= 81 && genPoint <= 85
              ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
              : genPoint >= 86 && genPoint <= 91
              ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
              : genPoint >= 91 && genPoint <= 95
              ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
              : genPoint >= 96 && genPoint <= 100
              ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
              : ``;

          let nice = await midReportCardModel.findByIdAndUpdate(
            report?.id,
            {
              points: genPoint,
              adminComment: x,
              classTeacherComment: xx,
              grade,
            },
            { new: true }
          );
          console.log("report: ", nice);
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
          const report = await midReportCardModel.findByIdAndUpdate(
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

          let nice = await midReportCardModel.findByIdAndUpdate(
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
        console.log("This is Third Create");
        const report = await midReportCardModel.create({
          result: [
            {
              subject,
              test1: 0,
              test2: 0,
              test3: 0,
              test4,
              exam,
              total: exam,
              grade:
                exam >= 0 && exam <= 39
                  ? "F9"
                  : exam >= 39 && exam <= 44
                  ? "E8"
                  : exam >= 44 && exam <= 49
                  ? "D7"
                  : exam >= 49 && exam <= 54
                  ? "C6"
                  : exam >= 54 && exam <= 59
                  ? "C5"
                  : exam >= 59 && exam <= 64
                  ? "C4"
                  : exam >= 64 && exam <= 69
                  ? "B3"
                  : exam >= 69 && exam <= 74
                  ? "B2"
                  : exam >= 74 && exam <= 100
                  ? "A1"
                  : null,
            },
          ],
          classInfo: `${
            student?.classAssigned
          } session: ${school?.presentSession!}(${school?.presentTerm!})`,
          studentID,
        });

        let genPointScore = parseFloat(
          (
            report?.result
              ?.map((el: any) => {
                return el.exam;
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

        let x =
          genPointScore >= 0 && genPointScore <= 5
            ? "This is a very poor result."
            : genPointScore >= 6 && genPointScore <= 11
            ? "This result is poor; it's not satisfactory."
            : genPointScore >= 11 && genPointScore <= 15
            ? "Below average; needs significant improvement."
            : genPointScore >= 16 && genPointScore <= 21
            ? "Below average; more effort required."
            : genPointScore >= 21 && genPointScore <= 25
            ? "Fair but not satisfactory; strive harder."
            : genPointScore >= 26 && genPointScore <= 31
            ? "Fair performance; potential for improvement."
            : genPointScore >= 31 && genPointScore <= 35
            ? "Average; a steady effort is needed."
            : genPointScore >= 36 && genPointScore <= 41
            ? "Average; showing gradual improvement."
            : genPointScore >= 41 && genPointScore <= 45
            ? "Slightly above average; keep it up."
            : genPointScore >= 46 && genPointScore <= 51
            ? "Decent work; shows potential."
            : genPointScore >= 51 && genPointScore <= 55
            ? "Passable; satisfactory effort."
            : genPointScore >= 56 && genPointScore <= 61
            ? "Satisfactory; good progress."
            : genPointScore >= 61 && genPointScore <= 65
            ? "Good work; keep striving for excellence."
            : genPointScore >= 66 && genPointScore <= 71
            ? "Commendable effort; very good."
            : genPointScore >= 71 && genPointScore <= 75
            ? "Very good; consistent effort is visible."
            : genPointScore >= 76 && genPointScore <= 81
            ? "Excellent performance; well done!"
            : genPointScore >= 81 && genPointScore <= 85
            ? "Exceptional result; keep up the great work!"
            : genPointScore >= 86 && genPointScore <= 91
            ? "Outstanding achievement; impressive work!"
            : genPointScore >= 91 && genPointScore <= 95
            ? "Brilliant performance; you’re a star!"
            : genPointScore >= 96 && genPointScore <= 100
            ? "Outstanding achievement; impressive work!"
            : ``;

        let xx =
          genPointScore >= 0 && genPointScore <= 5
            ? "The submission demonstrates a lack of understanding of the topic. Please see me for guidance"
            : genPointScore >= 6 && genPointScore <= 11
            ? "Very minimal effort is evident in the work. It's essential to review the material thoroughly."
            : genPointScore >= 11 && genPointScore <= 15
            ? "This effort does not meet the basic requirements. Please focus on the foundational concepts."
            : genPointScore >= 16 && genPointScore <= 21
            ? "The response is incomplete and lacks critical understanding. Improvement is needed in future submissions."
            : genPointScore >= 21 && genPointScore <= 25
            ? "Some attempt is evident, but significant gaps in understanding remain. More effort is required."
            : genPointScore >= 26 && genPointScore <= 31
            ? "The work shows minimal understanding of the topic. Focus on building your foundational knowledge."
            : genPointScore >= 31 && genPointScore <= 35
            ? "A basic attempt is made, but it falls short of expectations. Review the feedback to improve"
            : genPointScore >= 36 && genPointScore <= 41
            ? "You are starting to grasp the material, but more depth and accuracy are needed."
            : genPointScore >= 41 && genPointScore <= 45
            ? "An acceptable effort, but there is room for improvement in clarity and depth"
            : genPointScore >= 46 && genPointScore <= 51
            ? "Some understanding is demonstrated, but key concepts are missing or incorrect."
            : genPointScore >= 51 && genPointScore <= 55
            ? "You are making progress but need to develop your analysis further to meet the standard"
            : genPointScore >= 56 && genPointScore <= 61
            ? "A decent attempt that meets some expectations but lacks polish and depth in certain areas"
            : genPointScore >= 61 && genPointScore <= 65
            ? "Good work; keep striving for excellence."
            : genPointScore >= 66 && genPointScore <= 71
            ? "A solid understanding is evident, though there are areas to refine."
            : genPointScore >= 71 && genPointScore <= 75
            ? "This work meets expectations and demonstrates clear effort. Great job, but there's room for more depth."
            : genPointScore >= 76 && genPointScore <= 81
            ? "Strong work overall! A little more attention to detail could make it exceptional!"
            : genPointScore >= 81 && genPointScore <= 85
            ? "Well done! You have a good grasp of the material. Aim for more critical analysis next time!"
            : genPointScore >= 86 && genPointScore <= 91
            ? "Excellent work! You’ve exceeded expectations. Keep up the fantastic effort!"
            : genPointScore >= 91 && genPointScore <= 95
            ? "Outstanding! Your understanding and presentation are impressive. A near-perfect submission!"
            : genPointScore >= 96 && genPointScore <= 100
            ? "Perfect! Flawless work that reflects deep understanding and careful attention to detail. Congratulation!"
            : ``;
        const nice = await midReportCardModel.findByIdAndUpdate(
          report?.id,
          {
            points: resultNumb,

            adminComment: x,
            classTeacherComment: xx,
            grade:
              exam >= 0 && exam <= 39
                ? "F9"
                : exam >= 39 && exam <= 44
                ? "E8"
                : exam >= 44 && exam <= 49
                ? "D7"
                : exam >= 49 && exam <= 54
                ? "C6"
                : exam >= 54 && exam <= 59
                ? "C5"
                : exam >= 59 && exam <= 64
                ? "C4"
                : exam >= 64 && exam <= 69
                ? "B3"
                : exam >= 69 && exam <= 74
                ? "B2"
                : exam >= 74 && exam <= 100
                ? "A1"
                : null,
          },
          { new: true }
        );

        student?.midReportCard?.push(new Types.ObjectId(nice?._id));
        student?.save();

        subjectData?.midReportCard?.push(new Types.ObjectId(nice?._id));
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

        const report = await midReportCardModel.findByIdAndUpdate(
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

    const studentHistory = await studentModel.findById(studentID).populate({
      path: "historicalResult",
    });

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

      console.log("This is the report: ", report);

      const result = await studentHistoricalResultModel.create({
        results: report?.result,
        totalPoints: report?.points,
        mainGrade: report?.grade,
        classInfo: report?.classInfo,
        session: school?.presentSession,
        term: school?.presentTerm,
        adminComment: report?.adminComment,
        classTeacherComment: report?.classTeacherComment,
        school,
        student,
      });

      student?.historicalResult?.push(new Types.ObjectId(result._id));
      student?.save();

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
    const x = student?.presentClassID;

    const xx = teacher?.classesAssigned?.find((el: any) => {
      return el?.classID === `${x}`;
    });

    if (xx?.classID === x) {
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

export const classTeacherMidReportRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID, classID } = req.params;
    const { teacherComment, attendance } = req.body;

    const student: any = await studentModel
      .findById(studentID)
      .populate({ path: "midReportCard" });

    const classRM = await classroomModel.findById(classID);

    const school: any = await schoolModel
      .findById(student?.schoolIDs)
      .populate({
        path: "session",
      });

    const getReportSubject: any = student?.midReportCard.find((el: any) => {
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
      const report = await midReportCardModel.findByIdAndUpdate(
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

export const adminMidReportRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID, schoolID } = req.params;
    const { adminComment } = req.body;

    const student = await studentModel.findById(studentID).populate({
      path: "midReportCard",
    });

    const school: any = await schoolModel.findById(schoolID).populate({
      path: "session",
    });

    const getReportSubject: any = student?.midReportCard.find((el: any) => {
      return (
        el.classInfo ===
        `${
          student?.classAssigned
        } session: ${school?.presentSession!}(${school?.presentTerm!})`
      );
    });

    if (school) {
      const report = await midReportCardModel.findByIdAndUpdate(
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

export const studentMidReportRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const student: any = await studentModel
      .findById(studentID)
      .populate({ path: "midReportCard" });

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
