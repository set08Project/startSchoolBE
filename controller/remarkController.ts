import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import sessionModel from "../model/sessionModel";
import { Types } from "mongoose";
import studentModel from "../model/studentModel";
import staffModel from "../model/staffModel";
import remarkModel from "../model/studentRemark";

export const createRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID } = req.params;
    const { remark } = req.body;

    const teacher = await staffModel.findById(teacherID);
    const student: any = await studentModel.findById(studentID);

    if (teacher) {
      const remarkData = await remarkModel.create({
        remark,
      });

      teacher.remark.push(new Types.ObjectId(remarkData._id));
      teacher.save();

      student.remark.push(new Types.ObjectId(remarkData._id));
      student?.save();

      return res.status(201).json({
        message: "remark created successfully",
        data: remarkData,
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
