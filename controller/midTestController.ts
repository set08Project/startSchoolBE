import { Request, Response } from "express";
import midTestModel from "../model/midTestModel";
import lodash from "lodash";
import classroomModel from "../model/classroomModel";
import subjectModel from "../model/subjectModel";
import staffModel from "../model/staffModel";
import schoolModel from "../model/schoolModel";
import csv from "csvtojson";
import mammoth from "mammoth";

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

    const findTeacher = await staffModel.findById(classRoom?.teacherID);

    const findSubjectTeacher = await subjectModel.findById(
      checkForSubject?.teacherID
    );

    const school = await schoolModel.findById(findTeacher?.schoolIDs);

    const uploadedPath = req?.file?.path;
    if (!uploadedPath) {
      return res
        .status(400)
        .json({ message: "No upload file provided", status: 400 });
    }

    const originalName = req?.file?.originalname || uploadedPath;
    const ext = path.extname(originalName).toLowerCase();

    let value: any[] = [];

    if (ext === ".doc" || ext === ".docx") {
      const { value: rawText } = await mammoth.extractRawText({
        path: uploadedPath,
      });

      // Clean rawText: remove common bullet characters and normalize numbering
      let cleaned = rawText || "";
      // remove bullet characters
      cleaned = cleaned.replace(/[•◦‣▪–—]/g, " ");
      // normalize multiple spaces and tabs
      cleaned = cleaned.replace(/\t+/g, " ").replace(/ {2,}/g, " ");

      // Split into non-empty lines
      const rawLines = cleaned
        .split(/\r?\n/)
        .map((l: string) => l.trim())
        .filter((l: string) => l);

      let questionData: any = {};
      let options: string[] = [];

      const BRACKET_URL_REGEX = /\[([^\]]+)\]/;

      for (const lineOrig of rawLines) {
        let line = lineOrig;

        // Remove leading numbering like "1.", "2)", "(a)" etc for easier parsing
        line = line.replace(/^\s*\(?\d+\)?[\.|\)]\s*/g, "");
        line = line.replace(/^\s*\(?[a-zA-Z]\)?[\.|\)]\s*/g, "");

        // Normalize whitespace
        line = line.replace(/\s{2,}/g, " ").trim();

        // Check for start of a new question
        if (/^\d+\./.test(lineOrig) || /^\d+\)/.test(lineOrig)) {
          // save previous
          if (Object.keys(questionData).length) {
            questionData.options = options;
            value.push(questionData);
            questionData = {};
            options = [];
          }

          // Extract inline bracketed URL
          const match = line.match(BRACKET_URL_REGEX);
          const url = match ? match[1].trim() : null;
          if (url) line = line.replace(BRACKET_URL_REGEX, "").trim();

          // detect inline options on the same line (A. ... B. ...)
          const aIdx = line.search(/\bA\./i);
          const hasInlineOptions = aIdx > -1 && /\bB\./i.test(line);
          if (hasInlineOptions) {
            const stem = line.slice(0, aIdx).trim();
            questionData = { question: stem };
            const optPart = line.slice(aIdx);
            const parts: string[] = optPart
              .split(/(?=[A-D]\.)/i)
              .filter(Boolean) as string[];
            options = parts.map((p: string) =>
              p.replace(/^[A-D]\.|^[a-d]\./i, "").trim()
            );
          } else {
            questionData = { question: line };
          }

          if (url) questionData.images = [url];
        } else if (/^[A-D]\./i.test(line)) {
          // option line
          options.push(line.replace(/^[A-D]\./i, "").trim());
        } else if (/^Answer:\s*/i.test(line)) {
          const m = line.match(/^Answer:\s*([A-D])(?:\.\s*(.*))?/i);
          if (m) {
            questionData.answer = m[2] ? m[2].trim() : m[1].toUpperCase();
          } else {
            questionData.answer = line.replace(/^Answer:\s*/i, "").trim();
          }
        } else if (/^Explanation:\s*/i.test(line)) {
          questionData.explanation = line
            .replace(/^Explanation:\s*/i, "")
            .trim();
        } else {
          // continuation of stem
          if (questionData && !questionData.options) {
            const match = line.match(BRACKET_URL_REGEX);
            const url = match ? match[1].trim() : null;
            if (url) line = line.replace(BRACKET_URL_REGEX, "").trim();
            questionData.question = `${questionData.question} ${line}`.trim();
            if (url) {
              if (!questionData.images) questionData.images = [];
              questionData.images.push(url);
            }
          }
        }
      }

      if (Object.keys(questionData).length) {
        if (!questionData.options) questionData.options = options;
        value.push(questionData);
      }
    } else {
      const data = await csv().fromFile(uploadedPath);
      for (const i of data) {
        const opts = i.options ? i.options.split(";;") : [];
        const read = {
          question:
            i.Question ||
            i.question ||
            i.questionText ||
            i.questionTitle ||
            i.question,
          options: opts,
          answer: i.Answer || i.answer,
          explanation: i.Explanation || i.explanation,
        };
        value.push(read);
      }
    }

    let term = lodash.find(value, { term: school?.presentTerm });
    let session = lodash.find(value, { session: school?.presentSession });
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

export const updateSubjectMidTest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { midTestID } = req.params;
    const { mark, duration } = req.body;

    const midTest: any = await midTestModel.findByIdAndUpdate(midTestID);
    const subject = await midTestModel.findByIdAndUpdate(
      midTestID,
      {
        quiz: {
          instruction: { duration, mark },
          question: midTest?.quiz?.question,
          theory: midTest?.quiz?.theory,
        },
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

export const deleteMidTest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { midTestID, subjectID, teacherID } = req.params;

    const quizSubject: any = await subjectModel.findById(subjectID);
    const quizTeacher: any = await staffModel.findById(teacherID);

    await midTestModel.findByIdAndDelete(midTestID);

    if (quizSubject && Array.isArray(quizSubject.midTest)) {
      quizSubject.midTest = quizSubject.midTest.filter(
        (id: any) => id.toString() !== midTestID
      );
      await quizSubject.save();
    }

    quizTeacher.pull(new Types.ObjectId(midTestID));
    quizTeacher.save();

    return res.status(201).json({
      message: "subject mid Test read successfully",
      // data: quiz,
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
