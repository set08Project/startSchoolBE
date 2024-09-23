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
import purchasedModel from "../model/historyModel";
import schoolFeeHistory from "../model/schoolFeeHistory";
import subjectModel from "../model/subjectModel";

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

      console.log(student?.schoolFeesHistory);

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
      const student = await studentModel.findByIdAndDelete(studentID);
      const checkClass = await classroomModel.find();

      if (checkClass.length > 0) {
        const teacherClass: any = checkClass[0];

        school?.students?.pull(new Types.ObjectId(studentID));
        teacherClass?.students?.pull(new Types.ObjectId(studentID));

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
