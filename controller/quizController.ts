import AdmZip from "adm-zip";
import { Request, Response } from "express";
import { Types } from "mongoose";
import classroomModel from "../model/classroomModel";
import staffModel from "../model/staffModel";
import subjectModel from "../model/subjectModel";
import quizModel from "../model/quizModel";
import studentModel from "../model/studentModel";
import csv from "csvtojson";
import { streamUpload, uploadDataUri } from "../utils/streamifier";
import lodash from "lodash";
import schoolModel from "../model/schoolModel";
import fs from "node:fs";
import path from "node:path";
import mammoth from "mammoth";
import * as cheerio from "cheerio";

// ──────────────────────────────────────────────────────────────
// Unicode helpers
// ──────────────────────────────────────────────────────────────
function toUnicodeSubscript(text: string): string {
  const map: Record<string, string> = {
    // Digits
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    // Operators
    "+": "₊",
    "-": "₋",
    "=": "₌",
    "(": "₍",
    ")": "₎",
    // Alphabet (Partial common set)
    a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
    n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
  };
  return text
    .split("")
    .map((c) => map[c.toLowerCase()] || c)
    .join("");
}

// helper to extract URLs from string
function extractUrlsFromText(text: string): string[] {
  // Match both http(s) and data URIs
  const urlRegex = /(https?:\/\/[^\s\)\]]+|data:[^\s\)\]]+)/g;
  const matches = Array.from((text || "").matchAll(urlRegex));
  return matches.map((m: any) => m[0]);
}

// Attempts to trim trailing garbage after common image extensions
function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  const extRegex =
    /(\.(?:png|jpe?g|gif|webp|svg|bmp|pdf|txt))(?:[?#][^\s\)\]]*)?/i;
  const match = url.match(extRegex);
  if (!match || match.index === undefined) return url;
  const endIndex = match.index + match[0].length;
  return url.slice(0, endIndex);
}

function toUnicodeSuperscript(text: string): string {
  const map: Record<string, string> = {
    // Digits
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    // Operators
    "+": "⁺",
    "-": "⁻",
    "=": "⁼",
    "(": "⁽",
    ")": "⁾",
    // Alphabet
    a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ",
    n: "ⁿ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
  };
  return text
    .split("")
    .map((c) => map[c.toLowerCase()] || c)
    .join("");
}

// ──────────────────────────────────────────────────────────────
// Extract DOCX → Text with perfect chemistry support
// ──────────────────────────────────────────────────────────────
async function extractRawTextFromDocx(filePath: string): Promise<string> {
  try {
    const zip = new AdmZip(filePath);
    const documentXml = zip.readAsText("word/document.xml");
    // Build a rels map rId -> target (e.g. media/image1.png)
    let relsXml = "";
    try {
      relsXml = zip.readAsText("word/_rels/document.xml.rels");
    } catch (e) {
      // No rels file, proceed without images
      relsXml = "";
    }
    const rels: Record<string, string> = {};
    if (relsXml) {
      const relRegex = /<Relationship[^>]*Id="([^\"]+)"[^>]*Target="([^\"]+)"/g;
      let rm: RegExpExecArray | null;
      while ((rm = relRegex.exec(relsXml)) !== null) {
        let tgt = rm[2];
        // Normalize possible '../' path prefixes
        if (tgt.startsWith("../")) tgt = tgt.replace(/^\.\.\//, "");
        rels[rm[1]] = tgt;
      }
    }
    let fullText = "";

    const paragraphs = documentXml.split(/<w:p[\s>]/);
    for (const para of paragraphs) {
      if (!para.trim()) continue;
      let paraText = processParagraph(para);

      // Find image references (r:embed or r:id) in the paragraph and upload
      // them to cloudinary, then append URLs in-line so downstream parsing
      // picks them up as images.
      const embeds = [...para.matchAll(/\br:(?:embed|id)="([^"]+)"/g)].map(
        (m) => m[1]
      );
      const imageUrls: string[] = [];
      for (const rId of embeds) {
        try {
          const target = rels[rId];
          if (!target) continue;
          const mediaPath = `word/${target}`;
          const fileBuff = zip.readFile(mediaPath as any) as Buffer;
          if (!fileBuff) continue;
          const ext = path.extname(mediaPath).replace(".", "").toLowerCase();
          const mimeMap: Record<string, string> = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            gif: "image/gif",
            svg: "image/svg+xml",
            webp: "image/webp",
            bmp: "image/bmp",
          };
          const mime = mimeMap[ext] || "application/octet-stream";
          const dataUri = `data:${mime};base64,${fileBuff.toString("base64")}`;
          // Upload to cloudinary (if configured) so clients can fetch by URL
          try {
            const uploadRes: any = await uploadDataUri(dataUri, "exams");
            if (uploadRes && uploadRes.secure_url) {
              imageUrls.push(uploadRes.secure_url);
            } else {
              // Fallback: use data URI directly
              imageUrls.push(dataUri);
            }
          } catch (uploadErr) {
            // Upload failed – include data URI as fallback
            imageUrls.push(dataUri);
          }
        } catch (ex: any) {
          // ignore particular image failures – continue parsing text
          console.warn(
            "Error handling embedded image for rId",
            rId,
            ex?.message || ex
          );
        }
      }
      if (imageUrls.length > 0) {
        // Append each URL as bracketed url to be picked up later
        paraText += " " + imageUrls.map((u) => `[${u}]`).join(" ");
      }
      if (paraText.trim()) fullText += paraText.trim() + "\n";
    }

    return fullText.replace(/\n\n\n+/g, "\n\n").trim();
  } catch (error: any) {
    console.error("Error creating exam:", error);
    throw error;
  }
}

function processParagraph(paraXml: string): string {
  const elements: { pos: number; content: string }[] = [];

  // Capture Runs, preserving their natural order
  const runRegex = /<w:r[\s>](.*?)<\/w:r>/gs;
  let match;
  while ((match = runRegex.exec(paraXml)) !== null) {
    const runXml = match[1];
    
    // Extract ALL text elements within the run
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let tMatch;
    let runText = "";
    while ((tMatch = textRegex.exec(runXml)) !== null) {
      runText += tMatch[1];
    }

    if (runText) {
      // Check for vertical alignment (subscript/superscript)
      if (runXml.includes('w:val="subscript"')) {
        elements.push({ pos: match.index, content: toUnicodeSubscript(runText) });
      } else if (runXml.includes('w:val="superscript"')) {
        elements.push({ pos: match.index, content: toUnicodeSuperscript(runText) });
      } else {
        elements.push({ pos: match.index, content: runText });
      }
    }
  }

  // Capture Math elements
  const mathRunRegex = /<m:oMath>(.*?)<\/m:oMath>/gs;
  while ((match = mathRunRegex.exec(paraXml)) !== null) {
    elements.push({ pos: match.index, content: processMathElement(match[1]) });
  }

  elements.sort((a, b) => a.pos - b.pos);
  return elements.map((e) => e.content).join("");
}

// ──────────────────────────────────────────────────────────────
// PERFECT CHEMISTRY MATH PROCESSOR (FINAL VERSION)
// ──────────────────────────────────────────────────────────────
function processMathElement(mathXml: string): string {
  const SUPER: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
    a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ",
    n: "ⁿ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
  };
  const SUB: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
    "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
    a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
    n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
  };

  const toSup = (s: string) =>
    s
      .split("")
      .map((c) => SUPER[c] || c)
      .join("");
  const toSub = (s: string) =>
    s
      .split("")
      .map((c) => SUB[c] || c)
      .join("");

  const isElementSymbol = (base: string) => /^[A-Z][a-z]?$/.test(base.trim());
  const nextRunStartsWithUpper = (index: number) => {
    const tail = mathXml.slice(index);
    const match = tail.match(/<m:r[^>]*>.*?<m:t[^>]*>([^<]*)<\/m:t>/s);
    if (!match) return false;
    const txt = (match[1] || "").trim();
    return /^[A-Z]/.test(txt);
  };

  const structures: { start: number; end: number; content: string }[] = [];
  const add = (s: { start: number; end: number; content: string }) => {
    if (structures.some((x) => !(s.end <= x.start || s.start >= x.end))) return;
    structures.push(s);
  };

  let m: RegExpExecArray | null;

  // 1. sSubSup → ²³⁵₉₂U (most important)
  const subSupRegex = /<m:sSubSup>(.*?)<\/m:sSubSup>/gs;
  while ((m = subSupRegex.exec(mathXml)) !== null) {
    const xml = m[1];
    const base = processMathElement(
      xml.match(/<m:e>(.*?)<\/m:e>/s)?.[1] || ""
    ).trim();
    const sub = processMathElement(
      xml.match(/<m:sub>(.*?)<\/m:sub>/s)?.[1] || ""
    ).trim();
    const sup = processMathElement(
      xml.match(/<m:sup>(.*?)<\/m:sup>/s)?.[1] || ""
    ).trim();

    const content = isElementSymbol(base)
      ? `${toSup(sup)}${toSub(sub)}${base}` // ²³⁵₉₂U → correct
      : `${base}${toSub(sub)}${toSup(sup)}`;

    add({ start: m.index, end: m.index + m[0].length, content });
  }

  // 2. Superscript only → ¹⁴C
  const supRegex = /<m:sSup>(.*?)<\/m:sSup>/gs;
  while ((m = supRegex.exec(mathXml)) !== null) {
    const xml = m[1];
    const base = processMathElement(
      xml.match(/<m:e>(.*?)<\/m:e>/s)?.[1] || ""
    ).trim();
    const sup = processMathElement(
      xml.match(/<m:sup>(.*?)<\/m:sup>/s)?.[1] || ""
    ).trim();

    const content =
      isElementSymbol(base) && /^\d+$/.test(sup.replace(/[^\d]/g, ""))
        ? `${toSup(sup)}${base}`
        : `${base}${toSup(sup)}`;

    add({ start: m.index, end: m.index + m[0].length, content });
  }

  // 3. Subscript only → ₄Be, ₆C (atomic number) or H₂ (stoichiometry)
  const subRegex = /<m:sSub>(.*?)<\/m:sSub>/gs;
  while ((m = subRegex.exec(mathXml)) !== null) {
    const xml = m[1];
    const base = processMathElement(
      xml.match(/<m:e>(.*?)<\/m:e>/s)?.[1] || ""
    ).trim();
    const sub = processMathElement(
      xml.match(/<m:sub>(.*?)<\/m:sub>/s)?.[1] || ""
    ).trim();

    let content = "";
    if (isElementSymbol(base) && /^\d+$/.test(sub)) {
      // If the math token *after* this structure begins with an uppercase
      // letter then it's likely stoichiometry (e.g., H₂O) — put the subscript
      // after the element. Otherwise, treat it as atomic number prefix.
      if (nextRunStartsWithUpper(m.index + m[0].length)) {
        content = `${base}${toSub(sub)}`; // H₂ (stoichiometry)
      } else {
        content = `${toSub(sub)}${base}`; // ₄Be (atomic number)
      }
    } else {
      content = `${base}${toSub(sub)}`;
    }

    add({ start: m.index, end: m.index + m[0].length, content });
  }

  // Fractions & radicals (unchanged)
  const fracRegex = /<m:f>(.*?)<\/m:f>/gs;
  while ((m = fracRegex.exec(mathXml)) !== null) {
    const num = processMathElement(
      m[1].match(/<m:num>(.*?)<\/m:num>/s)?.[1] || ""
    );
    const den = processMathElement(
      m[1].match(/<m:den>(.*?)<\/m:den>/s)?.[1] || ""
    );
    add({
      start: m.index,
      end: m.index + m[0].length,
      content: `(${num})/(${den})`,
    });
  }

  const radRegex = /<m:rad>(.*?)<\/m:rad>/gs;
  while ((m = radRegex.exec(mathXml)) !== null) {
    const deg = processMathElement(
      m[1].match(/<m:deg>(.*?)<\/m:deg>/s)?.[1] || ""
    ).trim();
    const base = processMathElement(
      m[1].match(/<m:e>(.*?)<\/m:e>/s)?.[1] || ""
    );
    const content =
      deg && deg !== "2" ? `${toSup(deg)}√(${base})` : `√(${base})`;
    add({ start: m.index, end: m.index + m[0].length, content });
  }

  // Final assembly
  structures.sort((a, b) => a.start - b.start);
  let pos = 0;
  let result = "";

  const runs: { start: number; content: string }[] = [];
  const runRegex = /<m:r>(.*?)<\/m:r>/gs;
  while ((m = runRegex.exec(mathXml)) !== null) {
    const text = (m[1].match(/<m:t[^>]*>([^<]*)<\/m:t>/g) || [])
      .map((t) => t.replace(/<[^>]*>/g, ""))
      .join("");
    if (text) runs.push({ start: m.index, content: text });
  }

  if (structures.length === 0) {
    result = runs.map((r) => r.content).join("");
  } else {
    for (const s of structures) {
      result += runs
        .filter((r) => r.start >= pos && r.start < s.start)
        .map((r) => r.content)
        .join("");
      result += s.content;
      pos = s.end;
    }
    result += runs
      .filter((r) => r.start >= pos)
      .map((r) => r.content)
      .join("");
  }

  return result.trim();
}

// Helpers: normalize unicode and safely strip leading numbering/option prefixes
const normalizeText = (s?: string) => {
  try {
    return s ? s.normalize("NFC") : s || "";
  } catch (err) {
    return s || "";
  }
};

const stripLeadingNumberFromHtml = (html: string) => {
  if (!html) return html;
  // parse as fragment, modify first text node if it starts with numbering like "1. "
  const $frag = cheerio.load(`<div>${html}</div>`, { xmlMode: false });
  const container = $frag("div");
  const firstTextNode = container
    .contents()
    .filter((i, el) => el.type === "text")[0] as any;
  if (firstTextNode && firstTextNode.data) {
    firstTextNode.data = firstTextNode.data.replace(/^\s*\d+\.\s*/u, "");
  }
  return container.html() || html;
};

const stripLeadingOptionLetter = (html: string) => {
  if (!html) return html;
  const $frag = cheerio.load(`<div>${html}</div>`, { xmlMode: false });
  const container = $frag("div");
  const firstTextNode = container
    .contents()
    .filter((i, el) => el.type === "text")[0] as any;
  if (firstTextNode && firstTextNode.data) {
    firstTextNode.data = firstTextNode.data.replace(/^\s*[A-D]\.\s*/u, "");
  }
  return container.html() || html;
};


// Test utility to debug DOCX parsing
// Run this separately to see what's being extracted

async function testDocxParsing(filePath: string) {
  console.log("\n🔍 Testing DOCX Parsing...\n");
  console.log("File:", filePath);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found:", filePath);
      return;
    }

    // Convert DOCX to HTML
    console.log("\n📄 Converting DOCX to HTML...");
    const result = await mammoth.convertToHtml(
      { path: filePath },
      { 
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true 
      }
    );
    
    const html = result.value || "";
    
    console.log("\n=== RAW HTML OUTPUT ===");
    console.log(html);
    console.log("=== END HTML ===\n");
    
    if (!html || html.trim() === "") {
      console.error("❌ HTML is empty!");
      return;
    }

    // Parse with Cheerio
    const $ = cheerio.load(html);
    const elems = $("body").children();
    
    console.log(`\n📊 Found ${elems.length} elements in body\n`);
    
    let value: any[] = [];
    let questionData: any = {};
    let options: string[] = [];

    console.log("=== PARSING ELEMENTS ===\n");
    
    elems.each((i, el) => {
      const rawText = $(el).text().trim();
      const normalizedText = normalizeText(rawText);
      const htmlContent = $(el).html()?.trim() || "";
      
      console.log(`[${i}] Element Type: ${(el as any).tagName}`);
      console.log(`    Raw Text: "${rawText}"`);
      console.log(`    Normalized: "${normalizedText}"`);
      console.log(`    HTML: "${htmlContent.substring(0, 100)}..."`);
      
      if (!normalizedText) {
        console.log("    ⚠️ Skipped (empty)");
        return;
      }

      // Test question pattern
      const questionMatch = /^\d+[\.\)]/u.test(normalizedText);
      console.log(`    Question pattern match: ${questionMatch}`);
      
      if (questionMatch) {
        // Save previous question
        if (Object.keys(questionData).length > 0) {
          questionData.options = options;
          value.push(questionData);
          console.log(`    ✅ Saved previous question (${options.length} options)`);
          questionData = {};
          options = [];
        }

        const cleanHtml = stripLeadingNumberFromHtml(htmlContent);
        questionData = { question: cleanHtml };
        console.log(`    ✅ NEW QUESTION: "${cleanHtml}"`);
      }
      
      // Test option pattern
      const optionMatch = /^[A-D][\.\)]/u.test(normalizedText);
      console.log(`    Option pattern match: ${optionMatch}`);
      
      if (optionMatch) {
        const cleanOption = stripLeadingOptionLetter(htmlContent);
        options.push(cleanOption);
        console.log(`    ✅ OPTION: "${cleanOption}"`);
      }
      
      // Test answer pattern
      const answerMatch = /^Answer:/i.test(normalizedText);
      console.log(`    Answer pattern match: ${answerMatch}`);
      
      if (answerMatch) {
        const answerText = normalizedText.replace(/^Answer:\s*/i, "").trim();
        questionData.answer = answerText;
        console.log(`    ✅ ANSWER: "${answerText}"`);
      }
      
      // Test explanation pattern
      const explanationMatch = /^Explanation:/i.test(normalizedText);
      console.log(`    Explanation pattern match: ${explanationMatch}`);
      
      if (explanationMatch) {
        const explanationText = normalizedText.replace(/^Explanation:\s*/i, "").trim();
        questionData.explanation = explanationText;
        console.log(`    ✅ EXPLANATION: "${explanationText}"`);
      }
    });

    // Save last question
    if (Object.keys(questionData).length > 0) {
      questionData.options = options;
      value.push(questionData);
    }

    console.log("\n\n=== FINAL PARSED QUESTIONS ===\n");
    console.log(JSON.stringify(value, null, 2));
    console.log("\n=== END ===\n");
    
    console.log(`\n✅ Successfully parsed ${value.length} questions`);
    
    // Validation
    console.log("\n📋 Validation Results:\n");
    value.forEach((q, i) => {
      console.log(`Question ${i + 1}:`);
      console.log(`  - Has question text: ${!!q.question && q.question !== ""}`);
      console.log(`  - Options count: ${q.options?.length || 0}`);
      console.log(`  - Has answer: ${!!q.answer && q.answer !== ""}`);
      console.log(`  - Has explanation: ${!!q.explanation && q.explanation !== ""}`);
    });
    
    return value;
    
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
  }
}

// Usage:
// Place your test file in the same directory or provide full path
const testFilePath = path.join(__dirname, "MathTest.docx");

testDocxParsing(testFilePath)
  .then(() => console.log("\n✅ Test completed"))
  .catch(err => console.error("\n❌ Test failed:", err));

// Or export to use in your route for testing
export { testDocxParsing };

// Validation function
const validateQuestion = (question: any, index: number): { valid: boolean; errors: string[] } => {
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
        errors.push(`Question ${index + 1}, Option ${String.fromCharCode(65 + i)}: Empty option`);
      }
    });
  }
  
  if (!question.answer || question.answer.trim() === "") {
    errors.push(`Question ${index + 1}: Missing answer`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Image URL validation
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

export const createSubjectQuizFromFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let uploadedPath: string | undefined;
  
  try {
    const { classID, subjectID } = req.params;
    const { instruction, duration, mark } = req.body;
       console.log("found docx!!!!");
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

    const findTeacher = await staffModel.findById(classRoom?.teacherID);
    const findSubjectTeacher = await staffModel.findById(
      checkForSubject?.teacherID
    );
    const school = await schoolModel.findById(findTeacher?.schoolIDs);

    uploadedPath = req?.file?.path;
    if (!uploadedPath) {
      return res.status(400).json({
        message: "No upload file provided",
        status: 400,
      });
    }

    const originalName = req?.file?.originalname || uploadedPath;
    const ext = path.extname(originalName).toLowerCase();

    let value: any[] = [];
    const parsingErrors: string[] = [];
    const debugInfo: any[] = []; // For debugging

    if (ext === ".doc" || ext === ".docx") {
      console.log("found docx");

      try {
        // Direct XML parsing for high-fidelity scientific/math support
        const rawText = await extractRawTextFromDocx(uploadedPath!);
        
        // Virtual Splitting for merged lines
        let splitText = rawText;
        splitText = splitText.replace(/(\S)\s*([A-D][\.\)]\s+)/g, "$1\n$2");
        // Split only if NOT preceded by symbols common in chemical formulas like (C=12, O=16)
        splitText = splitText.replace(/([^,(=])\s*(\b\d+[\.\)]\s+)/g, "$1\n$2");
        splitText = splitText.replace(/(\S)\s*(Answer:\s*)/gi, "$1\n$2");
        splitText = splitText.replace(/(\S)\s*(Explanation:\s*)/gi, "$1\n$2");

        const lines = splitText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        let questionData: any = {};
        let options: string[] = [];
        const BRACKET_URL_REGEX = /\[([^\]]+)\]/;

        console.log("=== PARSING LINES ===");
        
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          console.log(`Line ${i}: "${line.substring(0, 80)}..."`);
          
          if (/^\d+[\.\)]/.test(line)) {
            // Save previous question
            if (Object.keys(questionData).length > 0) {
              questionData.options = options;
              debugInfo.push({ ...questionData, optionsCount: options.length });
              value.push(questionData);
              questionData = {};
              options = [];
            }
            const match = line.match(BRACKET_URL_REGEX);
            let url = match ? match[1].trim() : null;
            if (!url) {
              const extracted = extractUrlsFromText(line);
              if (extracted.length) url = sanitizeUrl(extracted[0]);
            }
            line = line.replace(BRACKET_URL_REGEX, "").trim();
            questionData = { question: line.replace(/^\d+[\.\)]\s*/, "") };
            if (url) {
              url = sanitizeUrl(url);
              questionData.images = [url];
              questionData.url = url;
            }
          } else if (/^[A-D][\.\)]/.test(line)) {
            options.push(line.replace(/^[A-D][\.\)]\s*/, "").trim());
          } else if (/^Answer:/i.test(line)) {
            questionData.answer = line.replace(/^Answer:\s*/i, "").trim();
          } else if (/^Explanation:/i.test(line)) {
            questionData.explanation = line.replace(/^Explanation:\s*/i, "").trim();
          } else if (questionData && !questionData.options && Object.keys(questionData).length > 0) {
            // Continuation of question
            const match = line.match(BRACKET_URL_REGEX);
            let url = match ? match[1].trim() : null;
            if (!url) {
              const extracted = extractUrlsFromText(line);
              if (extracted.length) url = sanitizeUrl(extracted[0]);
            }
            line = line.replace(BRACKET_URL_REGEX, "").trim();
            questionData.question = `${questionData.question} ${line}`.trim();
            if (url) {
              url = sanitizeUrl(url);
              if (!questionData.images) questionData.images = [];
              questionData.images.push(url);
              if (!questionData.url) questionData.url = url;
            }
          }
        }

        // Save last question
        if (Object.keys(questionData).length > 0) {
          questionData.options = options;
          debugInfo.push({ ...questionData, optionsCount: options.length });
          value.push(questionData);
        }

        console.log("=== PARSED QUESTIONS ===");
        console.log(JSON.stringify(debugInfo, null, 2));
        console.log("=== END PARSING ===");

        if (value.length === 0) {
          return res.status(400).json({
            message: "No valid questions found in the document. Please check the format.",
            status: 400,
            hint: "Expected format: '1. Question text', 'A. Option', 'B. Option', etc., 'Answer: ...'",
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
    } else if (ext === ".csv") {
      try {
        const data = await csv().fromFile(uploadedPath);
        
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

        if (value.length === 0) {
          return res.status(400).json({
            message: "No valid questions found in CSV file",
            status: 400,
          });
        }

      } catch (csvError: any) {
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

    // Validate all questions
    const validationErrors: string[] = [];
    value.forEach((question, index) => {
      const validation = validateQuestion(question, index);
      if (!validation.valid) {
        validationErrors.push(...validation.errors);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation errors found in quiz questions",
        status: 400,
        errors: validationErrors,
        parsingWarnings: parsingErrors,
        debugData: debugInfo,
      });
    }

    // Create quiz
    const quizes = await quizModel.create({
      subjectTitle: checkForSubject?.subjectTitle,
      subjectID: checkForSubject?._id,
      session: school?.presentSession,
      term: school?.presentTerm,
      quiz: {
        instruction: { duration, mark, instruction },
        question: value,
      },
      totalQuestions: value?.length,
      status: "quiz",
      startExam: false,
    });

    // Update relationships
    checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
    checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
    await checkForSubject?.save();

    if (findTeacher) {
      findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
      await findTeacher?.save();
    }

    if (findSubjectTeacher) {
      findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
      await findSubjectTeacher?.save();
    }

    // Clean up uploaded file after successful processing
    const cleanupFile = () => {
      try {
        if (uploadedPath && fs.existsSync(uploadedPath)) {
          fs.unlinkSync(uploadedPath);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    };

    // Cleanup immediately after processing
    setTimeout(cleanupFile, 1000);

    return res.status(201).json({
      message: "Quiz entry successfully created from file",
      data: quizes,
      questionsImported: value.length,
      warnings: parsingErrors.length > 0 ? parsingErrors : undefined,
      status: 201,
    });

  } catch (error: any) {
    console.error("Error creating quiz:", error);
    
    // Clean up file on error
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      try {
        fs.unlinkSync(uploadedPath);
      } catch (cleanupError) {
        console.error("Error cleaning up file on error:", cleanupError);
      }
    }

    return res.status(500).json({
      message: "Error creating class subject quiz from file",
      status: 500,
      error: error.message,
    });
  }
};


// Examination


export const createSubjectExam = async (
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

    const findTeacher = await staffModel.findById(classRoom?.teacherID);
    const findSubjectTeacher = await staffModel.findById(
      checkForSubject?.teacherID
    );
    const school = await schoolModel.findById(findTeacher?.schoolIDs);

    const originalName = req.file.originalname || uploadedPath;
    const ext = path.extname(originalName).toLowerCase();

    let value: any[] = [];
    const parsingErrors: string[] = [];

    if (ext === ".doc" || ext === ".docx") {
      try {
        console.log("\n=== EXTRACTING RAW TEXT FROM DOCX (preserves LaTeX) ===");
        
        // Extract raw text to preserve LaTeX expressions
        const rawText = await extractRawTextFromDocx(uploadedPath!);
        
        console.log("Raw text preview:");
        console.log(rawText.substring(0, 500));
        console.log("\nRaw text length:", rawText.length);
        
        if (!rawText || rawText.trim() === "") {
          return res.status(400).json({
            message: "The uploaded file appears to be empty or could not be read",
            status: 400,
          });
        }

        // Virtual Splitting for merged lines
        let splitText = rawText;
        splitText = splitText.replace(/(\S)\s*([A-D][\.\)]\s+)/g, "$1\n$2");
        // Split only if NOT preceded by symbols common in chemical formulas like (C=12, O=16)
        splitText = splitText.replace(/([^,(=])\s*(\b\d+[\.\)]\s+)/g, "$1\n$2");
        splitText = splitText.replace(/(\S)\s*(Answer:\s*)/gi, "$1\n$2");
        splitText = splitText.replace(/(\S)\s*(Explanation:\s*)/gi, "$1\n$2");

        // Split by lines and process
        const lines = splitText.split('\n').map(line => line.trim()).filter(line => line);
        
        console.log(`\nFound ${lines.length} lines to parse\n`);
        
        let questionData: any = {};
        let options: string[] = [];
        const BRACKET_URL_REGEX = /\[([^\]]+)\]/;

        console.log("=== PARSING LINES ===");

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          
          console.log(`\nLine ${i}: "${line.substring(0, 80)}..."`);
          
          if (!line) {
            console.log("  -> Skipped (empty)");
            continue;
          }

          // Detect new question (starts with number)
          if (/^\d+[\.\)]/.test(line)) {
            console.log("  -> Detected QUESTION");
            
            // Save previous question if present
            if (Object.keys(questionData).length > 0) {
              questionData.options = options;
              value.push(questionData);
              console.log(`  -> Saved previous question (${options.length} options)`);
              questionData = {};
              options = [];
            }

            const match = line.match(BRACKET_URL_REGEX);
            let url = match ? match[1].trim() : null;
            if (!url) {
              const extracted = extractUrlsFromText(line);
              if (extracted.length) url = sanitizeUrl(extracted[0]);
            }
            line = line.replace(BRACKET_URL_REGEX, "").trim();
            questionData = { question: line.replace(/^\d+[\.\)]\s*/, "") };
            if (url) {
              url = sanitizeUrl(url);
              questionData.images = [url];
              questionData.url = url;
            }
          } else if (/^[A-D][\.\)]/.test(line)) {
            options.push(line.replace(/^[A-D][\.\)]\s*/, "").trim());
            console.log(`  -> Detected OPTION: "${line}"`);
          } else if (/^Answer:/i.test(line)) {
            const answerText = line.replace(/^Answer:\s*/i, "").trim();
            questionData.answer = answerText;
            console.log(`  -> Detected ANSWER: "${answerText}"`);
          } else if (/^Explanation:/i.test(line)) {
            const explanationText = line.replace(/^Explanation:\s*/i, "").trim();
            questionData.explanation = explanationText;
            console.log(`  -> Detected EXPLANATION: "${explanationText.substring(0, 50)}..."`);
          } else if (questionData && !questionData.options && Object.keys(questionData).length > 0) {
            // Continuation of question
            const match = line.match(BRACKET_URL_REGEX);
            let url = match ? match[1].trim() : null;
            if (!url) {
              const extracted = extractUrlsFromText(line);
              if (extracted.length) url = sanitizeUrl(extracted[0]);
            }
            line = line.replace(BRACKET_URL_REGEX, "").trim();
            questionData.question = `${questionData.question} ${line}`.trim();
            if (url) {
              url = sanitizeUrl(url);
              if (!questionData.images) questionData.images = [];
              questionData.images.push(url);
              if (!questionData.url) questionData.url = url;
            }
          }
        }

        // Save last question if present
        if (Object.keys(questionData).length > 0) {
          questionData.options = options;
          value.push(questionData);
          console.log(`\nSaved last question (${options.length} options)`);
        }

        console.log(`\n=== PARSING COMPLETE: ${value.length} questions found ===`);

        if (value.length === 0) {
          return res.status(400).json({
            message: "No valid questions found in the document. Please check the format.",
            status: 400,
            hint: "Expected format: '1. Question text', 'A. Option', 'B. Option', etc., 'Answer: ...'",
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
    } else if (ext === ".csv") {
      try {
        console.log("\n=== PARSING CSV FILE ===");
        const data = await csv().fromFile(uploadedPath!);
        
        for (const i of data) {
          const opts = i.options ? i.options.split(";;") : [];
          const read = {
            question: i.Question || i.question || i.questionText || i.questionTitle,
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

    // Validate all questions
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

    // Create quiz
    const quizes = await quizModel.create({
      subjectTitle: checkForSubject?.subjectTitle,
      subjectID: checkForSubject?._id,
      session: school?.presentSession,
      term: school?.presentTerm,
      quiz: {
        instruction: { duration, mark, instruction },
        question: value,
      },
      totalQuestions: value?.length,
      status: "quiz",
      startExam: false,
    });

    // Update relationships
    checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
    checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
    await checkForSubject?.save();

    if (findTeacher) {
      findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
      await findTeacher?.save();
    }

    if (findSubjectTeacher) {
      findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
      await findSubjectTeacher?.save();
    }

    // Clean up uploaded file
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

// export const createSubjectExam = async (
//   req: any,
//   res: Response
// ): Promise<Response> => {
//   let uploadedPath: string | undefined;
  
//   try {
//     const { classID, subjectID } = req.params;
//     const { instruction, duration, mark } = req.body;

//     console.log("=== QUIZ UPLOAD REQUEST ===");
//     console.log("Class ID:", classID);
//     console.log("Subject ID:", subjectID);
//     console.log("Body:", req.body);
//     console.log("File:", req.file);
    
//     // Validate required parameters
//     if (!classID || !subjectID) {
//       return res.status(400).json({
//         message: "Missing required parameters: classID and subjectID",
//         status: 400,
//       });
//     }
    
//     if (!duration || !mark) {
//       return res.status(400).json({
//         message: "Missing required fields: duration and mark",
//         status: 400,
//       });
//     }

//     // Check if file was uploaded
//     if (!req.file) {
//       return res.status(400).json({
//         message: "No file uploaded. Please select a file.",
//         status: 400,
//       });
//     }

//     uploadedPath = req.file.path;
//     console.log("File uploaded to:", uploadedPath);

//     // Verify file exists
//     if (!fs.existsSync(uploadedPath!)) {
//       return res.status(400).json({
//         message: "Uploaded file not found on server",
//         status: 400,
//       });
//     }

//     const fileStats = fs.statSync(uploadedPath!);
//     console.log("File size:", fileStats.size, "bytes");

//     if (fileStats.size === 0) {
//       return res.status(400).json({
//         message: "Uploaded file is empty",
//         status: 400,
//       });
//     }

//     const classRoom = await classroomModel.findById(classID);
//     if (!classRoom) {
//       return res.status(404).json({
//         message: "Classroom not found",
//         status: 404,
//       });
//     }

//     const checkForSubject = await subjectModel.findById(subjectID);
//     if (!checkForSubject) {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }

//     const findTeacher = await staffModel.findById(classRoom?.teacherID);
//     const findSubjectTeacher = await staffModel.findById(
//       checkForSubject?.teacherID
//     );
//     const school = await schoolModel.findById(findTeacher?.schoolIDs);

//     const originalName = req.file.originalname || uploadedPath;
//     const ext = path.extname(originalName).toLowerCase();

//     let value: any[] = [];
//     const parsingErrors: string[] = [];

//     if (ext === ".doc" || ext === ".docx") {
//       try {
//         console.log("\n=== CONVERTING DOCX TO HTML ===");
        
//         // Convert Word docx to HTML to preserve images and markup
//         const result = await mammoth.convertToHtml(
//           { path: uploadedPath as string },
//           { includeEmbeddedStyleMap: true }
//         );
        
//         const html = result.value || "";
        
//         console.log("HTML Output Preview:");
//         console.log(html.substring(0, 500));
//         console.log("HTML Length:", html.length);
        
//         if (!html || html.trim() === "") {
//           return res.status(400).json({
//             message: "The uploaded file appears to be empty or could not be converted",
//             status: 400,
//           });
//         }

//         const $ = cheerio.load(html);
//         const elems = $("body").children();
        
//         console.log(`\nFound ${elems.length} elements to parse`);
        
//         let questionData: any = {};
//         let options: string[] = [];
//         const BRACKET_URL_REGEX = /\[([^\]]+)\]/;

//         console.log("\n=== PARSING ELEMENTS ===");

//         elems.each((i, el) => {
//           // Use normalized text for pattern matching but keep HTML for storage
//           const rawText = normalizeText($(el).text().trim());
//           const htmlContent = $(el).html()?.trim() || "";
          
//           console.log(`\nElement ${i}: "${rawText.substring(0, 50)}..."`);
          
//           if (!rawText) {
//             console.log("  -> Skipped (empty)");
//             return; // skip empty blocks
//           }

//           // Detect new question (starts with number)
//           if (/^\d+[\.\)]/u.test(rawText)) {
//             console.log("  -> Detected QUESTION");
            
//             // Save previous question if present
//             if (Object.keys(questionData).length) {
//               questionData.options = options;
//               value.push(questionData);
//               console.log(`  -> Saved previous question (${options.length} options)`);
//               questionData = {};
//               options = [];
//             }

//             // Extract bracketed image URL if present
//             const match = rawText.match(BRACKET_URL_REGEX);
//             const url = match ? match[1].trim() : null;

//             // Store the HTML fragment for the question body
//             let cleanHtml = stripLeadingNumberFromHtml(htmlContent);
//             if (url) {
//               cleanHtml = cleanHtml.replace(BRACKET_URL_REGEX, "").trim();
//             }

//             console.log(`  -> Question HTML: "${cleanHtml.substring(0, 100)}..."`);

//             questionData = { question: cleanHtml };
            
//             if (url) {
//               if (isValidUrl(url)) {
//                 questionData.images = [url];
//                 console.log(`  -> Added image: ${url}`);
//               } else {
//                 parsingErrors.push(`Invalid image URL: ${url}`);
//                 console.log(`  -> Invalid URL: ${url}`);
//               }
//             }
//           } 
//           // Detect options (A. B. C. D.)
//           else if (/^[A-D][\.\)]/u.test(rawText)) {
//             const cleanOption = stripLeadingOptionLetter(htmlContent);
//             options.push(cleanOption);
//             console.log(`  -> Detected OPTION: "${cleanOption.substring(0, 50)}..."`);
//           } 
//           // Detect answer
//           else if (/^Answer:/i.test(rawText)) {
//             const answerText = normalizeText(rawText.replace(/^Answer:\s*/i, "").trim());
//             questionData.answer = answerText;
//             console.log(`  -> Detected ANSWER: "${answerText}"`);
//           } 
//           // Detect explanation
//           else if (/^Explanation:/i.test(rawText)) {
//             const explanationText = normalizeText(rawText.replace(/^Explanation:\s*/i, "").trim());
//             questionData.explanation = explanationText;
//             console.log(`  -> Detected EXPLANATION: "${explanationText.substring(0, 50)}..."`);
//           } 
//           // Continuation line
//           else {
//             if (questionData.question && options.length === 0) {
//               console.log("  -> Continuation of question");
//               questionData.question += `<br/>${htmlContent}`;

//               // Check for bracketed URLs in continuation text
//               const match = rawText.match(BRACKET_URL_REGEX);
//               const url = match ? match[1].trim() : null;
//               if (url) {
//                 if (isValidUrl(url)) {
//                   if (!questionData.images) questionData.images = [];
//                   questionData.images.push(url);
//                   questionData.question = questionData.question.replace(BRACKET_URL_REGEX, "");
//                   console.log(`  -> Added continuation image: ${url}`);
//                 } else {
//                   parsingErrors.push(`Invalid image URL: ${url}`);
//                 }
//               }
//             } else {
//               console.log("  -> Ignored (no active question)");
//             }
//           }
//         });

//         // Push last question if present
//         if (Object.keys(questionData).length) {
//           questionData.options = options;
//           value.push(questionData);
//           console.log(`\nSaved last question (${options.length} options)`);
//         }

//         console.log(`\n=== PARSING COMPLETE: ${value.length} questions found ===\n`);

//         if (value.length === 0) {
//           return res.status(400).json({
//             message: "No valid questions found in the document. Please check the format.",
//             status: 400,
//             hint: "Expected format: '1. Question text', 'A. Option', 'B. Option', etc., 'Answer: ...'",
//             htmlPreview: html.substring(0, 500),
//           });
//         }

//       } catch (docError: any) {
//         console.error("DOCX Parsing Error:", docError);
//         return res.status(400).json({
//           message: "Error parsing DOCX file",
//           status: 400,
//           error: docError.message,
//         });
//       }
//     } else if (ext === ".csv") {
//       try {
//         console.log("\n=== PARSING CSV FILE ===");
//         const data = await csv().fromFile(uploadedPath!);
        
//         for (const i of data) {
//           const opts = i.options ? i.options.split(";;") : [];
//           const read = {
//             question: i.Question || i.question || i.questionText || i.questionTitle,
//             options: opts,
//             answer: i.Answer || i.answer,
//             explanation: i.Explanation || i.explanation,
//           };
//           value.push(read);
//         }

//         console.log(`CSV parsed: ${value.length} questions found\n`);

//         if (value.length === 0) {
//           return res.status(400).json({
//             message: "No valid questions found in CSV file",
//             status: 400,
//           });
//         }

//       } catch (csvError: any) {
//         console.error("CSV Parsing Error:", csvError);
//         return res.status(400).json({
//           message: "Error parsing CSV file",
//           status: 400,
//           error: csvError.message,
//         });
//       }
//     } else {
//       return res.status(400).json({
//         message: "Invalid file format. Please upload a CSV, DOC, or DOCX file",
//         status: 400,
//       });
//     }

//     // Validate all questions
//     console.log("=== VALIDATING QUESTIONS ===");
//     const validationErrors: string[] = [];
//     value.forEach((question, index) => {
//       const validation = validateQuestion(question, index);
//       if (!validation.valid) {
//         validationErrors.push(...validation.errors);
//         console.log(`Question ${index + 1}: INVALID`);
//         console.log(validation.errors);
//       } else {
//         console.log(`Question ${index + 1}: VALID ✓`);
//       }
//     });

//     if (validationErrors.length > 0) {
//       console.log("\n=== VALIDATION FAILED ===");
//       console.log(validationErrors);
      
//       return res.status(400).json({
//         message: "Validation errors found in quiz questions",
//         status: 400,
//         errors: validationErrors,
//         parsingWarnings: parsingErrors,
//         questionsAttempted: value.length,
//       });
//     }

//     console.log("=== VALIDATION PASSED ===\n");

//     // Create quiz
//     const quizes = await quizModel.create({
//       subjectTitle: checkForSubject?.subjectTitle,
//       subjectID: checkForSubject?._id,
//       session: school?.presentSession,
//       term: school?.presentTerm,
//       quiz: {
//         instruction: { duration, mark, instruction },
//         question: value,
//       },
//       totalQuestions: value?.length,
//       status: "quiz",
//       startExam: false,
//     });

//     // Update relationships
//     checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
//     checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
//     await checkForSubject?.save();

//     if (findTeacher) {
//       findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       await findTeacher?.save();
//     }

//     if (findSubjectTeacher) {
//       findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       await findSubjectTeacher?.save();
//     }

//     // Clean up uploaded file
//     const cleanupFile = () => {
//       try {
//         if (uploadedPath && fs.existsSync(uploadedPath)) {
//           fs.unlinkSync(uploadedPath);
//           console.log("File cleaned up successfully");
//         }
//       } catch (cleanupError) {
//         console.error("Error cleaning up file:", cleanupError);
//       }
//     };

//     // Cleanup after 1 second
//     setTimeout(cleanupFile, 1000);

//     console.log("=== QUIZ CREATED SUCCESSFULLY ===\n");

//     return res.status(201).json({
//       message: "Quiz entry successfully created from file",
//       data: quizes,
//       questionsImported: value.length,
//       warnings: parsingErrors.length > 0 ? parsingErrors : undefined,
//       status: 201,
//     });

//   } catch (error: any) {
//     console.error("=== ERROR CREATING QUIZ ===");
//     console.error(error);
    
//     // Clean up file on error
//     if (uploadedPath && fs.existsSync(uploadedPath)) {
//       try {
//         fs.unlinkSync(uploadedPath);
//         console.log("File cleaned up after error");
//       } catch (cleanupError) {
//         console.error("Error cleaning up file:", cleanupError);
//       }
//     }

//     return res.status(500).json({
//       message: "Error creating class subject quiz from file",
//       status: 500,
//       error: error.message,
//     });
//   }
// };


// export const createSubjectExam = async (
//   req: any,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { classID, subjectID } = req.params;
//     const { instruction, duration, mark } = req.body;

//     const classRoom = await classroomModel.findById(classID);

//     const checkForSubject = await subjectModel.findById(subjectID);

//     const findTeacher = await staffModel.findById(checkForSubject?.teacherID);

//     const findSubjectTeacher = await staffModel.findById(
//       checkForSubject?.teacherID
//     );

//     const school = await schoolModel.findById(findTeacher?.schoolIDs);

//     // const { secure_url, public_id }: any = await streamUpload(req);

//     const uploadedPath = req?.file?.path;
//     if (!uploadedPath) {
//       return res.status(400).json({
//         message: "No upload file provided",
//         status: 400,
//       });
//     }

//     const originalName = req?.file?.originalname || uploadedPath;
//     const ext = path.extname(originalName).toLowerCase();

//     let value: any = [];

//     if (ext === ".doc" || ext === ".docx") {
//       // Convert Word docx to HTML to preserve images and markup.
//       // We preserve the HTML for each paragraph and only strip harmless numbering
//       // prefixes so frontend can render rich content (including special scientific characters).
//       const result = await mammoth.convertToHtml({ path: uploadedPath }, { includeEmbeddedStyleMap: true });
//       const html = result.value || "";
//       const $ = cheerio.load(html);

//       // We iterate over body children to preserve ordering (paragraphs, headings, list items)
//       const elems = $("body").children();
//       let questionData: any = {};
//       let options: string[] = [];
//       const BRACKET_URL_REGEX = /\[([^\]]+)\]/;

//       elems.each((i, el) => {
//         // Use normalized text for pattern matching but keep HTML for storage
//         const rawText = normalizeText($(el).text().trim());
//         const htmlContent = $(el).html()?.trim() || "";
//         if (!rawText) return; // skip empty blocks

//         if (/^\d+\./u.test(rawText)) {
//           // New question detected. Save previous question if present.
//           if (Object.keys(questionData).length) {
//             questionData.options = options;
//             value.push(questionData);
//             questionData = {};
//             options = [];
//           }

//           // Extract bracketed image URL if present in the text
//           const match = rawText.match(BRACKET_URL_REGEX);
//           const url = match ? match[1].trim() : null;

//           // Prefer storing the HTML fragment for the question body so special characters
//           // (Greek letters, scientific symbols, math-as-text) are preserved.
//           // Remove only the leading numbering from the first text node to avoid breaking tags.
//           let cleanHtml = stripLeadingNumberFromHtml(htmlContent);
//           if (url) {
//             // remove the [url] token from the HTML fragment too
//             cleanHtml = cleanHtml.replace(BRACKET_URL_REGEX, "").trim();
//           }

//           questionData = { question: cleanHtml };
//           if (url) questionData.images = [url];
//         } else if (/^[A-D]\./u.test(rawText)) {
//           // Option line — store option HTML but strip leading "A. " label from first text node
//           options.push(stripLeadingOptionLetter(htmlContent));
//         } else if (rawText.startsWith("Answer:")) {
//           questionData.answer = normalizeText(rawText.replace("Answer:", "").trim());
//         } else if (rawText.startsWith("Explanation:")) {
//           questionData.explanation = normalizeText(rawText.replace("Explanation:", "").trim());
//         } else {
//           // Continuation line — if we have a current question and no options yet, append
//           if (questionData.question && options.length === 0) {
//             questionData.question += `<br/>${htmlContent}`;

//             // check for bracketed URLs in continuation text
//             const match = rawText.match(BRACKET_URL_REGEX);
//             const url = match ? match[1].trim() : null;
//             if (url) {
//               if (!questionData.images) questionData.images = [];
//               questionData.images.push(url);
//               // remove bracketed token from the question HTML
//               questionData.question = questionData.question.replace(BRACKET_URL_REGEX, "");
//             }
//           }
//         }
//       });

//       // push last question if present
//       if (Object.keys(questionData).length) {
//         questionData.options = options;
//         value.push(questionData);
//       }
//     } else {
//       // CSV handling
//       let data = await csv().fromFile(req?.file?.path);
//       for (let i of data) {
//         i.options?.split(";;");
//         let read = { ...i, options: i.options?.split(";;") };
//         value.push(read);
//       }
//     }

//     let term = lodash.find(value, { term: school?.presentTerm });
//     let session = lodash.find(value, { session: school?.presentSession });

//     let filePath = path.join(__dirname, "uploads");

//     const deleteFilesInFolder = (folderPath: any) => {
//       if (fs.existsSync(folderPath)) {
//         const files = fs.readdirSync(folderPath);

//         files.forEach((file) => {
//           const filePath = path.join(folderPath, file);
//           fs.unlinkSync(filePath);
//         });

//         console.log(
//           `All files in the folder '${folderPath}' have been deleted.`
//         );
//       } else {
//         console.log(`The folder '${folderPath}' does not exist.`);
//       }
//     };

//     if (checkForSubject) {
//       const quizes = await quizModel.create({
//         subjectTitle: checkForSubject?.subjectTitle,
//         subjectID: checkForSubject?._id,
//         session: school?.presentSession,
//         term: school?.presentTerm,
//         quiz: {
//           instruction: { duration, mark, instruction },
//           question: value,
//         },
//         totalQuestions: value?.length,
//         status: "examination",
//         startExam: false,
//       });

//       checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));

//       checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));

//       checkForSubject?.save();

//       findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       findTeacher?.save();

//       findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       findSubjectTeacher?.save();

//       // await deleteFilesInFolder(filePath);

//       return res.status(201).json({
//         message: "exam entry successfully",
//         data: quizes,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject quiz",
//       status: 404,
//       error: error,
//       data: error?.message,
//     });
//   }
// };

// export const createSubjectExam = async (
//   req: any,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { classID, subjectID } = req.params;
//     const { theory, instruction, duration, mark, randomize } = req.body;
//     let filePath = path.join(__dirname, "../uploads/examination");

//     const classRoom = await classroomModel.findById(classID);

//     const checkForSubject = await subjectModel.findById(subjectID);

//     // teacher assigned to the class
//     const findTeacher = await staffModel.findById(classRoom?.teacherID);

//     // teacher assigned specifically to the subject (teacherID stored on subject)
//     const findSubjectTeacher = await staffModel.findById(
//       checkForSubject?.teacherID
//     );

//     const school = await schoolModel.findById(findTeacher?.schoolIDs);

//     // const { secure_url, public_id }: any = await streamUpload(req);

//     const uploadedPath = req?.file?.path;
//     if (!uploadedPath) {
//       return res.status(400).json({
//         message: "No upload file provided",
//         status: 400,
//       });
//     }

//     const originalName = req?.file?.originalname || uploadedPath;
//     const ext = path.extname(originalName).toLowerCase();

//     let value: any[] = [];

//     if (ext === ".doc" || ext === ".docx") {
//       // Convert Word docx to HTML to preserve images and markup
//       const result = await mammoth.convertToHtml(
//         { path: uploadedPath },
//         { includeEmbeddedStyleMap: true }
//       );
//       const html = result.value || "";
//       const $ = Cheerio.load(html);

//       // split by paragraphs and headings to get question blocks
//       const blocks: string[] = [];
//       const elems: any[] = $("p, h1, h2, h3, li").toArray();
//       for (const el of elems as any[]) {
//         const text = $(el as any)
//           .text()
//           .trim();
//         if (text) blocks.push(text);
//       }

//       // collect images mapped by their surrounding block index
//       const imagesByIndex: Record<number, string[]> = {};
//       const imgs: any[] = $("img").toArray();
//       for (const imgEl of imgs as any[]) {
//         const src = $(imgEl as any).attr("src");
//         if (!src) continue;
//         const parent = $(imgEl as any).closest("p, li, h1, h2, h3")[0] as any;
//         let idx = -1;
//         if (parent) {
//           idx = (elems as any[]).indexOf(parent);
//         }
//         const key = idx >= 0 ? idx : blocks.length;
//         imagesByIndex[key] = imagesByIndex[key] || [];
//         imagesByIndex[key].push(src);
//       }

//       // If images are data URIs (embedded), upload them to Cloudinary so they
//       // are visible and performant for students. Replace data URIs with hosted URLs.
//       for (const k of Object.keys(imagesByIndex)) {
//         const arr = imagesByIndex[Number(k)];
//         const uploadedUrls: string[] = [];
//         for (const src of arr) {
//           try {
//             if (typeof src === "string" && src.startsWith("data:")) {
//               const uploadRes: any = await uploadDataUri(src, "exams");
//               if (uploadRes && uploadRes.secure_url) {
//                 uploadedUrls.push(uploadRes.secure_url);
//               }
//             } else if (typeof src === "string") {
//               // not a data URI (likely a valid src already) — keep as-is
//               uploadedUrls.push(src);
//             }
//           } catch (err) {
//             // on failure, keep the original src so diagram isn't lost
//             uploadedUrls.push(src);
//           }
//         }
//         imagesByIndex[Number(k)] = uploadedUrls;
//       }

//       let questionData: any = {};
//       let options: string[] = [];

//       const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
//       for (let idx = 0; idx < blocks.length; idx++) {
//         let line = blocks[idx];
//         if (/^\d+\./.test(line)) {
//           // Save previous question
//           if (Object.keys(questionData).length) {
//             questionData.options = options;
//             // attach images if any
//             if (imagesByIndex[idx - 1])
//               questionData.images = imagesByIndex[idx - 1];
//             value.push(questionData);
//             questionData = {};
//             options = [];
//           }
//           // Extract bracketed image URL if present
//           const match = line.match(BRACKET_URL_REGEX);
//           const url = match ? match[1].trim() : null;
//           line = line.replace(BRACKET_URL_REGEX, "").trim();
//           questionData = { question: line };
//           if (url) {
//             questionData.images = [url];
//           }
//         } else if (/^[A-D]\./.test(line)) {
//           options.push(line.replace(/^[A-D]\./, ""));
//         } else if (line.startsWith("Answer:")) {
//           questionData.answer = line.replace("Answer:", "").trim();
//         } else if (line.startsWith("Explanation:")) {
//           questionData.explanation = line.replace("Explanation:", "").trim();
//         } else {
//           // append to question if no options yet
//           if (questionData && !questionData.options) {
//             // Also extract bracketed image URL from continuation lines
//             const match = line.match(BRACKET_URL_REGEX);
//             const url = match ? match[1].trim() : null;
//             line = line.replace(BRACKET_URL_REGEX, "").trim();
//             questionData.question = `${questionData.question} ${line}`.trim();
//             if (url) {
//               if (!questionData.images) questionData.images = [];
//               questionData.images.push(url);
//             }
//           }
//         }
//       }

//       if (Object.keys(questionData).length) {
//         questionData.options = options;
//         const lastIdx = blocks.length - 1;
//         if (imagesByIndex[lastIdx])
//           questionData.images = imagesByIndex[lastIdx];
//         value.push(questionData);
//       }
//     } else {
//       // treat as CSV
//       const data = await csv().fromFile(uploadedPath);
//       for (const i of data as any[]) {
//         const opts = i.options ? i.options.split(";;") : [];
//         const read = {
//           question:
//             i.Question ||
//             i.question ||
//             i.questionText ||
//             i.questionTitle ||
//             i.question,
//           options: opts,
//           answer: i.Answer || i.answer,
//           explanation: i.Explanation || i.explanation,
//         };
//         value.push(read);
//       }
//     }

//     let term = lodash.find(value, { term: school?.presentTerm });
//     let session = lodash.find(value, { session: school?.presentSession });

//     const deleteFilesInFolder = (folderPath: any) => {
//       if (fs.existsSync(folderPath)) {
//         const files = fs.readdirSync(folderPath);

//         files.forEach((file) => {
//           const filePath = path.join(folderPath, file);
//           fs.unlinkSync(filePath);
//         });

//         console.log(
//           `All files in the folder '${folderPath}' have been deleted.`
//         );
//       } else {
//         console.log(`The folder '${folderPath}' does not exist.`);
//       }
//     };

//     // checkForSubject;
//     if (checkForSubject) {
//       // if (term && session) {
//       //   const quizes = await quizModel.findByIdAndUpdate(
//       //     term?._id,
//       //     {
//       //       quiz: {
//       //         instruction: { duration, mark, instruction },
//       //         question: value,
//       //       },
//       //       totalQuestions: value?.length,
//       //       startExam: false,
//       //     },
//       //     { new: true }
//       //   );

//       //   let filePath = path.join(__dirname, "uploads");

//       //   const deleteFilesInFolder = (folderPath: any) => {
//       //     if (fs.existsSync(folderPath)) {
//       //       const files = fs.readdirSync(folderPath);

//       //       files.forEach((file) => {
//       //         const filePath = path.join(folderPath, file);
//       //         fs.unlinkSync(filePath);
//       //       });

//       //       console.log(
//       //         `All files in the folder '${folderPath}' have been deleted.`
//       //       );
//       //     } else {
//       //       console.log(`The folder '${folderPath}' does not exist.`);
//       //     }
//       //   };

//       //   deleteFilesInFolder(filePath);

//       //   return res.status(201).json({
//       //     message: "update exam entry successfully",
//       //     data: quizes,
//       //     status: 201,
//       //   });
//       // } else {
//       //   const quizes = await quizModel.create({
//       //     subjectTitle: checkForSubject?.subjectTitle,
//       //     subjectID: checkForSubject?._id,
//       //     session: school?.presentSession,
//       //     term: school?.presentTerm,
//       //     quiz: {
//       //       instruction: { duration, mark, instruction },
//       //       question: value,
//       //     },
//       //     totalQuestions: value?.length,
//       //     status: "examination",
//       //     startExam: false,
//       //   });

//       //   checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));

//       //   checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));

//       //   checkForSubject?.save();

//       //   findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       //   findTeacher?.save();

//       //   findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       //   findSubjectTeacher?.save();

//       //   let filePath = path.join(__dirname, "uploads");

//       //   const deleteFilesInFolder = (folderPath: any) => {
//       //     if (fs.existsSync(folderPath)) {
//       //       const files = fs.readdirSync(folderPath);

//       //       files.forEach((file) => {
//       //         const filePath = path.join(folderPath, file);
//       //         fs.unlinkSync(filePath);
//       //       });

//       //       console.log(
//       //         `All files in the folder '${folderPath}' have been deleted.`
//       //       );
//       //     } else {
//       //       console.log(`The folder '${folderPath}' does not exist.`);
//       //     }
//       //   };

//       //   return res.status(201).json({
//       //     message: "exam entry successfully",
//       //     // data: quizes,
//       //     status: 201,
//       //   });
//       // }

//       // await examinationModel.deleteMany();

      // const quizes = await quizModel.create({
      //   subjectTitle: checkForSubject?.subjectTitle,
      //   subjectID: checkForSubject?._id,
      //   session: school?.presentSession,
      //   term: school?.presentTerm,
      //   // quiz: {
      //   //   instruction: { duration, mark, instruction },
      //   //   question: value,
      //   // },

      //   quiz: {
      //     instruction: { duration, mark, instruction },
      //     question: value,
      //     theory,
      //   },
      //   totalQuestions: value?.length,
      //   status: "examination",
      //   startExam: false,
      // });

      // checkForSubject?.examination.push(new Types.ObjectId(quizes._id));

      // checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));

      // checkForSubject?.save();

      // findTeacher?.examination.push(new Types.ObjectId(quizes._id));
      // findTeacher?.save();

      // findSubjectTeacher?.examination.push(new Types.ObjectId(quizes._id));
      // findSubjectTeacher?.save();

      // const x = setTimeout(async () => {
      //   await deleteFilesInFolder(filePath);
      //   clearTimeout(x);
      // }, 15000);

//       return res.status(201).json({
//         message: "exam entry successfully",
//         data: quizes,
//         exam: checkForSubject?.examination,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject quiz",
//       status: 404,
//       error: error,
//       data: error?.message,
//     });
//   }
// };


// Utility Functions
// const normalizeText = (text: string): string => {
//   if (!text) return "";
//   return text
//     .replace(/\u00A0/g, " ") // Replace non-breaking spaces
//     .replace(/\s+/g, " ") // Replace multiple spaces with single space
//     .trim();
// };

// const stripLeadingNumberFromHtml = (html: string): string => {
//   if (!html) return "";
//   // Remove leading number pattern like "1." or "10." from HTML while preserving the rest
//   return html.replace(/^(\d+\.?\s*)/, "").trim();
// };

// const stripLeadingOptionLetter = (html: string): string => {
//   if (!html) return "";
//   // Remove leading option letter like "A." or "B." from HTML while preserving the rest
//   return html.replace(/^([A-D]\.?\s*)/, "").trim();
// };


export const readSubjectExamination = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "quiz",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    let exam = lodash.filter(subject?.quiz, { status: "examination" })[0];

    return res.status(201).json({
      message: "subject exam read successfully",
      // data: subject?.quiz,
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
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { examID } = req.params;
    const { started } = req.body;

    const subject = await quizModel.findByIdAndUpdate(
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

// Quiz

// export const createSubjectQuizFromFile = async (
//   req: any,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { classID, subjectID } = req.params;
//     const { instruction, duration, mark } = req.body;
//     let filePath = path.join(__dirname, "../uploads/quizzes");

//     const classRoom = await classroomModel.findById(classID);
//     const checkForSubject = await subjectModel.findById(subjectID);
//     const findTeacher = await staffModel.findById(classRoom?.teacherID);
//     const findSubjectTeacher = await staffModel.findById(
//       checkForSubject?.teacherID
//     );
//     const school = await schoolModel.findById(findTeacher?.schoolIDs);

//     const uploadedPath = req?.file?.path;
//     if (!uploadedPath) {
//       return res.status(400).json({
//         message: "No upload file provided",
//         status: 400,
//       });
//     }

//     const originalName = req?.file?.originalname || uploadedPath;
//     const ext = path.extname(originalName).toLowerCase();

//     let value: any[] = [];

//     if (ext === ".doc" || ext === ".docx") {
//       // Use convertToHtml to preserve formatting and special characters
//       const result = await mammoth.convertToHtml({ path: uploadedPath }, { includeEmbeddedStyleMap: true });
//       const html = result.value || "";
//       const $ = cheerio.load(html);

//       const elems = $("body").children();
//       let questionData: any = {};
//       let options: string[] = [];
//       const BRACKET_URL_REGEX = /\[([^\]]+)\]/;

//       elems.each((i, el) => {
//         const rawText = normalizeText($(el).text().trim());
//         const htmlContent = $(el).html()?.trim() || "";
//         if (!rawText) return;

//         if (/^\d+\./u.test(rawText)) {
//           if (Object.keys(questionData).length) {
//             questionData.options = options;
//             value.push(questionData);
//             questionData = {};
//             options = [];
//           }

//           const match = rawText.match(BRACKET_URL_REGEX);
//           const url = match ? match[1].trim() : null;

//           let cleanHtml = stripLeadingNumberFromHtml(htmlContent);
//           if (url) cleanHtml = cleanHtml.replace(BRACKET_URL_REGEX, "").trim();

//           questionData = { question: cleanHtml };
//           if (url) questionData.images = [url];
//         } else if (/^[A-D]\./u.test(rawText)) {
//           options.push(stripLeadingOptionLetter(htmlContent));
//         } else if (rawText.startsWith("Answer:")) {
//           questionData.answer = normalizeText(rawText.replace("Answer:", "").trim());
//         } else if (rawText.startsWith("Explanation:")) {
//           questionData.explanation = normalizeText(rawText.replace("Explanation:", "").trim());
//         } else {
//           if (questionData && !questionData.options) {
//             const match = rawText.match(BRACKET_URL_REGEX);
//             const url = match ? match[1].trim() : null;
//             questionData.question = `${questionData.question}<br/>${htmlContent}`.trim();
//             if (url) {
//               if (!questionData.images) questionData.images = [];
//               questionData.images.push(url);
//               questionData.question = questionData.question.replace(BRACKET_URL_REGEX, "");
//             }
//           }
//         }
//       });

//       if (Object.keys(questionData).length) {
//         questionData.options = options;
//         value.push(questionData);
//       }
//     } else if (ext === ".csv") {
//       const data = await csv().fromFile(uploadedPath);
//       for (const i of data) {
//         const opts = i.options ? i.options.split(";;") : [];
//         const read = {
//           question:
//             i.Question || i.question || i.questionText || i.questionTitle,
//           options: opts,
//           answer: i.Answer || i.answer,
//           explanation: i.Explanation || i.explanation,
//         };
//         value.push(read);
//       }
//     } else {
//       return res.status(400).json({
//         message: "Invalid file format. Please upload a CSV, DOC, or DOCX file",
//         status: 400,
//       });
//     }

//     if (checkForSubject) {
//       const quizes = await quizModel.create({
//         subjectTitle: checkForSubject?.subjectTitle,
//         subjectID: checkForSubject?._id,
//         session: school?.presentSession,
//         term: school?.presentTerm,
//         quiz: {
//           instruction: { duration, mark, instruction },
//           question: value,
//         },
//         totalQuestions: value?.length,
//         status: "quiz",
//         startExam: false,
//       });

//       checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));
//       checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));
//       checkForSubject?.save();

//       findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       findTeacher?.save();

//       findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
//       findSubjectTeacher?.save();

//       // Clean up uploaded file
//       const deleteFilesInFolder = (folderPath: any) => {
//         if (fs.existsSync(folderPath)) {
//           const files = fs.readdirSync(folderPath);
//           files.forEach((file) => {
//             const filePath = path.join(folderPath, file);
//             fs.unlinkSync(filePath);
//           });
//         }
//       };

//       const x = setTimeout(async () => {
//         await deleteFilesInFolder(filePath);
//         clearTimeout(x);
//       }, 15000);

//       return res.status(201).json({
//         message: "quiz entry successfully created from file",
//         data: quizes,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Subject doesn't exist for this class",
//         status: 404,
//       });
//     }
//   } catch (error: any) {
//     return res.status(404).json({
//       message: "Error creating class subject quiz from file",
//       status: 404,
//       error: error,
//       data: error?.message,
//     });
//   }
// };

export const createSubjectQuiz = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { classID, subjectID } = req.params;
    const { quiz, totalQuestions } = req.body;

    const classRoom = await classroomModel.findById(classID);

    const checkForSubject = await subjectModel.findById(subjectID);

    const findTeacher = await staffModel.findById(classRoom?.teacherID);

    const findSubjectTeacher = await staffModel.findById(
      checkForSubject?.teacherID
    );

    if (checkForSubject) {
      const quizes = await quizModel.create({
        subjectTitle: checkForSubject?.subjectTitle,
        subjectID: checkForSubject?._id,
        quiz,
        totalQuestions,
        status: "quiz",
      });

      checkForSubject?.quiz.push(new Types.ObjectId(quizes._id));

      checkForSubject?.performance?.push(new Types.ObjectId(quizes._id));

      checkForSubject?.save();

      findTeacher?.quiz.push(new Types.ObjectId(quizes._id));
      findTeacher?.save();

      findSubjectTeacher?.quiz.push(new Types.ObjectId(quizes._id));
      findSubjectTeacher?.save();

      return res.status(201).json({
        message: "quiz entry created successfully",
        data: quizes,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Subject doesn't exist for this class",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating class subject quiz",
      status: 404,
    });
  }
};

export const readSubjectQuiz = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { subjectID } = req.params;

    const subject = await subjectModel.findById(subjectID).populate({
      path: "quiz",
      options: {
        sort: {
          time: 1,
        },
      },
    });

    return res.status(201).json({
      message: "subject quiz read successfully",
      data: subject,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating subject quiz",
      status: 404,
    });
  }
};

export const readTeacherSubjectQuiz = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;

    const quiz: any = await staffModel
      .findById(teacherID)
      .populate({ path: "quiz" });

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

export const readQuiz = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const quiz: any = await quizModel.findById(quizID);

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

export const readQuizes = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const quiz: any = await quizModel.find().populate({
      path: "performance",
    });

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

export const getQuizRecords = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const quizzes: any = await studentModel
      .findById(studentID)
      .populate({ path: "performance" });

    return res.status(200).json({
      message: "Quiz records fetched successfully",
      data: quizzes,
      status: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching quiz records",
      data: error.message,
      status: 500,
    });
  }
};

export const deleteQuiz = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { quizID } = req.params;

    const quiz = await quizModel.findByIdAndDelete(quizID);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
        status: 404,
      });
    }

    const subjectUpdate = await subjectModel.updateMany(
      { quiz: quizID },
      { $pull: { quiz: quizID } }
    );

    const staffUpdate = await staffModel.updateMany(
      { quiz: quizID },
      { $pull: { quiz: quizID } }
    );

    const studentUpdate = await studentModel.updateMany(
      { quiz: quizID },
      { $pull: { quiz: quizID } }
    );

    return res.status(200).json({
      message: "Quiz deleted successfully",
      data: {
        deletedQuiz: quiz,
        subjectUpdate,
        staffUpdate,
        studentUpdate,
      },
      status: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error deleting quiz",
      data: error.message,
      status: 500,
    });
  }
};

export const getStudentQuizRecords = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID } = req.params;

    const staff = await staffModel.findById(teacherID).populate({
      path: "quiz",
      populate: {
        path: "performance",
        select: "studentName studentScore studentGrade subjectTitle date",
      },
    });

    if (!staff) {
      return res.status(404).json({
        message: "Teacher not found or no quiz data available",
        status: 404,
      });
    }

    return res.status(200).json({
      message: "Student quiz records retrieved successfully",
      data: staff,
      status: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error retrieving student quiz records",
      data: error.message,
      status: 500,
    });
  }
};
