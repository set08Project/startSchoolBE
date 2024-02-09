import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import staffModel from "../model/staffModel";
import { Types } from "mongoose";
import { staffDuty } from "../utils/enums";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const createSchoolPrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffName, staffAddress, assignedSubject } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "subjects",
    });

    const enrollmentID = crypto.randomBytes(3).toString("hex");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(`${staffName.replace(/ /gi, "")}`, salt);

    if (school && school.schoolName && school.status === "school-admin") {
      const staff = await staffModel.create({
        staffName,
        schoolName: school.schoolName,
        staffRole: staffDuty.PRINCIPAL,
        status: "school-teacher",

        email: `${staffName
          .replace(/ /gi, "")
          .toLowerCase()}@${school?.schoolName
          ?.replace(/ /gi, "")
          .toLowerCase()}.com`,
        enrollmentID,
        password: hashed,
        staffAddress,
        assignedSubject,
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
    const { staffName, salary, staffAddress, role, subjectTitle } = req.body;

    const enrollmentID = crypto.randomBytes(3).toString("hex");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(`${staffName.replace(/ /gi, "")}`, salt);

    const school = await schoolModel.findById(schoolID).populate({
      path: "subjects",
    });

    const getSubject: any = school?.subjects.find((el: any) => {
      return el.subjectTitle === subjectTitle;
    });

    if (school && school.schoolName && school.status === "school-admin") {
      if (getSubject) {
        const staff = await staffModel.create({
          staffName,
          schoolName: school.schoolName,
          staffRole: staffDuty.TEACHER,
          subjectAssigned: [{ title: subjectTitle, id: getSubject._id }],
          role,
          status: "school-teacher",
          salary,

          email: `${staffName
            .replace(/ /gi, "")
            .toLowerCase()}@${school?.schoolName
            ?.replace(/ /gi, "")
            .toLowerCase()}.com`,
          enrollmentID,
          password: hashed,
          staffAddress,
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
          message:
            "A teacher must have a subject to handle and Subject hasn't been created",
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

export const readSchooTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const students = await schoolModel.findById(schoolID).populate({
      path: "staff",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "staff read successfully",
      data: students,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school staff",
      status: 404,
    });
  }
};

export const readTeacherDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;

    const staff = await staffModel.findById(staffID);

    return res.status(201).json({
      message: "satff read successfully",
      data: staff,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school staff",
      status: 404,
    });
  }
};

export const updateTeacherSalary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;
    const { salary } = req.body;

    const staff = await staffModel.findByIdAndUpdate(
      staffID,
      {
        salary,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "satff read successfully",
      data: staff,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school staff",
      status: 404,
    });
  }
};
