import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import sessionModel from "../model/sessionModel";
import { Types } from "mongoose";
import studentModel from "../model/studentModel";
import termModel from "../model/termModel";
import classroomModel from "../model/classroomModel";
import classHistoryModel from "../model/classHistory";
import staffModel from "../model/staffModel";

export const createSchoolSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { year, term } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName) {
      const session = await sessionModel.create({
        year,
        term,
      });

      school.session.push(new Types.ObjectId(session._id));
      school.save();

      return res.status(201).json({
        message: "session created successfully",
        data: session,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
    });
  }
};

export const createNewSchoolSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { year } = req.body;

    let paid = 0;
    let notPaid = 0;

    const school: any = await schoolModel
      .findById(schoolID)
      .populate({ path: "students" });

    const schoolClass: any = await schoolModel
      .findById(schoolID)
      .populate({ path: "classRooms" });

    const schoolTeacher: any = await schoolModel
      .findById(schoolID)
      .populate({ path: "staff" });

    const schl = await schoolModel.findByIdAndUpdate(
      schoolID,
      {
        presentSession: year,
        // presentSessionID: year,
      },
      { new: true }
    );

    // const schoolStudents: any = await schoolModel
    //   .findById(schoolID)
    //   .populate({ path: "students" });

    // const pushClass = await schoolModel.findById(schoolID).populate({
    //   path: "classHistory",
    // });

    let totalStudent = school?.students?.length;
    let totalStaff = school?.staff?.length;
    let totalSubjects = school?.subjects?.length;

    const students: any = school?.students;

    if (school && school.schoolName) {
      for (let i of students!) {
        totalStudent++;
        if (i.feesPaid1st || i.feesPaid2nd || i.feesPaid2nd) {
          paid++;
          await studentModel.findByIdAndUpdate(
            i?._id,
            { feesPaid1st: false, feesPaid2nd: false, feesPaid3rd: false }
            // { new: true }
          );
        } else {
          notPaid++;
        }
      }

      const session = await sessionModel.create({
        schoolID,
        year,
        // term,
        totalStudents: totalStudent,
        numberOfTeachers: totalStaff,
        numberOfSubjects: totalSubjects,
        studentFeesNotPaid: notPaid,
        studentFeesPaid: paid,
      });

      const schoolData = schoolModel.findByIdAndUpdate(
        schoolID,
        { presentSessionID: session?._id.toString() },
        { new: true }
      );

      school.session.push(new Types.ObjectId(session._id));

      school.classHistory.push(new Types.ObjectId(session?._id));
      school.save();

      schoolClass?.classRooms.find((el: any) => {
        return;
      });

      for (let i of schoolClass?.classRooms) {
        let num: number = parseInt(`${i.className}`?.match(/\d+/)![0]);
        let name = i?.className?.split(`${num}`);
        // {name[0].trim()} ${num + 1}${name[1].trim()}

        if (num < 4 && name[0].trim() === "JSS") {
          await classroomModel.findByIdAndUpdate(
            i?._id,
            {
              className: `
              ${
                num + 1 > 3
                  ? `SSS ${1}${name[1]?.trim()}`
                  : `${name[0]?.trim()} ${num + 1}${name[1]?.trim()}`
              }
              
              `,
            },
            { new: true }
          );
        } else if (num < 3 && name[0]?.trim() === "SSS") {
          await classroomModel.findByIdAndUpdate(
            i?._id,
            {
              className: `
              ${name[0]?.trim()} ${num + 1}${name[1]?.trim()}

              `,
            },
            { new: true }
          );
        } else {
          await classroomModel.findByIdAndDelete(i?._id);
          schoolClass.classRooms.pull(new Types.ObjectId(i?._id));

          school?.classRooms?.pull(new Types.ObjectId(i?._id));
          school.save();
        }
      }

      for (let i of students!) {
        let num: number = parseInt(`${i.classAssigned}`?.match(/\d+/)![0]);
        let name = i?.classAssigned?.split(`${num}`);

        if (num < 4 && name[0].trim() === "JSS") {
          await studentModel.findByIdAndUpdate(
            i?._id,
            {
              classAssigned: ` ${
                num + 1 > 3
                  ? `SSS ${1}${name[1]?.trim()}`
                  : `${name[0]?.trim()} ${num + 1}${name[1]?.trim()}`
              }`,
              attendance: null,
              performance: null,
              feesPaid1st: false,
              feesPaid2nd: false,
              feesPaid3rd: false,
            },
            { new: true }
          );
        } else if (num < 3 && name[0]?.trim() === "SSS") {
          await studentModel.findByIdAndUpdate(
            i?._id,
            {
              classAssigned: ` ${`${name[0]?.trim()} ${
                num + 1
              }${name[1]?.trim()}`}`,
              attendance: null,
              performance: null,
              feesPaid1st: false,
              feesPaid2nd: false,
              feesPaid3rd: false,
            },
            { new: true }
          );
        } else {
          await studentModel.findByIdAndDelete(i?._id);
          schoolClass.students.pull(new Types.ObjectId(i?._id));
          school?.students.pull(new Types.ObjectId(i?._id));
          school?.save();
        }
      }

      for (let i of schoolTeacher?.staff!) {
        i?.classesAssigned.map(async (el: any) => {
          let num: number = parseInt(`${el?.className}`?.match(/\d+/)![0])
            ? parseInt(`${el?.className}`?.match(/\d+/)![0])
            : 0;
          let name = el?.className?.split(`${num}`);

          if (num < 4 && name[0].trim() === "JSS") {
            el.className = ` ${
              num + 1 > 3
                ? `SSS ${1}${name[1]?.trim()}`
                : `${name[0]?.trim()} ${num + 1}${name[1]?.trim()}`
            }`;
            console.log(el.className);
          } else if (num < 3 && name[0]?.trim() === "SSS") {
            el.className = ` ${`${name[0]?.trim()} ${
              num + 1
            }${name[1]?.trim()}`}`;
          } else {
            console.log("Ended successfully");
          }
        });
        i.save();
      }

      schoolTeacher.save();

      return res.status(201).json({
        message: "session created successfully",
        data: session,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error,
      error: error.stack,
    });
  }
};

export const viewSchoolSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID).populate({
      path: "session",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "viewing school session",
      data: school?.session,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error viewing school session",
      data: error.message,
    });
  }
};

export const viewSchoolPresentSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { sessionID } = req.params;

    const school = await sessionModel.findById(sessionID).populate({
      path: "term",
    });

    return res.status(200).json({
      message: "viewing school session now!",
      data: school,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error viewing school session",
      data: error.message,
    });
  }
};

export const viewSchoolPresentSessionTerm = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { termID } = req.params;

    const school = await termModel.findById(termID);

    return res.status(200).json({
      message: "viewing school session",
      data: school,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error viewing school session",
      data: error.message,
    });
  }
};

export const studentsPerSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { sessionID } = req.params;
    const { totalStudents } = req.body;
    const session = await sessionModel.findById(sessionID);

    if (session) {
      const students = await sessionModel.findByIdAndUpdate(
        sessionID,
        { totalStudents },
        { new: true }
      );
      return res.status(200).json({
        message: "viewing session session",
        data: students,
      });
    } else {
      return res.status(404).json({
        message: "Error finding school session",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing school session",
    });
  }
};

export const termPerSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { sessionID } = req.params;
    let { term } = req.body;

    const session: any = await sessionModel.findById(sessionID).populate({
      path: "term",
    });

    const schoolClass: any = await schoolModel
      .findById(session?.schoolID)
      .populate({ path: "classRooms" });

    if (session) {
      if (
        term === "1st Term" ||
        term === "First Term" ||
        term === "2nd Term" ||
        term === "Second Term" ||
        term === "3rd Term" ||
        term === "Third Term"
      ) {
        const capitalizedText = (str: string): string => {
          let result: string = "";

          let word: string[] = str.split(" ");

          for (let i of word) {
            result = result + i[0].toUpperCase().concat(i.slice(1), " ");
          }

          return result.trim();
        };

        const check = session.term.some((el: any) => {
          return el.term === capitalizedText(term);
        });

        if (check) {
          return res.status(404).json({
            message: "Term Already exist",
          });
        } else {
          // presentTerm

          const viewDetail = await termModel.findById(
            session?.term[session?.term.length - 1]?._id!
          );

          let resultHist: any[] = [];

          for (let i of schoolClass?.classRooms!) {
            resultHist.push({ ...i });

            await termModel.findByIdAndUpdate(
              session?.term[session?.term.length - 1]?._id!,
              {
                classResult: resultHist,
              },
              { new: true }
            );
          }

          const sessionRecorde = await sessionModel.findByIdAndUpdate(
            sessionID,
            { presentTerm: capitalizedText(term) },
            { new: true }
          );

          for (let i of schoolClass?.classRooms!) {
            await classroomModel.findByIdAndUpdate(
              i?._id,
              {
                presentTerm: capitalizedText(term),
                attendance: [],
                timeTable: [],
                lessonNotes: [],
                reportCard: [],
                assignment: [],
                assignmentResolve: [],
                weekStudent: {},
              },
              { new: true }
            );
          }

          const sessionTerm: any = await termModel.create({
            term: capitalizedText(term),
            year: session?.year,
            presentTerm: term,
          });

          await schoolModel.findByIdAndUpdate(
            sessionRecorde?.schoolID,
            {
              presentTermID: sessionTerm?._id?.toString(),
              presentSessionID: sessionID,
              presentTerm: term,
            },
            { new: true }
          );

          session?.term.push(new Types.ObjectId(sessionTerm?._id));
          session?.save();

          if (schoolClass?.session?.length > 1 || session?.term?.length > 1) {
            await schoolModel.findByIdAndUpdate(
              sessionRecorde?.schoolID,
              {
                presentTermID: sessionTerm?._id?.toString(),
                freeMode: false,
              },
              { new: true }
            );
          }

          return res.status(200).json({
            message: "creating session term",
            data: sessionTerm,
            status: 201,
          });
        }
      } else {
        return res.status(404).json({
          message: "Term can't be created",
        });
      }
    } else {
      return res.status(404).json({
        message: "Error finding school session",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing school session",
    });
  }
};

export const viewTerm = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { termID } = req.params;

    const getAll = await termModel.findById(termID);

    return res.status(200).json({
      message: "viewing term details",
      data: getAll,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "error getting session",
      data: error.message,
    });
  }
};

export const getAllSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const getAll = await sessionModel.find().populate({
      path: "term",
    });
    return res.status(200).json({
      message: "all session gotten",
      data: getAll,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "error getting session",
      data: error.message,
    });
  }
};

export const updateTermPay = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { termID } = req.params;
    const { costPaid, payRef } = req.body;

    const getAll = await termModel.findByIdAndUpdate(
      termID,
      {
        plan: true,
        costPaid,
        payRef,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Term payment has been recorded successfully",
      data: getAll,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "error getting session",
      data: error.message,
    });
  }
};

export const createSessionHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;
    const { text } = req.body;

    const getClassRoom = await classroomModel.findById(classID);
    const teacher = await staffModel.findById(getClassRoom?.teacherID);

    const getSchool: any = await schoolModel
      .findById(teacher?.schoolIDs)
      .populate({ path: "session" });

    let history = [];

    for (let i of getClassRoom?.students!) {
      let getStudentsData = await studentModel
        .findById(i)
        .populate({ path: "reportCard" });

      history.push(getStudentsData);
    }

    const getAll = await classHistoryModel.create({
      resultHistory: history,
      session: getSchool?.session[0]?.year!,
      term: getSchool?.session[0]?.presentTerm!,
      classTeacherName: getClassRoom?.classTeacherName,
      className: getClassRoom?.className,
      principalsRemark: text,
    });

    getClassRoom?.classHistory.push(new Types.ObjectId(getAll?._id));
    getClassRoom?.save();

    return res.status(200).json({
      message: "all session gotten",
      data: getAll,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "error getting session",
      data: error.message,
    });
  }
};

export const getAllClassSessionResults = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;
    const getAll = await classroomModel.findById(classID).populate({
      path: "classHistory",
    });
    return res.status(200).json({
      message: "all session gotten",
      data: getAll,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "error getting session",
      data: error.message,
    });
  }
};
