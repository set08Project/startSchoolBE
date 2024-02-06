import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import staffModel from "../model/staffModel";
import { Types } from "mongoose";
import { staffDuty } from "../utils/enums";

export const createSchoolPrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffName } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const staff = await staffModel.create({
        staffName,
        schoolName: school.schoolName,
        staffRole: staffDuty.PRINCIPAL,
      });

      school.staff.push(new Types.ObjectId(staff._id));
      school.save();

      return res.status(201).json({
        message: "principal created successfully",
        data: staff,
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

export const createSchoolVicePrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffName } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const staff = await staffModel.create({
        staffName,
        schoolName: school.schoolName,
        staffRole: staffDuty.VICE_PRINCIPAL,
      });

      school.staff.push(new Types.ObjectId(staff._id));
      school.save();

      return res.status(201).json({
        message: "principal created successfully",
        data: staff,
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

export const createSchoolTeacherByPrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;
    const { staffName } = req.body;

    const staff = await staffModel.findById(staffID);
    const school = await schoolModel.findOne({ schoolName: staff?.schoolName });

    if (staff && staff.schoolName && staff.staffRole === "principal") {
      const newStaff = await staffModel.create({
        staffName,
        staffRole: staffDuty.TEACHER,
      });

      school!.staff.push(new Types.ObjectId(newStaff._id));
      school!.save();

      return res.status(201).json({
        message: "teacher created successfully",
        data: newStaff,
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

export const createSchoolTeacherByVicePrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;
    const { staffName } = req.body;

    const staff = await staffModel.findById(staffID);
    const school = await schoolModel.findOne({ schoolName: staff?.schoolName });

    if (staff && staff.schoolName && staff.staffRole === "vice principal") {
      const newStaff = await staffModel.create({
        staffName,
        staffRole: staffDuty.TEACHER,
      });

      school!.staff.push(new Types.ObjectId(newStaff._id));
      school!.save();

      return res.status(201).json({
        message: "teacher created successfully",
        data: newStaff,
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

export const createSchoolTeacherByAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffName } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const staff = await staffModel.create({
        staffName,
        schoolName: school.schoolName,
        staffRole: staffDuty.TEACHER,
      });

      school.staff.push(new Types.ObjectId(staff._id));
      school.save();

      return res.status(201).json({
        message: "teacher created successfully",
        data: staff,
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

export const createSchoolTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffName, subjectTitle } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "subjects",
    });

    const getSubject = school?.subjects.some((el: any) => {
      return el.subjectTitle === subjectTitle;
    });

    if (school && school.schoolName && school.status === "school-admin") {
      if (getSubject) {
        const staff = await staffModel.create({
          staffName,
          schoolName: school.schoolName,
          staffRole: staffDuty.TEACHER,
          subjectAssigned: [`${subjectTitle}`],
        });

        school.staff.push(new Types.ObjectId(staff._id));
        school.save();

        return res.status(201).json({
          message: "teacher created successfully",
          data: staff,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "a teacher must have a subject to handle",
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
    });
  }
};
