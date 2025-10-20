import { Request, Response } from "express";
import examinationModel from "../model/examinationModel";
import lodash from "lodash";
import classroomModel from "../model/classroomModel";
import subjectModel from "../model/subjectModel";
import staffModel from "../model/staffModel";
import schoolModel from "../model/schoolModel";
import csv from "csvtojson";
import mammoth from "mammoth";
import cheerio from "cheerio";

import path from "node:path";
import fs from "node:fs";
import { uploadDataUri } from "../utils/streamifier";
import { Types } from "mongoose";

export const createSubjectExam = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { classID, subjectID } = req.params;
    const { theory, instruction, duration, mark } = req.body;
    let filePath = path.join(__dirname, "../uploads/examination");

    const classRoom = await classroomModel.findById(classID);

    const checkForSubject = await subjectModel.findById(subjectID);

    // teacher assigned to the class
    const findTeacher = await staffModel.findById(classRoom?.teacherID);

    // teacher assigned specifically to the subject (teacherID stored on subject)
    const findSubjectTeacher = await staffModel.findById(
      checkForSubject?.teacherID
    );

    const school = await schoolModel.findById(findTeacher?.schoolIDs);

    // const { secure_url, public_id }: any = await streamUpload(req);

    const uploadedPath = req?.file?.path;
    if (!uploadedPath) {
      return res.status(400).json({
        message: "No upload file provided",
        status: 400,
      });
    }

    const originalName = req?.file?.originalname || uploadedPath;
    const ext = path.extname(originalName).toLowerCase();

    let value: any[] = [];

    if (ext === ".doc" || ext === ".docx") {
      // Convert Word docx to HTML to preserve images and markup
      const result = await mammoth.convertToHtml(
        { path: uploadedPath },
        { includeEmbeddedStyleMap: true }
      );
      let html = result.value || "";
      // Remove all bullet/numbered lists from HTML
      html = html.replace(/<(ul|ol)[^>]*>[\s\S]*?<\/\1>/gi, "");
      // Remove <li> tags (if any remain)
      html = html.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "$1");
      // Remove common bullet characters from text (•, ◦, etc.)
      html = html.replace(/[•◦‣▪–—]/g, "");

      const $ = cheerio.load(html);

      // split by paragraphs and headings to get question blocks
      const blocks: string[] = [];
      const elems: any[] = $("p, h1, h2, h3").toArray();
      for (const el of elems as any[]) {
        let text = $(el as any)
          .text()
          .trim();
        // Remove leading numbering (e.g., "1. ", "2) ", "(a) ", "a. ")
        text = text.replace(/^\s*\d+[\.|\)]\s*/g, "");
        text = text.replace(/^\s*[a-zA-Z][\.|\)]\s*/g, "");
        if (text) blocks.push(text);
      }

      // collect images mapped by their surrounding block index
      const imagesByIndex: Record<number, string[]> = {};
      const imgs: any[] = $("img").toArray();
      for (const imgEl of imgs as any[]) {
        const src = $(imgEl as any).attr("src");
        if (!src) continue;
        const parent = $(imgEl as any).closest("p, li, h1, h2, h3")[0] as any;
        let idx = -1;
        if (parent) {
          idx = (elems as any[]).indexOf(parent);
        }
        const key = idx >= 0 ? idx : blocks.length;
        imagesByIndex[key] = imagesByIndex[key] || [];
        imagesByIndex[key].push(src);
      }

      // If images are data URIs (embedded), upload them to Cloudinary so they
      // are visible and performant for students. Replace data URIs with hosted URLs.
      for (const k of Object.keys(imagesByIndex)) {
        const arr = imagesByIndex[Number(k)];
        const uploadedUrls: string[] = [];
        for (const src of arr) {
          try {
            if (typeof src === "string" && src.startsWith("data:")) {
              const uploadRes: any = await uploadDataUri(src, "exams");
              if (uploadRes && uploadRes.secure_url) {
                uploadedUrls.push(uploadRes.secure_url);
              }
            } else if (typeof src === "string") {
              // not a data URI (likely a valid src already) — keep as-is
              uploadedUrls.push(src);
            }
          } catch (err) {
            // on failure, keep the original src so diagram isn't lost
            uploadedUrls.push(src);
          }
        }
        imagesByIndex[Number(k)] = uploadedUrls;
      }

      let questionData: any = {};
      let options: string[] = [];

      const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
      for (let idx = 0; idx < blocks.length; idx++) {
        let line = blocks[idx];

        // Normalize whitespace
        line = line
          .replace(/\t+/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();

        // If this is the start of a new numbered question
        if (/^\d+\./.test(line)) {
          // Save previous question if present
          if (Object.keys(questionData).length) {
            questionData.options = options;
            if (imagesByIndex[idx - 1])
              questionData.images = imagesByIndex[idx - 1];
            value.push(questionData);
            questionData = {};
            options = [];
          }

          // Extract and remove any inline Answer or Explanation from the same line
          const inlineAnswerMatch = line.match(
            /Answer:\s*([A-D])(?:\.\s*(.*))?/i
          );
          if (inlineAnswerMatch) {
            // keep the answer text; if it contains option text, use it, else use the letter
            questionData.answer = inlineAnswerMatch[2]
              ? inlineAnswerMatch[2].trim()
              : inlineAnswerMatch[1].toUpperCase();
            line = line.replace(/Answer:\s*([A-D])(?:\.\s*(.*))?/i, "").trim();
          }
          const inlineExplMatch = line.match(/Explanation:\s*(.*)$/i);
          if (inlineExplMatch) {
            questionData.explanation = inlineExplMatch[1].trim();
            line = line.replace(/Explanation:\s*(.*)$/i, "").trim();
          }

          // Extract bracketed image URL if present in same line
          const bracketMatch = line.match(BRACKET_URL_REGEX);
          const bracketUrl = bracketMatch ? bracketMatch[1].trim() : null;
          if (bracketUrl) line = line.replace(BRACKET_URL_REGEX, "").trim();

          // Detect inline options in the same line (A. ... B. ... C. ... D.)
          const aIdx = line.search(/\bA\./);
          const hasInlineOptions = aIdx > -1 && /\bB\./.test(line);

          if (hasInlineOptions) {
            // Stem is text before 'A.'
            const stem = line
              .slice(0, aIdx)
              .replace(/^\d+\.\s*/, "")
              .trim();
            questionData = { question: stem };
            // Options portion
            const optPart = line.slice(aIdx);
            const parts = optPart.split(/(?=[A-D]\.)/).filter(Boolean);
            options = parts.map((p) => p.replace(/^[A-D]\.\s*/, "").trim());

            // If we detected inline answer earlier, ensure it's present
            if (questionData.answer) {
              // nothing to do
            }
            if (bracketUrl) questionData.images = [bracketUrl];
            // Do not push yet; behavior keeps consistent with multi-line format
          } else {
            // No inline options — treat whole line as stem (question text)
            const stem = line.replace(/^\d+\.\s*/, "").trim();
            questionData = { question: stem };
            if (bracketUrl) questionData.images = [bracketUrl];
          }
        } else if (/^[A-D]\./.test(line)) {
          // Option line
          options.push(line.replace(/^[A-D]\./, "").trim());
        } else if (/^Answer:\s*/.test(line)) {
          // Answer on its own line; could be 'Answer: A' or 'Answer: A. option text'
          const m = line.match(/Answer:\s*([A-D])(?:\.\s*(.*))?/i);
          if (m) {
            questionData.answer = m[2] ? m[2].trim() : m[1].toUpperCase();
          } else {
            questionData.answer = line.replace(/^Answer:\s*/i, "").trim();
          }
        } else if (/^Explanation:\s*/.test(line)) {
          questionData.explanation = line
            .replace(/^Explanation:\s*/i, "")
            .trim();
        } else {
          // Continuation of question stem (multi-line stem) — append if no options yet
          if (questionData && !questionData.options) {
            // also strip bracketed image urls if present
            const match = line.match(BRACKET_URL_REGEX);
            const url = match ? match[1].trim() : null;
            line = line.replace(BRACKET_URL_REGEX, "").trim();
            questionData.question = `${questionData.question} ${line}`.trim();
            if (url) {
              if (!questionData.images) questionData.images = [];
              questionData.images.push(url);
            }
          }
        }
      }

      if (Object.keys(questionData).length) {
        // If options were parsed inline, ensure options array is set
        if (!questionData.options) questionData.options = options;
        // Attach images that were nearby (if none already attached)
        const lastIdx = blocks.length - 1;
        if (!questionData.images && imagesByIndex[lastIdx])
          questionData.images = imagesByIndex[lastIdx];
        value.push(questionData);
      }
    } else {
      // treat as CSV
      const data = await csv().fromFile(uploadedPath);
      for (const i of data as any[]) {
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

    // checkForSubject;
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

      // await examinationModel.deleteMany();

      const quizes = await examinationModel.create({
        subjectTitle: checkForSubject?.subjectTitle,
        subjectID: checkForSubject?._id,
        session: school?.presentSession,
        term: school?.presentTerm,
        // quiz: {
        //   instruction: { duration, mark, instruction },
        //   question: value,
        // },

        quiz: {
          instruction: { duration, mark, instruction },
          question: value,
          theory,
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

      const x = setTimeout(async () => {
        await deleteFilesInFolder(filePath);
        clearTimeout(x);
      }, 15000);

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

export const readExamination = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { examID } = req.params;

    const quiz: any = await examinationModel.findById(examID);

    return res.status(201).json({
      message: "subject quiz read successfully",
      data: quiz,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      data: error.message,
      status: 404,
    });
  }
};


export const deleteExamination = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { examID, subjectID, teacherID } = req.params;

    const quizSubject: any = await subjectModel.findById(subjectID);
    const quizTeacher: any = await staffModel.findById(teacherID);

    const quiz: any = await examinationModel.findByIdAndDelete(examID);

    quizSubject.pull(new Types.ObjectId(examID));
    quizSubject.save();
    quizTeacher.pull(new Types.ObjectId(examID));
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
