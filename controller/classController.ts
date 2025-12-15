import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import subjectModel from "../model/subjectModel";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import staffModel from "../model/staffModel";
import lodash from "lodash";
import studentModel from "../model/studentModel";
import cardReportModel from "../model/cardReportModel";
import { log } from "console";

import csv from "csvtojson";
import moment from "moment";
import fs from "node:fs";
import path from "node:path";
import crypto from "crypto";

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

    if (school && school.status === "school-admin") {
      if (!checkClass) {
        const classes = await classroomModel.create({
          schoolName: school.schoolName,
          classTeacherName,
          className,
          class2ndFee,
          class3rdFee,
          class1stFee,
          schoolIDs: schoolID,
          presentTerm: school?.presentTerm,
        });

        school.historys.push(new Types.ObjectId(classes._id));
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
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
      error,
    });
  }
};

export const createBulkSchoolClassroom = async (
  req: Request | any,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    let filePath = path.join(__dirname, "../uploads/examination");

    const deleteFilesInFolder = (folderPath: any) => {
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);

        files.forEach((file) => {
          const filePath = path.join(folderPath, file);
          fs.unlinkSync(filePath);
        });

        console.log(
          `All files in the folder '${folderPath}' have been deleted.`
        );
      } else {
        console.log(`The folder '${folderPath}' does not exist.`);
      }
    };
    console.log("data: ", filePath, req.file.path);

    const data = await csv().fromFile(req.file.path);
    console.log(data);

    for (let i of data) {
      const school = await schoolModel.findById(schoolID).populate({
        path: "classRooms",
      });

      const checkClass = school?.classRooms.some((el: any) => {
        return el.className === i?.className;
      });

      const findClass: any = school?.classRooms?.find((el: any) => {
        return el.className === i?.classAssigned;
      });

      if (school && school.status === "school-admin") {
        if (!checkClass) {
          const classes = await classroomModel.create({
            schoolName: school.schoolName,
            classTeacherName: i?.classTeacherName,
            className: i?.className,
            class2ndFee: parseInt(i?.class2ndFee.replace(/,/g, "")),
            class3rdFee: parseInt(i?.class3rdFee.replace(/,/g, "")),
            class1stFee: parseInt(i?.class1stFee.replace(/,/g, "")),
            schoolIDs: schoolID,
            presentTerm: school?.presentTerm,
          });

          school.historys.push(new Types.ObjectId(classes._id));
          school.classRooms.push(new Types.ObjectId(classes._id));

          school.save();
          deleteFilesInFolder(filePath);
          // return res.status(201).json({
          //   message: "classes created successfully",
          //   data: classes,
          //   status: 201,
          // });
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

export const viewOneClassRM = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;

    const schoolClasses = await classroomModel.findById(classID);

    return res.status(200).json({
      message: "School's class info found",
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

export const updateSchoolClassName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, classID } = req.params;
    const { className } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const subjects = await classroomModel.findByIdAndUpdate(
        classID,
        {
          className,
        },
        { new: true }
      );

      for (let i of school.students) {
        let student = await studentModel.findById(i);
        if (student?.presentClassID === classID) {
          await studentModel.findByIdAndUpdate(
            i,
            { classAssigned: className },
            { new: true }
          );
        }
      }

      for (let i of school.staff) {
        let staff = await staffModel.findById(i);

        if (staff?.presentClassID === classID) {
          let myClass: any = staff?.classesAssigned.find((el: any) => {
            return el.classID === classID;
          });

          myClass = { className, classID };

          let xx = staff?.classesAssigned.filter((el: any) => {
            return el.classID !== classID;
          });

          let subj = staff?.subjectAssigned.find((el: any) => {
            return el.classID === classID;
          });

          subj = { ...subj, classMeant: className };

          let yy = staff?.subjectAssigned.filter((el: any) => {
            return el.classID !== classID;
          });

          await staffModel.findByIdAndUpdate(
            i,
            {
              classesAssigned: [...xx, myClass],
              subjectAssigned: [
                ...staff?.subjectAssigned.filter((el: any) => {
                  return el.classID !== classID;
                }),
                subj,
              ],
            },
            { new: true }
          );
        }
      }

      for (let i of school.subjects) {
        let subject: any = await subjectModel.findById(i);

        if (subject?.subjectClassID === classID) {
          await subjectModel.findByIdAndUpdate(
            i,
            { designated: className! },
            { new: true }
          );
        }
      }

      return res.status(201).json({
        message: "class name updated successfully",
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
      message: "Error creating updating class name",
      status: 404,
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
            classesAssigned: [
              ...getTeacher?.classesAssigned,
              { className: subjects?.className!, classID },
            ],
            presentClassID: classID,
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

export const updateSchoolClass1stFee = async (req: Request, res: Response) => {
  try {
    const { schoolID, classID } = req.params;
    const { class1stFee, class2ndFee, class3rdFee } = req.body;

    const school = await schoolModel.findById(schoolID);
    const getClass = await classroomModel.findById(classID);

    if (school && school.schoolName && school.status === "school-admin") {
      if (getClass) {
        const update = await classroomModel.findByIdAndUpdate(
          getClass._id,
          {
            class1stFee,
            class2ndFee,
            class3rdFee,
          },
          { new: true }
        );

        // After updating class fees, reflect the change on students in this class.
        // Determine which term is active on the class and set students' classTermFee accordingly.
        try {
          const term = update?.presentTerm;
          const feeForTerm =
            term === "1st Term"
              ? update?.class1stFee
              : term === "2nd Term"
              ? update?.class2ndFee
              : term === "3rd Term"
              ? update?.class3rdFee
              : null;

          if (feeForTerm !== null && feeForTerm !== undefined) {
            await studentModel.updateMany(
              { presentClassID: classID },
              { $set: { classTermFee: feeForTerm } }
            );
          }
        } catch (err: any) {
          // Log but don't fail the entire request — the class fees were updated.
          console.error(
            "Failed to update students' classTermFee:",
            err?.message || err
          );
        }

        return res.status(201).json({
          message: "class term fee updated successfully",
          data: update,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "unable to find class",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
      data: error.message,
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

export const studentOfWeek = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;
    const { studentName, remark } = req.body;

    const teacher = await staffModel.findById(teacherID);

    const classRM = await classroomModel
      .findById(teacher?.presentClassID)
      .populate({
        path: "students",
      });

    const getStudent: any = classRM?.students.find((el: any) => {
      return (
        `${el.studentFirstName}` === studentName.trim().split(" ")[0] &&
        `${el.studentLastName}` === studentName.trim().split(" ")[1]
      );
    });

    const studentData = await studentModel.findById(getStudent?._id);

    if (teacher?.status === "school-teacher" && classRM && studentData) {
      const week = await classroomModel.findByIdAndUpdate(
        classRM?._id,
        {
          weekStudent: {
            student: studentData,
            remark,
          },
        },
        { new: true }
      );

      return res.status(201).json({
        message: "student of the week awarded",
        status: 201,
        data: week,
      });
    } else {
      return res.status(404).json({
        message: "student 2nd fees not found",
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

/**
 * GET /view-class-positions/:classID?source=historical|report|mid&term=&session=
 * source defaults to 'historical'.
 * Computes positions for students in a class based on chosen source's total points.
 */
export const viewClassPositions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { classID } = req.params;
    // Always use report card (cardReportModel) for ranking.
    const { term, session } = req.query as any;

    // populate students and their reportCard entries so we can inspect per-student reports
    const classDoc = await classroomModel.findById(classID).populate({
      path: "students",
      populate: { path: "reportCard" },
    });

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found", status: 404 });
    }

    const students: any[] = classDoc.students || [];

    // Helper to get numeric score for a student using report cards only.
    const getScoreForStudent = async (student: any): Promise<number> => {
      try {
        // Prefer using populated student.reportCard if available
        const reports = Array.isArray(student?.reportCard)
          ? student.reportCard
          : [];

        // filter candidate reports by class, term (classInfo), and session when provided
        const candidates = reports.filter((r: any) => {
          if (!r) return false;
          // r may be an ObjectId if not populated
          if (typeof r === "string" || r instanceof Types.ObjectId)
            return false;
          if (classID && r.classes && `${r.classes}` !== `${classID}`)
            return false;
          if (term && r.classInfo && `${r.classInfo}` !== `${term}`)
            return false;
          if (session && r.session && `${r.session}` !== `${session}`)
            return false;
          return true;
        });

        // choose most recent candidate if any
        let chosen: any = null;
        if (candidates.length > 0) {
          chosen = candidates.sort((a: any, b: any) => {
            const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          })[0];
        } else {
          // fallback to querying report collection directly (in case student's reportCard wasn't populated)
          const q: any = { student: student._id };
          if (classID) q.classes = classID;
          if (term) q.classInfo = term;
          if (session) q.session = session;
          chosen = await cardReportModel.findOne(q).sort({ createdAt: -1 });
        }

        if (!chosen) return 0;

        // If points already set on the report, use it
        if (typeof chosen.points === "number" && chosen.points > 0) {
          return chosen.points;
        }

        // Otherwise try to compute from result array (per-subject points)
        if (Array.isArray(chosen.result) && chosen.result.length > 0) {
          const total = chosen.result.reduce(
            (sum: number, r: any) => sum + (r.points || 0),
            0
          );
          const avg = total / chosen.result.length;
          return Number.isFinite(avg) ? parseFloat(avg.toFixed(2)) : 0;
        }

        // last fallback
        return 0;
      } catch (e) {
        return 0;
      }
    };

    // Build array of { student, score }
    const scored: Array<{ student: any; score: number }> = [];

    console.log("ed: ", students);

    for (const s of students) {
      // if historical/report/mid not present, fallback to student's totalPerformance
      const scoreFromModel = await getScoreForStudent(s);
      const fallback =
        typeof s.totalPerformance === "number" ? s.totalPerformance : 0;
      const score = scoreFromModel || fallback;
      scored.push({ student: s, score });
    }

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Assign positions, handling ties (same score -> same position)
    const ranked = scored.map((entry, idx) => ({
      position: 0,
      score: entry.score,
      student: entry.student,
    }));

    let currentPos = 1;
    for (let i = 0; i < ranked.length; i++) {
      if (i === 0) {
        ranked[i].position = currentPos;
      } else {
        if (ranked[i].score === ranked[i - 1].score) {
          ranked[i].position = ranked[i - 1].position;
        } else {
          ranked[i].position = i + 1;
        }
      }
    }

    const best = ranked.length ? ranked[0] : null;
    const worst = ranked.length ? ranked[ranked.length - 1] : null;

    return res.status(200).json({
      message: "Class positions computed",
      status: 200,
      data: { ranked, best, worst },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error computing positions",
      error: error.message,
      status: 500,
    });
  }
};
