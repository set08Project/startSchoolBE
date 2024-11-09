import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import studentModel from "../model/studentModel";
import { AnyArray, Types } from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { streamUpload } from "../utils/streamifier";
import { verifySchoolFees } from "../utils/email";
import staffModel from "../model/staffModel";
import classroomModel from "../model/classroomModel";
import purchasedModel from "../model/historyModel";
import schoolFeeHistory from "../model/schoolFeeHistory";
// import subjectModel from "../model/subjectModel";
import csv from "csvtojson";

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
          presentClassID: findClass?._id,
          classTermFee:
            findClass?.presentTerm === "1st Term"
              ? findClass?.class1stFee
              : findClass?.presentTerm === "2nd Term"
              ? findClass?.class2ndFee
              : findClass?.presentTerm === "3rd Term"
              ? findClass?.class3rdFee
              : null,

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

export const createBulkSchoolStudent = async (
  req: Request | any,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const data = await csv().fromFile(req.file.path);

    for (let i of data) {
      const school = await schoolModel.findById(schoolID).populate({
        path: "classRooms",
      });

      const enrollmentID = crypto.randomBytes(3).toString("hex");

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(
        `${i?.studentFirstName
          .replace(/ /gi, "")
          .toLowerCase()}${i?.studentLastName
          .replace(/ /gi, "")
          .toLowerCase()}`,
        salt
      );

      const findClass: any = school?.classRooms?.find((el: any) => {
        return el.className === i?.classAssigned;
      });

      if (school && school.schoolName && school.status === "school-admin") {
        if (findClass) {
          const student = await studentModel.create({
            schoolIDs: schoolID,
            presentClassID: findClass?._id,
            classTermFee:
              findClass?.presentTerm === "1st Term"
                ? findClass?.class1stFee
                : findClass?.presentTerm === "2nd Term"
                ? findClass?.class2ndFee
                : findClass?.presentTerm === "3rd Term"
                ? findClass?.class3rdFee
                : null,

            gender: i?.gender,
            enrollmentID,
            schoolID: school?.enrollmentID,
            studentFirstName: i?.studentFirstName,
            studentLastName: i?.studentLastName,
            schoolName: school?.schoolName,
            studentAddress: i?.studentAddress,
            classAssigned: i?.classAssigned,
            email: `${i?.studentFirstName
              .replace(/ /gi, "")
              .toLowerCase()}${i?.studentLastName
              .replace(/ /gi, "")
              .toLowerCase()}@${school?.schoolName
              ?.replace(/ /gi, "")
              .toLowerCase()}.com`,
            password: hashed,
            status: "school-student",
          });

          school?.students.push(new Types.ObjectId(student._id));

          school?.historys?.push(new Types.ObjectId(student._id));
          await school.save();

          findClass?.students.push(new Types.ObjectId(student._id));
          await findClass.save();
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
    }

    return res.status(201).json({
      message: "done with class entry",
      status: 201,
    });
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

    // return res.status(201).json({
    //   message: "creating school",
    //   data: school,
    // });
  } catch (error) {
    return res.status(404).json({
      message: "Error logging you in",
    });
  }
};

export const loginStudentWithToken = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.body;

    const getStudent = await studentModel.findOne({ enrollmentID: token });

    const school = await schoolModel.findOne({
      schoolName: getStudent?.schoolName,
    });

    if (school?.schoolName && getStudent?.schoolName) {
      if (school.verify) {
        const token = jwt.sign({ status: school.status }, "student", {
          expiresIn: "1d",
        });

        req.session.isAuth = true;
        req.session.isSchoolID = getStudent._id;

        return res.status(201).json({
          message: "welcome back",
          user: getStudent?.status,
          data: token,
          id: req.session.isSchoolID,
          status: 201,
        });
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

//Student Updates settings

export const updateStudentParentEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { parentEmail } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName) {
      const student = await studentModel.findByIdAndUpdate(
        studentID,
        { parentEmail },
        { new: true }
      );

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

export const updateStudentFirstName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { studentFirstName, studentLastName } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (!school) {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }

    const student = await studentModel.findById(studentID);
    if (!student) {
      return res.status(404).json({
        message: "Student Does Not Exist",
        status: 404,
      });
    }

    const updatedFields: any = {};
    if (studentFirstName) updatedFields.studentFirstName = studentFirstName;
    if (studentLastName) updatedFields.studentLastName = studentLastName;

    const updatedFirstName = studentFirstName || student.studentFirstName;
    const updatedLastName = studentLastName || student.studentLastName;
    const email = `${updatedFirstName
      .replace(/ /gi, "")
      .toLowerCase()}${updatedLastName
      .replace(/ /gi, "")
      .toLowerCase()}@${school.schoolName
      .replace(/ /gi, "")
      .toLowerCase()}.com`;

    updatedFields.email = email;

    const updatedStudent = await studentModel.findByIdAndUpdate(
      student._id,
      updatedFields,
      { new: true }
    );

    return res.status(201).json({
      message: "Student Information Updated Successfully",
      data: updatedStudent,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error Updating Student Information",
      error: {
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });
  }
};

export const updateStudentLastName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { studentLastName } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (!school) {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }

    const student = await studentModel.findById(studentID);
    if (!student) {
      return res.status(404).json({
        message: "Student Does Not Exist",
        status: 404,
      });
    }

    const updatedFirstName = student.studentFirstName;
    const updatedLastName = studentLastName || student.studentLastName;

    const email = `${updatedFirstName
      .replace(/ /gi, "")
      .toLowerCase()}${updatedLastName
      .replace(/ /gi, "")
      .toLowerCase()}@${school.schoolName
      .replace(/ /gi, "")
      .toLowerCase()}.com`;

    const studentUpdateLastName = await studentModel.findByIdAndUpdate(
      student._id,
      {
        studentLastName: updatedLastName,
        email: email,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "Student LastName Updated Successfully",
      data: studentUpdateLastName,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error Updating Student Last Name",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateStudentAddress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { studentAddress } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updateAddress = await studentModel.findByIdAndUpdate(
          student._id,
          { studentAddress: studentAddress },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Address Updated Successfully",
          data: updateAddress,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating Student Address",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateStudentGender = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const { gender } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updateGender = await studentModel.findByIdAndUpdate(
          student._id,
          { gender: gender },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Gender Updated Succed=sfully",
          data: updateGender,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating Student Gender",
      data: {
        errorMessage: error.message,
        errorTypes: error.stack,
      },
      status: 404,
    });
  }
};

export const updateStudentPhone = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { phone } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updatePhone = await studentModel.findByIdAndUpdate(
          student._id,
          { phone: phone },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Phone Number Updated Successfully",
          data: updatePhone,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating Student Phone Number",
      data: {
        errorMessage: error.mesaage,
        errorType: error.stack,
      },
      status: 404,
    });
  }
};

export const updateStudentParentNumber = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { parentPhoneNumber } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updateParentNumber = await studentModel.findByIdAndUpdate(
          student._id,
          { parentPhoneNumber: parentPhoneNumber },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Phone Number Updated Succesfully",
          data: updateParentNumber,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating Parents Phone Number",
      data: {
        errorMessage: error.message,
        messageType: error.stack,
      },
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
    const getStudent = await studentModel.findById(studentID);

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

//Student Updates settings ends here

//Student/Parent Socials

export const updateStudentFacebookAcct = async (
  req: Request,
  res: Response
) => {
  try {
    const { schoolID, studentID } = req.params;
    const { facebookAccount } = req.body;
    const school = await schoolModel.findById(schoolID);
    if (school) {
      const student = await studentModel.findById(studentID);

      if (student) {
        const updateStudentFacebook = await studentModel.findByIdAndUpdate(
          student._id,
          { facebookAccount: facebookAccount },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Facebook Account Updated Successfuly",
          data: updateStudentFacebook,
          status: 404,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating Facebook Account",
      data: {
        errorMessage: error.message,
        messageType: error.stack,
      },
      status: 404,
    });
  }
};

export const updateInstagramAccout = async (req: Request, res: Response) => {
  try {
    const { schoolID, studentID } = req.params;
    const { instagramAccount } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const student = await studentModel.findById(studentID);

      if (student) {
        const updateStudentInstagram = await studentModel.findByIdAndUpdate(
          student._id,
          { instagramAccount: instagramAccount },
          { new: true }
        );
        return res.status(201).json({
          message: "IG Account Updated Successfully",
          data: updateStudentInstagram,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating IG Account",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateXAcctount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { xAccount } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const student = await studentModel.findById(studentID);

      if (student) {
        const updateXhandle = await studentModel.findByIdAndUpdate(
          student._id,
          { xAccount: xAccount },
          { new: true }
        );

        return res.status(201).json({
          message: "X Account Updated Succsfully",
          data: updateXhandle,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating X Account",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateStudentLinkedinAccount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { linkedinAccount } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const student = await studentModel.findById(studentID);

      if (student) {
        const updateLinkedinAccount = await studentModel.findByIdAndUpdate(
          student._id,
          { linkedinAccount: linkedinAccount },
          { new: true }
        );

        return res.status(201).json({
          message: "Linkedin Account Updated Successfully",
          data: updateLinkedinAccount,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating Linkedin Account",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

//Student/Parent Socials Ends Here

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

export const updatePurchaseRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { purchased } = req.body;
    const student: any = await studentModel.findById(studentID);
    const school: any = await schoolModel.findById(student?.schoolIDs!);

    if (school?.status === "school-admin" && school) {
      await studentModel.findById(
        studentID,
        {
          purchaseHistory: student?.purchaseHistory?.push(purchased),
        },
        { new: true }
      );

      return res.status(201).json({
        message: "student purchase recorded successfully",
        data: student,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "School not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating students purchase",
      status: 404,
    });
  }
};

export const createStorePurchased = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { date, amount, cart, reference, purchasedID, delievered } = req.body;

    const student = await studentModel.findById(studentID).populate({
      path: "purchaseHistory",
    });

    const school = await schoolModel.findById(student?.schoolIDs);

    if (school) {
      const check = student?.purchaseHistory.some((el: any) => {
        return el.reference === reference;
      });

      if (!check) {
        const store = await purchasedModel.create({
          date,
          amount,
          cart,
          reference,
          purchasedID,
          delievered: false,
          studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
          studentClass: student?.classAssigned,
        });

        student?.purchaseHistory.push(new Types.ObjectId(store._id));
        student?.save();

        school?.purchaseHistory.push(new Types.ObjectId(store._id));
        school?.save();

        return res.status(201).json({
          message: "remark created successfully",
          data: store,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Has already entered it",

          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const viewStorePurchased = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const student = await studentModel.findById(studentID).populate({
      path: "purchaseHistory",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "remark created successfully",
      data: student?.purchaseHistory,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const viewSchoolStorePurchased = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const student = await schoolModel.findById(schoolID).populate({
      path: "purchaseHistory",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "remark created successfully",
      data: student?.purchaseHistory,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const updateSchoolStorePurchased = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { purchaseID } = req.params;
    const { delievered } = req.body;

    const item = await purchasedModel.findByIdAndUpdate(
      purchaseID,
      {
        delievered,
      },
      { new: true }
    );

    return res.status(201).json({
      message: `item delieved successfully`,
      data: item,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating school's store item",
      data: error.message,
    });
  }
};

export const createStorePurchasedTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;
    const { date, amount, cart, reference, purchasedID } = req.body;

    const student = await staffModel.findById(staffID).populate({
      path: "purchaseHistory",
    });

    const school = await schoolModel.findById(student?.schoolIDs);

    if (school) {
      const check = student?.purchaseHistory.some((el: any) => {
        return el.reference === reference;
      });

      if (!check) {
        const store = await purchasedModel.create({
          date,
          amount,
          cart,
          reference,
          purchasedID,
          delievered: false,
          studentName: student?.staffName,
          studentClass: student?.classesAssigned,
        });

        student?.purchaseHistory.push(new Types.ObjectId(store._id));
        student?.save();

        school?.purchaseHistory.push(new Types.ObjectId(store._id));
        school?.save();

        return res.status(201).json({
          message: "remark created successfully",
          data: store,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Has already entered it",

          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const viewStorePurchasedTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;

    const student = await staffModel.findById(staffID).populate({
      path: "purchaseHistory",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "remark created successfully",
      data: student?.purchaseHistory,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const createSchoolFeePayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { date, amount, purchasedID, reference } = req.body;

    const student = await studentModel.findById(studentID).populate({
      path: "schoolFeesHistory",
    });

    const classOne: any = await classroomModel.findById(
      student?.presentClassID
    );

    const school: any = await schoolModel.findById(student?.schoolIDs);

    if (school) {
      const check = student?.schoolFeesHistory.some((el: any) => {
        return el.reference === reference;
      });

      const payment = student?.schoolFeesHistory.some((el: any) => {
        return (
          el.sessionID === school?.presentSessionID &&
          el.session === school?.presentSession &&
          el.termID === school?.presentTermID &&
          el.term === school?.presentTerm
        );
      });

      if (!payment) {
        const store = await schoolFeeHistory.create({
          studentID,
          session: school?.presentSession!,

          sessionID: school?.presentSessionID,
          termID: school?.presentTermID,

          confirm: false,
          term: classOne?.presentTerm,
          studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
          studentClass: student?.classAssigned,
          image: student?.avatar,
          date,
          amount,
          purchasedID,
          reference,
        });

        student?.schoolFeesHistory.push(new Types.ObjectId(store._id));
        student?.save();

        school?.schoolFeesHistory.push(new Types.ObjectId(store._id));
        school?.save();

        if (classOne?.presentTerm === "1st Term") {
          classOne?.schoolFeesHistory.push(new Types.ObjectId(store._id));
          classOne?.save();
        } else if (classOne?.presentTerm === "2nd Term") {
          classOne?.schoolFeesHistory2.push(new Types.ObjectId(store._id));
          classOne?.save();
        } else if (classOne?.presentTerm === "3rd Term") {
          classOne?.schoolFeesHistory3.push(new Types.ObjectId(store._id));
          classOne?.save();
        }

        if (classOne?.presentTerm === "1st Term") {
          const classData: any = await classroomModel
            .findById(student?.presentClassID)
            .populate({
              path: "schoolFeesHistory",
            });

          const amount = classData?.schoolFeesHistory
            ?.filter((el: any) => {
              return (
                el.sessionID === school?.presentSessionID &&
                el.termID === school?.presentTermID &&
                el.term === "1st Term"
              );
            })
            .map((el: any) => {
              return el.amount;
            })
            .reduce((a: number, b: number) => {
              return a + b;
            }, 0);

          const real = await classroomModel.findByIdAndUpdate(
            classData?._id,
            {
              class1stFee: amount,
            },
            { new: true }
          );
        } else if (classOne?.presentTerm === "2nd Term") {
          const classData: any = await classroomModel
            .findById(student?.presentClassID)
            .populate({
              path: "schoolFeesHistory2",
            });

          const amount = classData?.schoolFeesHistory
            ?.filter((el: any) => {
              return (
                el.sessionID === school?.presentSessionID &&
                el.termID === school?.presentTermID &&
                el.term === "2nd Term"
              );
            })
            .map((el: any) => {
              return el.amount;
            })
            .reduce((a: number, b: number) => {
              return a + b;
            }, 0);

          classroomModel.findByIdAndUpdate(
            classData?._id,
            {
              class2ndFee: amount,
            },
            { new: true }
          );
        } else if (classOne?.presentTerm === "3rd Term") {
          const classData: any = await classroomModel
            .findById(student?.presentClassID)
            .populate({
              path: "schoolFeesHistory3",
            });

          const amount = classData?.schoolFeesHistory
            ?.filter((el: any) => {
              return (
                el.sessionID === school?.presentSessionID &&
                el.termID === school?.presentTermID &&
                el.term === "3rd Term"
              );
            })
            .map((el: any) => {
              return el.amount;
            })
            .reduce((a: number, b: number) => {
              return a + b;
            }, 0);

          classroomModel.findByIdAndUpdate(
            classData?._id,
            {
              class3rdFee: amount,
            },
            { new: true }
          );
        }

        return res.status(201).json({
          message: "schoolfee paid successfully",
          data: store,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Has already entered it",

          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error paying school's fee",
      data: error.message,
    });
  }
};

export const viewSchoolFeeRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const student = await studentModel.findById(studentID).populate({
      path: "schoolFeesHistory",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "remark created successfully",
      data: student?.schoolFeesHistory,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const viewSchoolSchoolFeeRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const student = await schoolModel.findById(schoolID).populate({
      path: "schoolFeesHistory",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "remark created successfully",
      data: student?.schoolFeesHistory,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const updateSchoolSchoolFee = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolFeeID } = req.params;
    const { confirm } = req.body;

    const item: any = await schoolFeeHistory.findByIdAndUpdate(
      schoolFeeID,
      {
        confirm,
      },
      { new: true }
    );

    let studentRecord = await studentModel.findById(item.studentID);
    let studetClass = await classroomModel.findById(
      studentRecord?.presentClassID
    );

    if (studetClass?.presentTerm === "1st Term") {
      await studentModel.findByIdAndUpdate(
        item?.studentID,
        {
          feesPaid1st: true,
        },
        { new: true }
      );
    } else if (studetClass?.presentTerm === "2nd Term") {
      await studentModel.findByIdAndUpdate(
        item?.studentID,
        {
          feesPaid2nd: true,
        },
        { new: true }
      );
    } else if (studetClass?.presentTerm === "3rd Term") {
      await studentModel.findByIdAndUpdate(
        item?.studentID,
        {
          feesPaid3rd: true,
        },
        { new: true }
      );
    }

    return res.status(201).json({
      message: `schoolfee confirm successfully`,
      data: item,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating school's school fee",
      data: error.message,
    });
  }
};

export const assignClassMonitor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID } = req.params;

    const teacher = await staffModel.findById(teacherID);

    const getClass = await classroomModel
      .findById(teacher?.presentClassID)
      .populate({
        path: "students",
      });

    let readStudent: any = getClass?.students?.find((el: any) => {
      return el?.monitor === true;
    });

    await studentModel.findByIdAndUpdate(
      readStudent?._id,
      {
        monitor: false,
      },
      { new: true }
    );

    const student = await studentModel.findByIdAndUpdate(
      studentID,
      {
        monitor: true,
      },
      { new: true }
    );

    return res.status(201).json({
      message: `class monitor assigned to ${student?.studentFirstName} `,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating class's monitor",
      data: error.message,
    });
  }
};

export const changeStudentClass = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { classID } = req.body;

    const getClass = await classroomModel.findById(classID).populate({
      path: "students",
    });

    const studentData = await studentModel.findById(studentID);
    const getStudentClass: any = await classroomModel.findById(
      studentData?.presentClassID
    );

    getStudentClass?.students?.pull(new Types.ObjectId(studentID));
    getStudentClass?.save();

    const student = await studentModel.findByIdAndUpdate(
      studentID,
      {
        classAssigned: getClass?.className,
        presentClassID: getClass?._id,
        classTermFee:
          getClass?.presentTerm === "1st Term"
            ? getClass?.class1stFee
            : getClass?.presentTerm === "2nd Term"
            ? getClass?.class2ndFee
            : getClass?.presentTerm === "3rd Term"
            ? getClass?.class3rdFee
            : null,
      },
      { new: true }
    );

    getClass?.students?.push(new Types.ObjectId(student?._id));
    getClass?.save();

    return res.status(201).json({
      message: `class monitor assigned to ${student?.studentFirstName} `,
      data: student,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating class's monitor",
      data: error.message,
    });
  }
};

export const deleteStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const school: any = await schoolModel.findById(schoolID);

    if (school) {
      const student: any = await studentModel.findByIdAndDelete(studentID);
      const checkClass = await classroomModel.find();
      const checkStudentClass: any = await classroomModel.findOne(
        student?.presentClassID
      );

      if (checkClass.length > 0) {
        const teacherClass: any = checkClass[0];

        school?.students?.pull(new Types.ObjectId(studentID));
        teacherClass?.students?.pull(new Types.ObjectId(studentID));
        checkStudentClass?.students?.pull(new Types.ObjectId(studentID));

        school.save();
        teacherClass.save();
      }

      return res.status(200).json({
        message: "Successfully Deleted Student",
        status: 200,
        data: student,
      });
    } else {
      return res.status(404).json({
        message: "No School Found",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error deleting student",
      status: 404,
      data: error.message,
    });
  }
};

// Delete ALL students in one click endpoint
export const deleteAllStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const school = await schoolModel.findById(schoolID);

    if (school) {
      const allStudentIDs = school?.students;

      for (const studentID of allStudentIDs) {
        const student = await studentModel.findByIdAndDelete(studentID);

        if (student) {
          await classroomModel.updateMany(
            { students: studentID },
            { $pull: { students: studentID } }
          );
        }
      }

      school.students = [];
      await school.save();

      return res.status(200).json({
        message: "Successfully deleted all students",
        data: allStudentIDs,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Deleting All Students",
      status: 404,
      error: error.message,
    });
  }
};
