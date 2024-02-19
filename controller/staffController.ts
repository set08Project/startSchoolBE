import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import staffModel from "../model/staffModel";
import { Types } from "mongoose";
import { staffDuty } from "../utils/enums";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { streamUpload } from "../utils/streamifier";

export const loginTeacher = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const getTeacher = await staffModel.findOne({ email });

    const school = await schoolModel.findOne({
      schoolName: getTeacher?.schoolName,
    });

    if (school?.schoolName && getTeacher?.schoolName) {
      if (school.verify) {
        const token = jwt.sign({ status: school.status }, "teacher", {
          expiresIn: "1d",
        });
        const passed = await bcrypt.compare(password, getTeacher?.password);

        if (passed) {
          req.session.isAuth = true;
          req.session.isSchoolID = getTeacher._id;

          return res.status(201).json({
            message: "welcome back",
            user: getTeacher?.status,
            data: token,
            status: 201,
          });
        } else {
          return res.status(404).json({
            message: "Password error",
          });
        }
      } else {
        return res.status(404).json({
          message: "please confirm with your school admin",
        });
      }
    } else {
      return res.status(404).json({
        message: "Error finding school",
      });
    }

    return res.status(201).json({
      message: "creating school",
      data: school,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school",
    });
  }
};

export const readTeacherCookie = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const readSchool = req.session.isSchoolID;

    return res.status(200).json({
      message: "GoodBye",
      data: readSchool,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

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
    const { staffName, gender, salary, staffAddress, role, subjectTitle } =
      req.body;

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
          schoolIDs: schoolID,
          staffName,
          schoolName: school.schoolName,
          staffRole: staffDuty.TEACHER,
          subjectAssigned: [{ title: subjectTitle, id: getSubject._id }],
          role,
          status: "school-teacher",
          salary,
          gender,

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

    return res.status(200).json({
      message: "satff read successfully",
      data: staff,
      status: 200,
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

export const logoutTeacher = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    req.session.destroy();

    return res.status(200).json({
      message: "GoodBye",
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error logging out teacher",
    });
  }
};

export const updateStaffAvatar = async (req: any, res: Response) => {
  try {
    const { staffID } = req.params;

    const school = await staffModel.findById(staffID);

    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedSchool = await staffModel.findByIdAndUpdate(
        staffID,
        {
          avatar: secure_url,
          avatarID: public_id,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "staff avatar has been, added",
        data: updatedSchool,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating user",
    });
  }
};
