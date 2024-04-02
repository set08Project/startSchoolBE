import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import studentModel from "../model/studentModel";
import { Types } from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { streamUpload } from "../utils/streamifier";
import { verifySchoolFees } from "../utils/email";
import staffModel from "../model/staffModel";
import classroomModel from "../model/classroomModel";

export const createSchoolStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const {
      studentLastName,
      gender,
      studentFirstName,
      studentAddress,
      classAssigned,
    } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "classRooms",
    });

    const enrollmentID = crypto.randomBytes(3).toString("hex");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(
      `${studentFirstName.replace(/ /gi, "").toLowerCase()}${studentLastName
        .replace(/ /gi, "")
        .toLowerCase()}`,
      salt
    );

    const findClass: any = school?.classRooms?.find((el: any) => {
      return el.className === classAssigned;
    });

    if (school && school.schoolName && school.status === "school-admin") {
      if (findClass) {
        const student = await studentModel.create({
          schoolIDs: schoolID,
          gender,
          enrollmentID,
          schoolID: school?.enrollmentID,
          studentFirstName,
          studentLastName,
          schoolName: school?.schoolName,
          studentAddress,
          classAssigned,
          email: `${studentFirstName
            .replace(/ /gi, "")
            .toLowerCase()}${studentLastName
              .replace(/ /gi, "")
              .toLowerCase()}@${school?.schoolName
                ?.replace(/ /gi, "")
                .toLowerCase()}.com`,
          password: hashed,
          status: "school-student",
        });

        school?.students.push(new Types.ObjectId(student._id));
        await school.save();

        school?.historys?.push(new Types.ObjectId(student._id));
        await school.save();

        findClass?.students.push(new Types.ObjectId(student._id));
        await findClass.save();

        return res.status(201).json({
          message: "student created successfully",
          data: student,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "class must exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const readSchoolStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const students = await schoolModel.findById(schoolID).populate({
      path: "students",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "students read successfully",
      data: students,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const readStudentDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const students = await studentModel.findById(studentID);

    return res.status(200).json({
      message: "student read successfully",
      data: students,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const loginStudent = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const getTeacher = await studentModel.findOne({ email });

    const school = await schoolModel.findOne({
      schoolName: getTeacher?.schoolName,
    });

    if (school?.schoolName && getTeacher?.schoolName) {
      if (school.verify) {
        const token = jwt.sign({ status: school.status }, "student", {
          expiresIn: "1d",
        });

        const pass = await bcrypt.compare(password, getTeacher?.password);

        if (pass) {
          req.session.isAuth = true;
          req.session.isSchoolID = getTeacher._id;

          return res.status(201).json({
            message: "welcome back",
            user: getTeacher?.status,
            data: token,
            id: req.session.isSchoolID,
            status: 201,
          });
        } else {
          return res.status(404).json({
            message: "Invalid Password",
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
      message: "Error logging you in",
    });
  }
};

export const readStudentCookie = async (
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
      message: "Error verifying student",
    });
  }
};

export const logoutStudent = async (
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

export const updateStudentAvatar = async (req: any, res: Response) => {
  try {
    const { studentID } = req.params;

    const school = await studentModel.findById(studentID);
    console.log(school);
    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedStudent = await studentModel.findByIdAndUpdate(
        studentID,
        {
          avatar: secure_url,
          avatarID: public_id,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "student avatar has been, added",
        data: updatedStudent,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "student not seen",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating avatar",
      data: error.message,
    });
  }
};

export const updateStudentParentEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { parentEmail } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName) {
      const student = await studentModel.findByIdAndUpdate(studentID, { parentEmail }, { new: true });

      return res.status(201).json({
        message: "student profile updated successful",
        data: student,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "unable to update student profile",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error getting school",
      status: 404,
    });
  }
};

export const updateStudent1stFees = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const getStudent = await studentModel.findById(studentID)

    if (school?.status === "school-admin" && school) {
      const students = await studentModel.findByIdAndUpdate(
        studentID,
        { feesPaid1st: !getStudent?.feesPaid1st },
        { new: true }
      );
      verifySchoolFees(students, 1);

      return res.status(201).json({
        message: "student fees updated successfully",
        data: students,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "student 1st fees not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const updateStudent2ndFees = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school?.status === "school-admin" && school) {
      let students = await studentModel.findById(studentID);

      if (students?.feesPaid1st === true) {
        let student = await studentModel.findByIdAndUpdate(
          students?._id,
          { feesPaid2nd: !students?.feesPaid2nd },
          { new: true }
        );

        verifySchoolFees(student, 2);

        return res.status(201).json({
          message: "student fees updated successfully",
          data: student,
          status: 200,
        });
      } else {
        return res.status(404).json({
          message: "student 3rd fees not found",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const updateStudent3rdFees = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school?.status === "school-admin" && school) {
      const student = await studentModel.findById(studentID);
      if (student?.feesPaid2nd === true) {
        await studentModel.findByIdAndUpdate(
          studentID,
          { feesPaid3rd: !student?.feesPaid3rd },
          { new: true }
        );
        verifySchoolFees(student, 3);
        return res.status(201).json({
          message: "student fees updated successfully",
          data: student,
          status: 200,
        });
      } else {
        return res.status(404).json({
          message: "student 2nd fees not found",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};
