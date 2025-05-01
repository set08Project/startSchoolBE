import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import studentModel from "../model/studentModel";
import outGoneStudentModel from "../model/outGoneStudentModel";
import { Types } from "mongoose";

export const createSchoolOutGoneStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const student: any = await studentModel.findById(studentID);

    if (school && school.schoolName && school.status === "school-admin") {
      const checkFirst = (school?.students as Types.ObjectId[]).some(
        (el: any) => el.toString() === `${studentID}`
      );

      if (checkFirst) {
        const classes = await outGoneStudentModel.create({
          studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
          student: studentID,
          schoolInfo: schoolID,
        });

        school.students = (school?.students as Types.ObjectId[]).filter(
          (id) => !id.equals(new Types.ObjectId(studentID))
        );

        school?.outGoneStudents.push(new Types.ObjectId(classes._id));
        school.save();

        return res.status(201).json({
          message: "student added to outgoing list successfully",
          data: classes,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "student not found",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "school not found",
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

export const viewSchoolOutGoneStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const announcement = await schoolModel.findById(schoolID).populate({
      path: "outGoneStudents",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "announcement read successfully",
      data: announcement,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school announcement",
      status: 404,
    });
  }
};

export const findSchoolOutGoneStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { studentName } = req.body;

    const announcement = await schoolModel
      .findById(schoolID)
      .populate({
        path: "outGoneStudents",
        options: {
          sort: {
            createdAt: -1,
          },
        },
      })
      .find({ studentName });

    return res.status(201).json({
      message: "announcement read successfully",
      data: announcement,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school announcement",
      status: 404,
    });
  }
};
