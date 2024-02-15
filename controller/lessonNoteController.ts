import lodash from "lodash";
import { string } from "joi";
import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import staffModel from "../model/staffModel";
import { Types } from "mongoose";
import lessonNoteModel from "../model/lessonNoteModel";

export const createClasslessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, staffID } = req.params;
    const {
      week,
      endingAt,
      createDate,
      subject,
      classes,
      subTopic,
      period,
      duration,
      instructionalMaterial,
      referenceMaterial,
      previousKnowledge,
      specificObjectives,
      content,
      evalution,
      summary,
      presentation,
      assignment,
    } = req.body;

    const school = await schoolModel.findById(schoolID);
    const staff = await staffModel.findById(staffID);

    if (
      school &&
      school.schoolName &&
      school.status === "school-teacher" &&
      staff
    ) {
      const note = await lessonNoteModel.create({
        week,
        endingAt,
        createDate,
        subject,
        classes,
        subTopic,
        period,
        duration,
        instructionalMaterial,
        referenceMaterial,
        previousKnowledge,
        specificObjectives,
        content,
        evalution,
        summary,
        presentation,
        assignment,
        adminSignation: false,
      });

      school?.lessonNotes.push(new Types.ObjectId(note?._id));
      staff?.lessonNotes.push(new Types.ObjectId(note?._id));
      school.save();
      staff.save();

      return res.status(201).json({
        message: "lesson note created",
        data: note,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};

export const readAdminLessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const note = school.populate({ path: "lessonNotes" });

      return res.status(200).json({
        message: "Reading admin's lesson note",
        data: note,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};

export const readTeacherLessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, staffID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const staff = await staffModel.findById(staffID);

    if (school && school.schoolName && school.status === "school-teacher") {
      const note = staff?.populate({ path: "lessonNotes" });

      return res.status(200).json({
        message: "Reading teacher's lesson note",
        data: note,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};

export const approveTeacherLessonNote = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, lessonID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const lessonNote = await lessonNoteModel.findById(lessonID);

    if (
      school &&
      school.schoolName &&
      school.status === "school-admin" &&
      lessonNote
    ) {
      const note = await lessonNoteModel.findByIdAndUpdate(
        lessonNote?._id,
        { adminSignation: true },
        { new: true }
      );

      return res.status(200).json({
        message: "lesson note approved",
        data: note,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating lesson Note",
      status: 404,
    });
  }
};
