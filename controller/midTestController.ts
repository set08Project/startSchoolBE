import { Request, Response } from "express";
import midTestModel from "../model/midTestModel";
import lodash from "lodash";
import classroomModel from "../model/classroomModel";
import subjectModel from "../model/subjectModel";
import staffModel from "../model/staffModel";
import schoolModel from "../model/schoolModel";
import csv from "csvtojson";

import path from "node:path";
import fs from "node:fs";
import { Types } from "mongoose";

export const createSubjectMidTest = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { classID, subjectID } = req.params;
    const { instruction, duration, mark, theory } = req.body;
    let filePath = path.join(__dirname, "../uploads/examination");

    const classRoom = await classroomModel.findById(classID);

    const checkForSubject = await subjectModel.findById(subjectID);
    console.log(checkForSubject);

    const findTeacher = await staffModel.findById(classRoom?.teacherID);

    console.log(findTeacher);
    const findSubjectTeacher = await subjectModel.findById(
      checkForSubject?.teacherID
    );

    console.log("here");
    const school = await schoolModel.findById(findTeacher?.schoolIDs);

    let data = await csv().fromFile(req?.file?.path);

    let value: any = [];
    console.log("here 1");
    for (let i of data) {
      i.options?.split(";;");
      let read = { ...i, options: i.options?.split(";;") };
      value.push(read);
    }

    let term = lodash.find(value, { term: school?.presentTerm });
    let session = lodash.find(value, { session: school?.presentSession });
    console.log("here 2");
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
      const quizes = await midTestModel.create({
        subjectTitle: checkForSubject?.subjectTitle,
        subjectID: checkForSubject?._id,
        session: school?.presentSession,
        term: school?.presentTerm,
        quiz: {
          instruction: { duration, mark, instruction },
          question: value,
          theory,
        },
        totalQuestions: value?.length,
        status: "midTest",
        startExam: false,
      });
      console.log("here 3");

      checkForSubject?.midTest.push(new Types.ObjectId(quizes._id));

      checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));

      checkForSubject?.save();

      findTeacher?.midTest.push(new Types.ObjectId(quizes._id));
      findTeacher?.save();

      findSubjectTeacher?.midTest.push(new Types.ObjectId(quizes._id));
      findSubjectTeacher?.save();

      const x = setTimeout(async () => {
        await deleteFilesInFolder(filePath);
        clearTimeout(x);
      }, 15000);

      return res.status(201).json({
        message: "midTest entry successfully",
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

export const readSubjectMidTest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "midTest",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    let midTest = lodash.filter(subject?.midTest, {
      status: "midTest",
    })[0];

    return res.status(201).json({
      message: "subject midTest read successfully",
      midTest,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error reading subject exam",
      status: 404,
    });
  }
};

export const startSubjectMidTest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { midTestID } = req.params;
    const { started } = req.body;

    const subject = await midTestModel.findByIdAndUpdate(
      midTestID,
      {
        startMidTest: started,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "start subject mid test read successfully",
      data: subject,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error reading subject mid test",
      status: 404,
    });
  }
};

export const readMidTest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { midTestID } = req.params;

    const quiz: any = await midTestModel.findById(midTestID);

    return res.status(201).json({
      message: "subject mid Test read successfully",
      data: quiz,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating subject mid Test",
      data: error.message,
      status: 404,
    });
  }
};
