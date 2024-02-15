import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import subjectModel from "../model/subjectModel";
import { Types } from "mongoose";
import staffModel from "../model/staffModel";
import classroomModel from "../model/classroomModel";

export const createSchoolSubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { designated, subjectTeacherName, subjectTitle } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "classRooms",
    });

    const schoolSubj = await schoolModel.findById(schoolID).populate({
      path: "subjects",
    });

    const getClassRooms = school?.classRooms.find((el: any) => {
      return el.className === designated;
    });

    const getClassRoomsSubj = schoolSubj?.subjects.some((el: any) => {
      return el.subjectTitle === subjectTitle;
    });

    const getClassRM = await classroomModel.findOne({ className: designated });

    if (getClassRooms) {
      if (school && school.schoolName && school.status === "school-admin") {
        if (!getClassRoomsSubj) {
          const subjects = await subjectModel.create({
            schoolName: school.schoolName,
            subjectTeacherName,
            subjectTitle,
            designated,
            classDetails: getClassRooms,
          });

          school.subjects.push(new Types.ObjectId(subjects._id));
          school.save();

          getClassRM?.classSubjects.push(new Types.ObjectId(subjects._id));
          getClassRM?.save();

          return res.status(201).json({
            message: "subjects created successfully",
            data: subjects,
            status: 201,
          });
        } else {
          return res.status(404).json({
            message: "duplicate subject",
            status: 404,
          });
        }
      } else {
        return res.status(404).json({
          message: "unable to read school",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "Error finding school classroom",
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

export const updateSchoolSubjectTitle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, subjectID } = req.params;
    const { subjectTitle } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const subjects = await subjectModel.findByIdAndUpdate(
        subjectID,
        {
          subjectTitle,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "subjects title updated successfully",
        data: subjects,
        status: 201,
      });
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

export const updateSchoolSubjectTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, subjectID } = req.params;
    const { subjectTeacherName } = req.body;

    const school = await schoolModel.findById(schoolID);

    const getTeacher = await staffModel.findOne({
      staffName: subjectTeacherName,
    });

    if (school && school.schoolName && school.status === "school-admin") {
      if (getTeacher) {
        const subjects = await subjectModel.findByIdAndUpdate(
          subjectID,
          {
            subjectTeacherName,
            teacherID: getTeacher?._id,
          },
          { new: true }
        );

        const addedData = [
          ...getTeacher.subjectAssigned,
          {
            title: subjects?.subjectTitle,
            id: subjects?._id,
            classMeant: subjects?.designated,
          },
        ];

        await staffModel.findByIdAndUpdate(
          getTeacher._id,
          {
            subjectAssigned: addedData,
          },
          { new: true }
        );

        return res.status(201).json({
          message: "subjects teacher updated successfully",
          data: subjects,
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
      message: "Error updating school subject to Teacher",
      status: 404,
    });
  }
};

export const viewSchoolSubjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const schoolSubject = await schoolModel.findById(schoolID).populate({
      path: "subjects",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "School Subject found",
      status: 200,
      data: schoolSubject,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const deleteSchoolSubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, subjectID } = req.params;

    const school: any = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const subjects = await subjectModel.findByIdAndDelete(subjectID);
      school.subjects.pull(new Types.ObjectId(subjects?._id!));
      school.save();

      return res.status(201).json({
        message: "subjects  deleted successfully",
        data: subjects,
        status: 201,
      });
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

export const viewSubjectDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID);

    return res.status(200).json({
      message: "Subject found",
      status: 200,
      data: subject,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject session",
      status: 404,
    });
  }
};
