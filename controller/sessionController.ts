import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import sessionModel from "../model/sessionModel";
import { Types } from "mongoose";
import studentModel from "../model/studentModel";
import termModel from "../model/termModel";

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
    const { year, term } = req.body;

    let paid = 0;
    let notPaid = 0;

    const school: any = await schoolModel
      .findById(schoolID)
      .populate({ path: "students" });

    let totalStudent = 0;
    const totalStaff = school?.staff?.length;
    const totalSubjects = school?.subjects?.length;

    const students: any = school?.students;

    if (school && school.schoolName) {
      for (let i of students!) {
        totalStudent++;
        if (i.feesPaid1st || i.feesPaid2nd || i.feesPaid2nd) {
          paid++;
          await studentModel.findByIdAndUpdate(
            i?._id,
            { feesPaid1st: false, feesPaid2nd: false, feesPaid3rd: false },
            { new: true }
          );
        } else {
          notPaid++;
        }
      }

      const session = await sessionModel.create({
        year,
        // term,
        totalStudents: totalStudent,
        numberOfTeachers: totalStaff,
        numberOfSubjects: totalSubjects,
        studentFeesNotPaid: notPaid,
        studentFeesPaid: paid,
      });

      school.session.push(new Types.ObjectId(session._id));
      school.save();

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
      data: error.message,
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

    const school = await sessionModel.findById(sessionID);

    console.log("read");
    console.log(sessionID);
    console.log(school);

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
    const session = await sessionModel.findById(sessionID).populate({
      path: "term",
    });

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
          const sessionTerm = await termModel.create({
            term: capitalizedText(term),
            year: session?.year,
          });

          session?.term.push(new Types.ObjectId(sessionTerm?._id));
          session?.save();

          return res.status(200).json({
            message: "creating session term",
            data: sessionTerm,
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
