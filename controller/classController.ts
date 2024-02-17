import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import subjectModel from "../model/subjectModel";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import staffModel from "../model/staffModel";
import lodash from "lodash";

export const createSchoolClasses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const {
      classTeacherName,
      className,
      class2ndFee,
      class3rdFee,
      class1stFee,
    } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "classRooms",
    });

    const checkClass = school?.classRooms.some((el: any) => {
      return el.className === className;
    });

    if (school && school.schoolName && school.status === "school-admin") {
      if (!checkClass) {
        const classes = await classroomModel.create({
          schoolName: school.schoolName,
          classTeacherName,
          className,
          class2ndFee,
          class3rdFee,
          class1stFee,
        });

        school.classRooms.push(new Types.ObjectId(classes._id));
        school.save();

        return res.status(201).json({
          message: "classes created successfully",
          data: classes,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "duplicated class name",
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
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const updateSchoolClassesPerformance = async (
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

export const viewClassesByTimeTable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID).populate({
      path: "timeTable",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "finding classes by TimeTable",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewClassesByStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID).populate({
      path: "students",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "finding class students",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewClassesBySubject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID).populate({
      path: "classSubjects",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "finding classes by Name",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewSchoolClassesByName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { className } = req.body;

    const schoolClasses = await classroomModel.findOne({ className }).populate({
      path: "classSubjects",
    });

    return res.status(200).json({
      message: "finding classes by Name",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewSchoolClasses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const schoolClasses = await schoolModel.findById(schoolID).populate({
      path: "classRooms",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(200).json({
      message: "School classes found",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const viewClassRM = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID).populate({
      path: "classSubjects",
    });

    return res.status(200).json({
      message: "School classes info found",
      status: 200,
      data: schoolClasses,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class info",
      status: 404,
      data: error.message,
    });
  }
};

export const updateSchoolClassTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, classID } = req.params;
    const { classTeacherName } = req.body;

    const school = await schoolModel.findById(schoolID);
    const getTeacher = await staffModel.findOne({
      staffName: classTeacherName,
    });

    if (school && school.schoolName && school.status === "school-admin") {
      if (getTeacher) {
        const subjects = await classroomModel.findByIdAndUpdate(
          classID,
          {
            classTeacherName,
            teacherID: getTeacher._id,
          },
          { new: true }
        );

        await staffModel.findByIdAndUpdate(
          getTeacher._id,
          {
            classesAssigned: subjects?.className!,
          },
          { new: true }
        );

        return res.status(201).json({
          message: "class teacher updated successfully",
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
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const deleteSchoolClass = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, classID } = req.params;

    const school: any = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const subjects = await classroomModel.findByIdAndDelete(classID);

      school.classRooms.pull(new Types.ObjectId(subjects?._id!));
      school.save();

      return res.status(201).json({
        message: "class deleted successfully",
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

export const viewClassTopStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID).populate({
      path: "students",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    const rate = lodash.orderBy(
      schoolClasses?.students,
      ["totalPerformance"],
      ["desc"]
    );

    return res.status(200).json({
      message: "finding class students top performance!",
      status: 200,
      data: rate,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};
