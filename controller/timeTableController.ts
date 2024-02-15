import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import timetableModel from "../model/timetableModel";
import staffModel from "../model/staffModel";

export const createClassTimeTable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, classID } = req.params;
    const { subject, day, time } = req.body;

    const school = await schoolModel.findById(schoolID);
    const classRoom = await classroomModel.findById(classID).populate({
      path: "classSubjects",
    });

    const checkForSubject = classRoom?.classSubjects.some((el: any) => {
      return el.subjectTitle === subject;
    });

    const findTeacher = await staffModel.findById({
      _id: classRoom?.teacherID,
    });

    //  || "Assembly" || "Short Break" || "Long Break"
    if (school && school.schoolName && school.status === "school-admin") {
      if (checkForSubject) {
        const classes = await timetableModel.create({
          subject,
          day,
          time,
        });

        classRoom?.timeTable.push(new Types.ObjectId(classes._id));
        classRoom?.save();

        findTeacher?.schedule.push(new Types.ObjectId(classes._id));
        findTeacher?.save();

        return res.status(201).json({
          message: "timetable entry created successfully",
          data: classes,
          status: 201,
        });
      } else if (subject === "Assembly" || "Short Break" || "Long Break") {
        const classes = await timetableModel.create({
          subject,
          day,
          time,
        });

        classRoom?.timeTable.push(new Types.ObjectId(classes._id));
        classRoom?.save();

        return res.status(201).json({
          message: "timetable entry created successfully",
          data: classes,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Subject doesn't exist for this class",
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
      message: "Error creating class timetable",
      status: 404,
    });
  }
};

export const readClassTimeTable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const timeTable = await classroomModel.findById(classID).populate({
      path: "timeTable",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "timetable read successfully",
      data: timeTable,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating timetable",
      status: 404,
    });
  }
};
export const readTeacherSchedule = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;

    const timeTable: any = await staffModel
      .findById(teacherID)
      .populate({ path: "schedule" });

    return res.status(201).json({
      message: "scheule read successfully",
      data: timeTable,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating timetable",
      data: error.message,
      status: 404,
    });
  }
};
