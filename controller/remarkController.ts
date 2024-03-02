import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import sessionModel from "../model/sessionModel";
import { Types } from "mongoose";
import studentModel from "../model/studentModel";
import staffModel from "../model/staffModel";
import remarkModel from "../model/studentRemark";
import moment from "moment";

export const createRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID } = req.params;
    const { remark } = req.body;

    const teacher = await staffModel.findById(teacherID);
    const student: any = await studentModel.findById(studentID);

    if (teacher && student) {
      const fridayDate = Date.now();
      const readDate = moment(fridayDate).days();
      console.log(readDate);
      if (readDate === 5) {
        const remarkData = await remarkModel.create({
          remark,
        });

        student.remark.push(new Types.ObjectId(remarkData._id));
        student?.save();

        teacher.remark.push(new Types.ObjectId(remarkData._id));
        teacher.save();

        return res.status(201).json({
          message: "remark created successfully",
          data: remarkData,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Report can only be done on FRIDAYS",
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating remake for Student",
      data: error.message,
    });
  }
};

export const viewStudentRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const student = await studentModel.findById(studentID).populate({
      path: "remark",
    });

    return res.status(200).json({
      message: "viewing school remark",
      data: student?.remark,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error viewing school session",
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
    const { term } = req.body;
    const session = await sessionModel.findById(sessionID);

    if (session) {
      const students = await sessionModel.findByIdAndUpdate(
        sessionID,
        { term },
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
