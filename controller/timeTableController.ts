import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import announcementModel from "../model/announcementModel";
import { Types } from "mongoose";
import eventModel from "../model/eventModel";
import classroomModel from "../model/classroomModel";
import timetableModel from "../model/timetableModel";
import lodash from "lodash";
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
    const checkForSubjectteacher: any = classRoom?.classSubjects.find(
      (el: any) => {
        return el.subjectTitle === subject;
      }
    );

    const findTeacher = await staffModel.findById({
      _id: checkForSubjectteacher.teacherID,
    });

    if (school && school.schoolName && school.status === "school-admin") {
      if (checkForSubject) {
        const classes = await timetableModel.create({
          subject,
          day,
          time,
        });

        classRoom?.timeTable.push(new Types.ObjectId(classes._id));
        classRoom?.save();

        findTeacher?.timeTables.push(new Types.ObjectId(classes._id));
        findTeacher?.save();

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

    const viewTable = lodash.groupBy(timeTable?.timeTable, "day");

    return res.status(201).json({
      message: "timetable read successfully",
      data: viewTable,
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

    const timeTable = await staffModel.findById(teacherID).populate({
      path: "timeTables",
    });

    console.log(timeTable);
    return res.status(201).json({
      message: "timetable read successfully",
      data: timeTable,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating timetablemkm kim",
      data: error.message,
      status: 404,
    });
  }
};
