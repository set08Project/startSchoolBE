// Temporarily skip TypeScript checks for this file due to heavy RegExp usage
// that relies on ES2018+ flags (s, g). This file will be revisited to
// refactor large regexes or update project tsconfig if necessary.
// @ts-nocheck

import AdmZip from "adm-zip";
import * as fs from "fs";
import * as path from "path";
import { Response } from "express";
import { Types } from "mongoose";
import csv from "csvtojson";

// Import your models
import classroomModel from "../model/classroomModel";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import quizModel from "../model/quizModel";
import schoolModel from "../model/schoolModel";
import examModel from "../model/examinationModel";

/**
 * Extract text from DOCX with proper math notation
 * Processes elements in order to maintain correct sequence
 */
async function extractRawTextFromDocx(filePath: string): Promise<string> {
  try {
    const zip = new AdmZip(filePath);
    const documentXml = zip.readAsText("word/document.xml");

    let fullText = "";

    // Split into paragraphs
    const paragraphs = documentXml.split(/<w:p[\s>]/);

    for (const para of paragraphs) {
      if (!para.trim()) continue;

      let paraText = processParagraph(para);

      if (paraText.trim()) {
        fullText += paraText.trim() + "\n";
      }
    }

    // Clean up
    fullText = fullText.replace(/\n\n\n+/g, "\n\n").trim();

    return fullText;
  } catch (error) {
    console.error("Error extracting raw text from DOCX:", error);
    throw error;
  }
}

/**
 * Process a paragraph and extract text/math in correct order
 */
function processParagraph(paraXml: string): string {
  let result = "";

  // Find all runs (text or math) with their positions
  const elements: { pos: number; content: string; type: string }[] = [];

  // Find regular text runs
  const textRunRegex = /<w:r[^>]*>.*?<w:t[^>]*>([^<]*)<\/w:t>.*?<\/w:r>/gs;
  let match;

  while ((match = textRunRegex.exec(paraXml)) !== null) {
    // Check if this run contains math (skip if it does)
    if (!match[0].includes("<m:oMath")) {
      elements.push({
        pos: match.index,
        content: match[1],
        type: "text",
      });
    }
  }

  // Find math runs
  const mathRunRegex = /<m:oMath>(.*?)<\/m:oMath>/gs;

  while ((match = mathRunRegex.exec(paraXml)) !== null) {
    const mathXml = match[1];
    const mathContent = processMathElement(mathXml);

    elements.push({
      pos: match.index,
      content: mathContent,
      type: "math",
    });
  }

  // Sort by position and concatenate
  elements.sort((a, b) => a.pos - b.pos);

  for (const elem of elements) {
    result += elem.content;
  }

  return result;
}

/**
 * Process a math element recursively and convert to readable notation
 */
function processMathElement(mathXml: string): string {
  let result = "";

  // Find all top-level math structures with their positions
  const structures: {
    start: number;
    end: number;
    content: string;
    type: string;
  }[] = [];

  // Find superscripts
  const supRegex = /<m:sSup>(.*?)<\/m:sSup>/gs;
  let match;
  while ((match = supRegex.exec(mathXml)) !== null) {
    const content = match[1];
    const baseMatch = content.match(/<m:e>(.*?)<\/m:e>/s);
    const supMatch = content.match(/<m:sup>(.*?)<\/m:sup>/s);

    function toSubscript(str: string): string {
      const subscriptMap: { [key: string]: string } = {
        "0": "₀",
        "1": "₁",
        "2": "₂",
        "3": "₃",
        "4": "₄",
        "5": "₅",
        "6": "₆",
        "7": "₇",
        "8": "₈",
        "9": "₉",
      };
      return str
        .split("")
        .map((char) => subscriptMap[char] || char)
        .join("");
    }

    if (baseMatch && supMatch) {
      const base = processMathElement(baseMatch[1]);
      const sup = processMathElement(supMatch[1]);
      structures.push({
        start: match.index,
        end: match.index + match[0].length,
        content: `${base}^(${sup})`,
        type: "sup",
      });
    }
  }

  // Find subscripts
  const subRegex = /<m:sSub>(.*?)<\/m:sSub>/gs;
  while ((match = subRegex.exec(mathXml)) !== null) {
    const content = match[1];
    const baseMatch = content.match(/<m:e>(.*?)<\/m:e>/s);
    const subMatch = content.match(/<m:sub>(.*?)<\/m:sub>/s);

    if (baseMatch && subMatch) {
      const base = processMathElement(baseMatch[1]);
      const sub = processMathElement(subMatch[1]);

      function toSubscript(str: string): string {
        const subscriptMap: { [key: string]: string } = {
          "0": "₀",
          "1": "₁",
          "2": "₂",
          "3": "₃",
          "4": "₄",
          "5": "₅",
          "6": "₆",
          "7": "₇",
          "8": "₈",
          "9": "₉",
        };
        return str
          .split("")
          .map((char) => subscriptMap[char] || char)
          .join("");
      }

      // Use Unicode subscripts for simple numeric subscripts
      if (/^\d+$/.test(sub)) {
        structures.push({
          start: match.index,
          end: match.index + match[0].length,
          content: `${base}${toSubscript(sub)}`, // log₁₀
          type: "sub",
        });
      } else {
        structures.push({
          start: match.index,
          end: match.index + match[0].length,
          content: `${base}_(${sub})`,
          type: "sub",
        });
      }
    }
  }

  // Find fractions
  const fracRegex = /<m:f>(.*?)<\/m:f>/gs;
  while ((match = fracRegex.exec(mathXml)) !== null) {
    const content = match[1];
    const numMatch = content.match(/<m:num>(.*?)<\/m:num>/s);
    const denMatch = content.match(/<m:den>(.*?)<\/m:den>/s);

    if (numMatch && denMatch) {
      const num = processMathElement(numMatch[1]);
      const den = processMathElement(denMatch[1]);
      structures.push({
        start: match.index,
        end: match.index + match[0].length,
        content: `(${num})/(${den})`,
        type: "frac",
      });
    }
  }

  // Find delimiters (matrices, determinants, absolute values, etc.)
  const delimRegex = /<m:d>(.*?)<\/m:d>/gs;
  while ((match = delimRegex.exec(mathXml)) !== null) {
    const content = match[1];

    // Extract bracket characters
    const begChrMatch = content.match(/<m:begChr[^>]*m:val="([^"]*)"/) ||
      content.match(/<m:begChr[^>]*>([^<]*)<\/m:begChr>/) || [null, "("];
    const endChrMatch = content.match(/<m:endChr[^>]*m:val="([^"]*)"/) ||
      content.match(/<m:endChr[^>]*>([^<]*)<\/m:endChr>/) || [null, ")"];

    let leftBracket = begChrMatch[1] || "(";
    let rightBracket = endChrMatch[1] || ")";

    // Map common bracket encodings to their symbols
    const bracketMap: { [key: string]: string } = {
      "(": "(",
      ")": ")",
      "[": "[",
      "]": "]",
      "{": "{",
      "}": "}",
      "|": "|",
      "〖": "(",
      "〗": ")",
    };

    leftBracket = bracketMap[leftBracket] || leftBracket;
    rightBracket = bracketMap[rightBracket] || rightBracket;

    // Normalize brackets for display
    if (leftBracket === "|" && rightBracket === "|") {
      // Could be determinant or absolute value
      leftBracket = "|";
      rightBracket = "|";
    }

    // Parse matrix content - look for matrix structure (m:m tag)
    const matrixMatch = content.match(/<m:m>(.*?)<\/m:m>/s);
    let delimContent = "";

    if (matrixMatch) {
      // This is a matrix structure
      const matrixXml = matrixMatch[1];
      const rows: string[] = [];

      // Extract rows (m:mr tags)
      const rowRegex = /<m:mr>(.*?)<\/m:mr>/gs;
      let rowMatch;

      while ((rowMatch = rowRegex.exec(matrixXml)) !== null) {
        const rowXml = rowMatch[1];
        const elements: string[] = [];

        // Extract elements (m:e tags within the row)
        const elemRegex = /<m:e>(.*?)<\/m:e>/gs;
        let elemMatch;

        while ((elemMatch = elemRegex.exec(rowXml)) !== null) {
          const elemContent = processMathElement(elemMatch[1]);
          elements.push(elemContent.trim());
        }

        if (elements.length > 0) {
          rows.push(elements.join(" "));
        }
      }

      // Format as matrix with semicolons separating rows
      delimContent = rows.join("; ");
    } else {
      // Not a matrix, extract content normally
      const eMatches = [...content.matchAll(/<m:e>(.*?)<\/m:e>/gs)];
      const parts: string[] = [];

      for (const eMatch of eMatches) {
        const innerContent = processMathElement(eMatch[1]);
        if (innerContent.trim()) {
          parts.push(innerContent.trim());
        }
      }

      delimContent = parts.join(" ");
    }

    structures.push({
      start: match.index,
      end: match.index + match[0].length,
      content: `${leftBracket}${delimContent}${rightBracket}`,
      type: "delim",
    });
  }

  // Find radicals (square roots)
  // const radRegex = /<m:rad>(.*?)<\/m:rad>/gs;
  // while ((match = radRegex.exec(mathXml)) !== null) {
  //   const content = match[1];
  //   const degMatch = content.match(/<m:deg>(.*?)<\/m:deg>/s);
  //   const baseMatch = content.match(/<m:e>(.*?)<\/m:e>/s);

  //   if (baseMatch) {
  //     const base = processMathElement(baseMatch[1]);
  //     if (degMatch) {
  //       const degree = processMathElement(degMatch[1]);
  //       structures.push({
  //         start: match.index,
  //         end: match.index + match[0].length,
  //         content: `root(${degree})(${base})`,
  //         type: 'rad'
  //       });
  //     } else {
  //       structures.push({
  //         start: match.index,
  //         end: match.index + match[0].length,
  //         content: `√(${base})`,
  //         type: 'rad'
  //       });
  //     }
  //   }
  // }

  const radRegex = /<m:rad>(.*?)<\/m:rad>/gs;
  while ((match = radRegex.exec(mathXml)) !== null) {
    const content = match[1];
    const degMatch = content.match(/<m:deg>(.*?)<\/m:deg>/s);
    const baseMatch = content.match(/<m:e>(.*?)<\/m:e>/s);

    if (baseMatch) {
      const base = processMathElement(baseMatch[1]);
      if (degMatch) {
        const degree = processMathElement(degMatch[1]).trim();
        // Only show degree if it's not empty and not "2" (square root)
        if (degree && degree !== "2") {
          structures.push({
            start: match.index,
            end: match.index + match[0].length,
            content: `root${degree}(${base})`, // Changed format: root3(...) or ³√(...)
            type: "rad",
          });
        } else {
          // It's a square root
          structures.push({
            start: match.index,
            end: match.index + match[0].length,
            content: `√(${base})`,
            type: "rad",
          });
        }
      } else {
        // No degree specified = square root
        structures.push({
          start: match.index,
          end: match.index + match[0].length,
          content: `√(${base})`,
          type: "rad",
        });
      }
    }
  }

  // Sort structures by position
  structures.sort((a, b) => a.start - b.start);

  // Extract all math runs (including plain text/operators)
  const runRegex = /<m:r>(.*?)<\/m:r>/gs;
  const runs: { start: number; content: string }[] = [];

  while ((match = runRegex.exec(mathXml)) !== null) {
    const runContent = match[1];
    const textMatches = [...runContent.matchAll(/<m:t[^>]*>([^<]*)<\/m:t>/g)];
    for (const textMatch of textMatches) {
      runs.push({
        start: match.index,
        content: textMatch[1],
      });
    }
  }

  // If we have structures, build result with them
  if (structures.length > 0) {
    let lastEnd = 0;

    for (const struct of structures) {
      // Add any runs that come before this structure
      for (const run of runs) {
        if (run.start >= lastEnd && run.start < struct.start) {
          result += run.content;
        }
      }

      // Add the structure
      result += struct.content;
      lastEnd = struct.end;
    }

    // Add any remaining runs after the last structure
    for (const run of runs) {
      if (run.start >= lastEnd) {
        result += run.content;
      }
    }
  } else {
    // No structures, just concatenate all runs
    for (const run of runs) {
      result += run.content;
    }
  }

  return result.trim();
}

/**
 * Helper to extract text content from math XML
 */
function extractMathText(xml: string): string {
  let text = "";
  const textMatches = xml.matchAll(/<m:t[^>]*>([^<]*)<\/m:t>/g);
  for (const match of textMatches) {
    text += match[1];
  }
  return text;
}

/**
 * Helper function to validate URLs (not LaTeX expressions)
 */
function isValidUrl(str: string): boolean {
  try {
    // If it contains mathematical symbols, it's not a URL
    if (
      str.includes("$") ||
      str.includes("\\") ||
      str.includes("^") ||
      str.includes("_") ||
      str.includes("(") ||
      str.includes("/") ||
      str.includes("√")
    ) {
      return false;
    }
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validation function for quiz questions
 */
const validateQuestion = (
  question: any,
  index: number
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!question.question || question.question.trim() === "") {
    errors.push(`Question ${index + 1}: Missing question text`);
  }

  if (!question.options || question.options.length === 0) {
    errors.push(`Question ${index + 1}: No options provided`);
  } else if (question.options.length < 2) {
    errors.push(`Question ${index + 1}: At least 2 options required`);
  } else {
    // Check if any options are empty
    question.options.forEach((opt: string, i: number) => {
      if (!opt || opt.trim() === "") {
        errors.push(
          `Question ${index + 1}, Option ${String.fromCharCode(
            65 + i
          )}: Empty option`
        );
      }
    });
  }

  if (!question.answer || question.answer.trim() === "") {
    errors.push(`Question ${index + 1}: Missing answer`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Main controller function to create subject examination/quiz from uploaded file
 */
export const createSubjectExamination = async (
  req: any,
  res: Response
): Promise<Response> => {
  let uploadedPath: string | undefined;

  try {
    const { classID, subjectID } = req.params;
    const { instruction, duration, mark } = req.body;

    console.log("=== QUIZ UPLOAD REQUEST ===");
    console.log("Class ID:", classID);
    console.log("Subject ID:", subjectID);

    // Validate required parameters
    if (!classID || !subjectID) {
      return res.status(400).json({
        message: "Missing required parameters: classID and subjectID",
        status: 400,
      });
    }

    if (!duration || !mark) {
      return res.status(400).json({
        message: "Missing required fields: duration and mark",
        status: 400,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded. Please select a file.",
        status: 400,
      });
    }

    uploadedPath = req.file.path;
    console.log("File uploaded to:", uploadedPath);

    // Validate file exists
    if (!fs.existsSync(uploadedPath!)) {
      return res.status(400).json({
        message: "Uploaded file not found on server",
        status: 400,
      });
    }

    const fileStats = fs.statSync(uploadedPath!);
    console.log("File size:", fileStats.size, "bytes");

    if (fileStats.size === 0) {
      return res.status(400).json({
        message: "Uploaded file is empty",
        status: 400,
      });
    }

    // Validate classroom and subject exist
    const classRoom = await classroomModel.findById(classID);
    if (!classRoom) {
      return res.status(404).json({
        message: "Classroom not found",
        status: 404,
      });
    }

    const checkForSubject = await subjectModel.findById(subjectID);
    if (!checkForSubject) {
      return res.status(404).json({
        message: "Subject doesn't exist for this class",
        status: 404,
      });
    }

    // Get related records
    const findTeacher = await staffModel.findById(classRoom?.teacherID);
    const findSubjectTeacher = await staffModel.findById(
      checkForSubject?.teacherID
    );
    const school = await schoolModel.findById(findTeacher?.schoolIDs);

    const originalName = req.file.originalname || uploadedPath;
    const ext = path.extname(originalName).toLowerCase();

    let value: any[] = [];
    const parsingErrors: string[] = [];

    // ============ DOCX FILE PARSING ============
    if (ext === ".doc" || ext === ".docx") {
      try {
        console.log("\n=== EXTRACTING TEXT FROM DOCX ===");

        const rawText = await extractRawTextFromDocx(uploadedPath!);

        console.log("Raw text preview:");
        console.log(rawText.substring(0, 1200));
        console.log("\nRaw text length:", rawText.length);

        if (!rawText || rawText.trim() === "") {
          return res.status(400).json({
            message:
              "The uploaded file appears to be empty or could not be read",
            status: 400,
          });
        }

        // Split by lines and process
        const lines = rawText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);

        console.log(`\nFound ${lines.length} lines to parse\n`);

        let questionData: any = {};
        let options: string[] = [];

        console.log("=== PARSING LINES ===");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          console.log(`\nLine ${i}: "${line.substring(0, 150)}..."`);

          if (!line) {
            console.log("  -> Skipped (empty)");
            continue;
          }

          // Detect new question (starts with number followed by . or ))
          if (/^\d+[\.\)]\s/.test(line)) {
            console.log("  -> Detected QUESTION");

            // Save previous question if present
            if (Object.keys(questionData).length > 0) {
              questionData.options = options;
              value.push(questionData);
              console.log(
                `  -> Saved previous question (${options.length} options)`
              );
              questionData = {};
              options = [];
            }

            // Extract image URL if present
            let url: string | null = null;
            const matches = line.match(/\[([^\]]+)\]/g);
            if (matches) {
              for (const match of matches) {
                const content = match.slice(1, -1).trim();
                if (isValidUrl(content)) {
                  url = content;
                  break;
                }
              }
            }

            // Remove number prefix and URL
            let cleanText = line.replace(/^\d+[\.\)]\s*/, "").trim();
            if (url) {
              cleanText = cleanText.replace(`[${url}]`, "").trim();
            }

            console.log(
              `  -> Question text: "${cleanText.substring(0, 150)}..."`
            );

            questionData = { question: cleanText };

            if (url) {
              questionData.images = [url];
              console.log(`  -> Added image: ${url}`);
            }
          }
          // Detect options (A. B. C. D.)
          else if (/^[A-D][\.\)]\s/.test(line)) {
            const cleanOption = line.replace(/^[A-D][\.\)]\s*/, "").trim();
            options.push(cleanOption);
            console.log(`  -> Detected OPTION: "${cleanOption}"`);
          }
          // Detect answer
          else if (/^Answer:\s*/i.test(line)) {
            const answerText = line.replace(/^Answer:\s*/i, "").trim();
            questionData.answer = answerText;
            console.log(`  -> Detected ANSWER: "${answerText}"`);
          }
          // Detect explanation
          else if (/^Explanation:\s*/i.test(line)) {
            const explanationText = line
              .replace(/^Explanation:\s*/i, "")
              .trim();
            questionData.explanation = explanationText;
            console.log(
              `  -> Detected EXPLANATION: "${explanationText.substring(
                0,
                50
              )}..."`
            );
          }
          // Continuation line
          else {
            if (questionData.question && options.length === 0) {
              console.log("  -> Continuation of question");

              // Check for image URL
              let url: string | null = null;
              const matches = line.match(/\[([^\]]+)\]/g);
              if (matches) {
                for (const match of matches) {
                  const content = match.slice(1, -1).trim();
                  if (isValidUrl(content)) {
                    url = content;
                    break;
                  }
                }
              }

              let cleanLine = line;
              if (url) {
                cleanLine = line.replace(`[${url}]`, "").trim();
              }

              questionData.question += " " + cleanLine;

              if (url) {
                if (!questionData.images) questionData.images = [];
                questionData.images.push(url);
                console.log(`  -> Added continuation image: ${url}`);
              }
            } else if (options.length > 0 && !questionData.answer) {
              // Continuation of last option
              console.log("  -> Continuation of last option");
              options[options.length - 1] += " " + line;
            } else {
              console.log("  -> Ignored (no active question)");
            }
          }
        }

        // Save last question if present
        if (Object.keys(questionData).length > 0) {
          questionData.options = options;
          value.push(questionData);
          console.log(`\nSaved last question (${options.length} options)`);
        }

        console.log(
          `\n=== PARSING COMPLETE: ${value.length} questions found ===`
        );

        // Debug: Print first 3 questions
        if (value.length > 0) {
          console.log("\n=== SAMPLE QUESTIONS ===");
          for (let i = 0; i < Math.min(3, value.length); i++) {
            console.log(`\nQuestion ${i + 1}:`);
            console.log(JSON.stringify(value[i], null, 2));
          }
        }

        if (value.length === 0) {
          return res.status(400).json({
            message:
              "No valid questions found in the document. Please check the format.",
            status: 400,
            hint: "Expected format: '1. Question text', 'A. Option', 'B. Option', etc., 'Answer: ...'",
            rawTextPreview: rawText.substring(0, 1500),
          });
        }
      } catch (docError: any) {
        console.error("DOCX Parsing Error:", docError);
        return res.status(400).json({
          message: "Error parsing DOCX file",
          status: 400,
          error: docError.message,
        });
      }
    }
    // ============ CSV FILE PARSING ============
    else if (ext === ".csv") {
      try {
        console.log("\n=== PARSING CSV FILE ===");
        const data = await csv().fromFile(uploadedPath!);

        for (const i of data) {
          const opts = i.options ? i.options.split(";;") : [];
          const read = {
            question:
              i.Question || i.question || i.questionText || i.questionTitle,
            options: opts,
            answer: i.Answer || i.answer,
            explanation: i.Explanation || i.explanation,
          };
          value.push(read);
        }

        console.log(`CSV parsed: ${value.length} questions found\n`);

        if (value.length === 0) {
          return res.status(400).json({
            message: "No valid questions found in CSV file",
            status: 400,
          });
        }
      } catch (csvError: any) {
        console.error("CSV Parsing Error:", csvError);
        return res.status(400).json({
          message: "Error parsing CSV file",
          status: 400,
          error: csvError.message,
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid file format. Please upload a CSV, DOC, or DOCX file",
        status: 400,
      });
    }

    // ============ VALIDATE ALL QUESTIONS ============
    console.log("\n=== VALIDATING QUESTIONS ===");
    const validationErrors: string[] = [];
    value.forEach((question, index) => {
      const validation = validateQuestion(question, index);
      if (!validation.valid) {
        validationErrors.push(...validation.errors);
        console.log(`Question ${index + 1}: INVALID`);
        console.log(validation.errors);
      } else {
        console.log(`Question ${index + 1}: VALID ✓`);
      }
    });

    if (validationErrors.length > 0) {
      console.log("\n=== VALIDATION FAILED ===");
      console.log(validationErrors);

      return res.status(400).json({
        message: "Validation errors found in quiz questions",
        status: 400,
        errors: validationErrors,
        parsingWarnings: parsingErrors,
        questionsAttempted: value.length,
        sampleQuestion: value.length > 0 ? value[0] : null,
      });
    }

    console.log("=== VALIDATION PASSED ===\n");

    // ============ CREATE QUIZ ============
    // const quizes = await quizModel.create({
    // const quizes = await examModel.create({
    //   subjectTitle: checkForSubject?.subjectTitle,
    //   subjectID: checkForSubject?._id,
    //   session: school?.presentSession,
    //   term: school?.presentTerm,
    //   quiz: {
    //     instruction: { duration, mark, instruction },
    //     question: value,
    //   },
    //   totalQuestions: value?.length,
    //   status: "examination",
    //   startExam: false,
    // });
    const quizes = await examModel.create({
      subjectTitle: checkForSubject?.subjectTitle,
      subjectID: checkForSubject?._id,
      session: school?.presentSession,
      term: school?.presentTerm,

      quiz: {
        instruction: { duration, mark, instruction },
        question: value,
        theory: "",
      },
      totalQuestions: value?.length,
      status: "examination",
      startExam: false,
    });

    // ============ UPDATE RELATIONSHIPS ============

    checkForSubject?.examination.push(new Types.ObjectId(quizes._id));
    checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
    await checkForSubject?.save();

    if (findTeacher) {
      findTeacher?.examination.push(new Types.ObjectId(quizes._id));
      await findTeacher?.save();
    }

    if (findSubjectTeacher) {
      findSubjectTeacher?.examination.push(new Types.ObjectId(quizes._id));
      await findSubjectTeacher?.save();
    }

    // ============ CLEAN UP UPLOADED FILE ============
    const cleanupFile = () => {
      try {
        if (uploadedPath && fs.existsSync(uploadedPath)) {
          fs.unlinkSync(uploadedPath);
          console.log("File cleaned up successfully");
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    };

    setTimeout(cleanupFile, 1000);

    console.log("=== QUIZ CREATED SUCCESSFULLY ===\n");

    return res.status(201).json({
      message: "Quiz entry successfully created from file",
      data: quizes,
      questionsImported: value.length,
      warnings: parsingErrors.length > 0 ? parsingErrors : undefined,
      status: 201,
    });
  } catch (error: any) {
    console.error("=== ERROR CREATING QUIZ ===");
    console.error(error);

    // Clean up file on error
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      try {
        fs.unlinkSync(uploadedPath);
        console.log("File cleaned up after error");
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    return res.status(500).json({
      message: "Error creating class subject quiz from file",
      status: 500,
      error: error.message,
    });
  }
};
