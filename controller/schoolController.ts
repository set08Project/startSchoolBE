import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import crypto from "crypto";
import { verifiedEmail } from "../utils/email";
import jwt from "jsonwebtoken";
import { streamUpload } from "../utils/streamifier";
import lodash from "lodash";
import { CronJob } from "cron";
import { verifiedaccess_v1 } from "googleapis";

export const viewSchoolTopStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const schoolClasses = await schoolModel.findById(schoolID).populate({
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

export const loginSchool = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { email, enrollmentID } = req.body;

    const school = await schoolModel.findOne({
      email,
    });

    console.log(school);

    if (school) {
      if (school.enrollmentID === enrollmentID) {
        if (school.verify) {
          const token = jwt.sign({ status: school.status }, "school", {
            expiresIn: "1d",
          });

          req.session.isAuth = true;
          req.session.isSchoolID = school._id;

          return res.status(201).json({
            message: "welcome back",
            data: token,
            user: school?.status,
            id: req.session.isSchoolID,
            status: 201,
          });
        } else {
          return res.status(404).json({
            message: "please check your email to verify your account",
          });
        }
      } else {
        return res.status(404).json({
          message: "Error reading your school enrollment ID",
        });
      }
    } else {
      return res.status(404).json({
        message: "Error finding school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school",
      data: error.message,
    });
  }
};

export const createSchool = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    const id = crypto.randomBytes(4).toString("hex");
    const school = await schoolModel.create({
      email,
      enrollmentID: id,
      status: "school-admin",
    });

    // verifiedEmail(school);

    const job = new CronJob(
      " * * * * 7", // cronTime
      async () => {
        const viewSchool = await schoolModel.findById(school._id);
        console.log(
          `Deleting school ${school?.schoolName} with email: ${school?.email}`
        );
        if (
          viewSchool?.staff?.length === 0 &&
          viewSchool?.students?.length === 0 &&
          viewSchool?.classRooms?.length === 0 &&
          viewSchool?.subjects?.length === 0 &&
          !viewSchool?.started &&
          !viewSchool?.verify
        ) {
          await schoolModel.findByIdAndDelete(school._id);
        }

        job.stop();
      }, // onTick
      null, // onComplete
      true // start
    );

    return res.status(201).json({
      message: "creating school",
      data: school,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school",
      data: error.message,
      status: 404,
    });
  }
};

export const verifySchool = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { verify: true },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const viewSchoolStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    return res.status(200).json({
      message: "viewing school record",
      data: school,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const viewSchoolStatusByName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolName } = req.params;

    const school = await schoolModel.findOne({ schoolName });

    return res.status(200).json({
      message: "viewing school record by her name",
      data: school,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const logoutSchool = async (
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
      message: "Error verifying school",
    });
  }
};

export const readSchoolCookie = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const readSchool = req.session.isSchoolID;

    return res.status(200).json({
      message: "GoodBye",
      data: readSchool,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const viewAllSchools = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const school = await schoolModel.find();

    return res.status(200).json({
      message: "viewing all school",
      data: school,
      length: school.length,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const deleteSchool = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    await schoolModel.findByIdAndDelete(schoolID);

    return res.status(200).json({
      message: "school deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const changeSchoolName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { schoolName } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { schoolName },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const changeSchoolAddress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { address } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { address },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const changeSchoolPhoneNumber = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { phone } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { phone },
        { new: true }
      );

      return res.status(201).json({
        message: "school phone number changes successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const changeSchoolPersonalName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { name, name2 } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified: any = await schoolModel.findByIdAndUpdate(
        schoolID,

        { name, name2 },

        { new: true }
      );

      console.log(verified?.name);

      return res.status(201).json({
        message: "school name changes successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

// school Image/Logo

export const updateSchoolAvatar = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          avatar: secure_url,
          avatarID: public_id,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school avatar has been, added",
        data: updatedSchool,
        status: 201,
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
// school shool has started

export const updateSchoolStartPossition = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;

    const school: any = await schoolModel.findById(schoolID);

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          started: true,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school has started, operation",
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
// school school Account info

export const updateSchoolAccountDetail = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { bankDetails } = req.body;

    const school: any = await schoolModel.findById(schoolID);

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          bankDetails,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school account detail updated successfully",
        data: updatedSchool,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error updating account details",
    });
  }
};

export const updateSchoolName = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { schoolName } = req.body;

    const school: any = await schoolModel.findById(schoolID);

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          schoolName,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school name has been updated successfully",
        data: updatedSchool,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error updating account details",
    });
  }
};

export const updateRegisterationStatus = async (req: any, res: Response) => {
  try {
    const {
      schoolName,
      email,
      schoolPhoneNumber,
      schoolCategory,
      schoolLocation,
      schoolOrganization,
    } = req.body;

    const school: any = await schoolModel.findOne({ email });
    if (school) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        school?._id,
        {
          schoolName,
          phone: schoolPhoneNumber,
          categoryType: schoolCategory,
          address: schoolLocation,
          organizationType: schoolOrganization,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "school detail has been updated successfully",
        data: updatedSchool,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error updating account details",
    });
  }
};

// export const approvedRegisteration = async (req: any, res: Response) => {
//   try {
//     const { email } = req.body;

//     const school: any = await schoolModel.findOne({ email });
//     if (school) {
//       const updatedSchool = await schoolModel.findByIdAndUpdate(
//         school?._id,
//         {
//           started: true,
//         },
//         { new: true }
//       );
//       verifiedEmail(school);

//       return res.status(200).json({
//         message: "school Has Approved",
//         data: updatedSchool,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Something went wrong",
//       });
//     }
//   } catch (error) {
//     return res.status(404).json({
//       message: "Error updating account details",
//     });
//   }
// };

export const getSchoolRegistered = async (req: Request, res: Response) => {
  try {
    const school: any = await schoolModel.find();

    return res.status(200).json({
      message: "school Has Approved",
      data: school,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error updating account details",
    });
  }
};

export const approveRegistration = async (req: Request, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { email } = req.body;

    const school: any = await schoolModel.findById(schoolID);

    if (school) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        school._id,
        {
          started: true,
        },
        { new: true }
      );

      await verifiedEmail(email);

      return res.status(200).json({
        message: "School has been approved",
        data: updatedSchool,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "School not found",

        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error approving registration",
      error: error.message,
    });
  }
};

export const changeSchoolTag = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { schoolTags } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { schoolTags },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const createSchoolTimetableRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { startBreak, startClass, endClass, endBreak, peroid } = req.body;

    const school = await schoolModel.findById(schoolID);

    const timeStructure = (
      startTime: string,
      endTime: string,
      interval: number
    ): Array<string> => {
      const timeSlots = [];
      let [startHour, startMinute] = startTime.split(":").map(Number);
      let [endHour, endMinute] = endTime.split(":").map(Number);

      // Convert everything to minutes
      let currentMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      while (currentMinutes < endMinutes) {
        // Calculate start time
        let startHours = Math.floor(currentMinutes / 60);
        let startMinutes = currentMinutes % 60;

        // Increment current time by interval (40 minutes)
        currentMinutes += interval;

        // Calculate end time
        let endHours = Math.floor(currentMinutes / 60);
        let endMinutes = currentMinutes % 60;

        // Convert to 12-hour format with AM/PM for both start and end
        const startPeriod = startHours >= 12 ? "PM" : "AM";
        startHours = startHours % 12 || 12; // Handle 12-hour format

        const endPeriod = endHours >= 12 ? "PM" : "AM";
        endHours = endHours % 12 || 12;

        // Format the times and push to the result
        const startFormatted = `${startHours
          .toString()
          .padStart(2, "0")}:${startMinutes
          .toString()
          .padStart(2, "0")}${startPeriod}`;
        const endFormatted = `${endHours
          .toString()
          .padStart(2, "0")}:${endMinutes
          .toString()
          .padStart(2, "0")}${endPeriod}`;

        timeSlots.push(`${startFormatted} - ${endFormatted}`);
      }

      return timeSlots;
    };

    const startPeriod = parseInt(startBreak) >= 12 ? "PM" : "AM";
    const endPeriod = parseInt(endBreak) >= 12 ? "PM" : "AM";

    if (school) {
      const classStructure = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          startBreak,
          startClass,
          endClass,
          endBreak,
          peroid,
          timeTableStructure: timeStructure(
            startClass,
            startBreak,
            parseInt(peroid!)
          ).concat(
            `${startBreak}${startPeriod} - ${endBreak}${endPeriod}`,
            timeStructure(endBreak, endClass, parseInt(peroid!))
          ),
        },
        { new: true }
      );

      return res.status(201).json({
        message: "school time-table structure created successfully",
        data: classStructure,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school timetable",
    });
  }
};
