import { Request, Response } from "express";
import examinationModel from "../model/examinationModel";
import lodash from "lodash";
import classroomModel from "../model/classroomModel";
import subjectModel from "../model/subjectModel";
import staffModel from "../model/staffModel";
import schoolModel from "../model/schoolModel";
import csv from "csvtojson";

import path from "node:path";
import fs from "node:fs";
import { Types } from "mongoose";

export const createSubjectExam = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { classID, subjectID } = req.params;
    const { instruction, duration, mark } = req.body;

    const classRoom = await classroomModel.findById(classID);

    const checkForSubject = await subjectModel.findById(subjectID);

    const findTeacher = await staffModel.findById({
      _id: classRoom?.teacherID,
    });

    const findSubjectTeacher = await subjectModel.findById({
      _id: checkForSubject?.teacherID,
    });
    const school = await schoolModel.findById(findTeacher?.schoolIDs);

    // const { secure_url, public_id }: any = await streamUpload(req);
    console.log(req?.file?.path);

    let data = await csv().fromFile(req?.file?.path);

    let value: any = [];

    for (let i of data) {
      i.options?.split(";;");
      let read = { ...i, options: i.options?.split(";;") };
      value.push(read);
    }

    let term = lodash.find(value, { term: school?.presentTerm });
    let session = lodash.find(value, { session: school?.presentSession });

    let filePath = path.join(__dirname, "uploads");

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

    if (checkForSubject) {
      // if (term && session) {
      //   const quizes = await quizModel.findByIdAndUpdate(
      //     term?._id,
      //     {
      //       quiz: {
      //         instruction: { duration, mark, instruction },
      //         question: value,
      //       },
      //       totalQuestions: value?.length,
      //       startExam: false,
      //     },
      //     { new: true }
      //   );

      //   let filePath = path.join(__dirname, "uploads");

      //   const deleteFilesInFolder = (folderPath: any) => {
      //     if (fs.existsSync(folderPath)) {
      //       const files = fs.readdirSync(folderPath);

      //       files.forEach((file) => {
      //         const filePath = path.join(folderPath, file);
      //         fs.unlinkSync(filePath);
      //       });

      //       console.log(
      //         `All files in the folder '${folderPath}' have been deleted.`
      //       );
      //     } else {
      //       console.log(`The folder '${folderPath}' does not exist.`);
      //     }
      //   };

      //   deleteFilesInFolder(filePath);

      //   return res.status(201).json({
      //     message: "update exam entry successfully",
      //     data: quizes,
      //     status: 201,
      //   });
      // } else {
      //   const quizes = await quizModel.create({
      //     subjectTitle: checkForSubject?.subjectTitle,
      //     subjectID: checkForSubject?._id,
      //     session: school?.presentSession,
      //     term: school?.presentTerm,
      //     quiz: {
      //       instruction: { duration, mark, instruction },
      //       question: value,
      //     },
      //     totalQuestions: value?.length,
      //     status: "examination",
      //     startExam: false,
      //   });

      //   checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));

      //   checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));

      //   checkForSubject?.save();

      //   findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
      //   findTeacher?.save();

      //   findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
      //   findSubjectTeacher?.save();

      //   let filePath = path.join(__dirname, "uploads");

      //   const deleteFilesInFolder = (folderPath: any) => {
      //     if (fs.existsSync(folderPath)) {
      //       const files = fs.readdirSync(folderPath);

      //       files.forEach((file) => {
      //         const filePath = path.join(folderPath, file);
      //         fs.unlinkSync(filePath);
      //       });

      //       console.log(
      //         `All files in the folder '${folderPath}' have been deleted.`
      //       );
      //     } else {
      //       console.log(`The folder '${folderPath}' does not exist.`);
      //     }
      //   };

      //   return res.status(201).json({
      //     message: "exam entry successfully",
      //     // data: quizes,
      //     status: 201,
      //   });
      // }

      await examinationModel.deleteMany();

      const quizes = await examinationModel.create({
        subjectTitle: checkForSubject?.subjectTitle,
        subjectID: checkForSubject?._id,
        session: school?.presentSession,
        term: school?.presentTerm,
        quiz: {
          instruction: { duration, mark, instruction },
          question: value,
        },
        totalQuestions: value?.length,
        status: "examination",
        startExam: false,
      });

      checkForSubject?.examination.push(new Types.ObjectId(quizes._id));

      checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));

      checkForSubject?.save();

      findTeacher?.examination.push(new Types.ObjectId(quizes._id));
      findTeacher?.save();

      findSubjectTeacher?.examination.push(new Types.ObjectId(quizes._id));
      findSubjectTeacher?.save();

      await deleteFilesInFolder(filePath);

      return res.status(201).json({
        message: "exam entry successfully",
        data: quizes,
        exam: checkForSubject?.examination,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Subject doesn't exist for this class",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
      error: error,
      data: error?.message,
    });
  }
};

export const readSubjectExamination = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "examination",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    let exam = lodash.filter(subject?.examination, {
      status: "examination",
    })[0];

    return res.status(201).json({
      message: "subject exam read successfully",
      exam,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error reading subject exam",
      status: 404,
    });
  }
};

export const startSubjectExamination = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { examID } = req.params;
    const { started } = req.body;

    const subject = await examinationModel.findByIdAndUpdate(
      examID,
      {
        startExam: started,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "start subject exam read successfully",
      data: subject,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error reading subject exam",
      status: 404,
    });
  }
};
