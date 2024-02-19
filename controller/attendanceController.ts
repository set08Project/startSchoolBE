import schoolModel from "../model/schoolModel";
import { Types } from "mongoose";
import { Request, Response } from "express";
import crypto from "crypto";
import studentModel from "../model/studentModel";
import attendanceModel from "../model/attendanceModel";
import moment from "moment";
import staffModel from "../model/staffModel";
import classroomModel from "../model/classroomModel";

export const createAttendancePresent = async (req: Request, res: Response) => {
  try {
    const getTeacher = await staffModel.findById(req.params.teacherID);
    const getStudent = await studentModel.findById(req.params.studentID);

    const getClass = await classroomModel.findOne({
      className: getStudent!.classAssigned,
    });

    if (getTeacher && getStudent) {
      const code = crypto.randomBytes(2).toString("hex");
      const dater = Date.now();

      const attendance = await attendanceModel.create({
        className: getStudent!.classAssigned,
        classToken: code,
        present: true,
        absent: null,
        studentFirstName: getStudent!.studentFirstName,
        studentLastName: getStudent!.studentLastName,
        classTeacher: getTeacher!.staffName,
        dateTime: `${moment(dater).format("dddd")}, ${moment(dater).format(
          "MMMM Do YYYY"
        )}`,

        date: `${moment(dater).format("dddd")}`,
      });

      getTeacher!.attendance!.push(new Types.ObjectId(attendance._id));
      getTeacher?.save();

      getClass!.attendance!.push(new Types.ObjectId(attendance._id));
      getClass?.save();

      getStudent!.attendance!.push(new Types.ObjectId(attendance._id));
      getStudent?.save();

      return res.status(201).json({
        message: "student has been marked Present for today",
        data: attendance,
      });
    } else {
      return res.status(404).json({ message: "student can't be found" });
    }
  } catch (error) {
    return res.status(404).json({ message: `Error: ${error}` });
  }
};

export const createAttendanceAbsent = async (req: Request, res: Response) => {
  try {
    const getTeacher = await staffModel.findById(req.params.teacherID);
    const getStudent = await studentModel.findById(req.params.studentID);

    // console.log(getTeacher);
    console.log(getStudent);

    const getClass = await classroomModel.findOne({
      className: getStudent!.classAssigned,
    });

    if (getTeacher && getStudent) {
      const code = crypto.randomBytes(2).toString("hex");
      const dater = Date.now();

      const attendance = await attendanceModel.create({
        className: getStudent!.classAssigned,
        classToken: code,
        present: null,
        absent: true,
        studentFirstName: getStudent!.studentFirstName,
        studentLastName: getStudent!.studentLastName,
        classTeacher: getTeacher!.staffName,
        dateTime: `${moment(dater).format("dddd")}, ${moment(dater).format(
          "MMMM Do YYYY"
        )}`,

        date: `${moment(dater).format("dddd")}`,
      });

      getTeacher!.attendance!.push(new Types.ObjectId(attendance._id));
      getTeacher?.save();

      getClass!.attendance!.push(new Types.ObjectId(attendance._id));
      getClass?.save();

      getStudent!.attendance!.push(new Types.ObjectId(attendance._id));
      getStudent?.save();

      return res.status(201).json({
        message: "student has been marked Present for today",
        data: attendance,
      });
    } else {
      return res.status(404).json({ message: "student can't be found" });
    }
  } catch (error) {
    return res.status(404).json({ message: `Error: ${error}` });
  }
};

export const viewStudentAttendanceByTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const attendance = await classroomModel
      .findById(req.params.teacherID)
      .populate({
        path: "attendance",
        options: { sort: { createdAt: -1 } },
      });

    return res.status(200).json({
      message: `Viewing attendance attendance detail...!`,
      data: attendance,
    });
  } catch (error) {
    return res.status(404).json({ message: `Error: ${error}` });
  }
};

export const viewStudentAttendance = async (req: Request, res: Response) => {
  try {
    const student = await studentModel.findById(req.params.studentID).populate({
      path: "attendance",
      options: { sort: { createdAt: -1 } },
    });

    console.log("attendance: ", student);

    return res.status(200).json({
      message: `Viewing student attendance detail...!`,
      data: student,
    });
  } catch (error) {
    return res.status(404).json({ message: `Error: ${error}` });
  }
};

export const viewClassStudentAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const student = await classroomModel.findById(req.params.classID).populate({
      path: "attendance",
      options: { sort: { createdAt: -1 } },
    });

    return res.status(200).json({
      message: `Viewing student attendance detail...!`,
      data: student,
    });
  } catch (error) {
    return res.status(404).json({ message: `Error: ${error}` });
  }
};
