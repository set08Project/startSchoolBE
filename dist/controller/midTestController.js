"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMidTest = exports.readMidTest = exports.updateSubjectMidTest = exports.randomizeSubjectMidTest = exports.startSubjectMidTest = exports.readSubjectMidTest = exports.createSubjectMidTest = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const streamifier_1 = require("../utils/streamifier");
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const subjectModel_1 = __importDefault(require("../model/subjectModel"));
const midTestModel_1 = __importDefault(require("../model/midTestModel"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const mongoose_1 = require("mongoose");
const csvtojson_1 = __importDefault(require("csvtojson"));
const lodash_1 = __importDefault(require("lodash"));
// ──────────────────────────────────────────────────────────────
// Unicode helpers
// ──────────────────────────────────────────────────────────────
function toUnicodeSubscript(text) {
    const map = {
        // Digits
        "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
        "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
        // Operators
        "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
        // Alphabet (Partial common set)
        a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
        n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
    };
    return text
        .split("")
        .map((c) => map[c.toLowerCase()] || c)
        .join("");
}
function toUnicodeSuperscript(text) {
    const map = {
        // Digits
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
        "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
        // Operators
        "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
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
async function extractRawTextFromDocx(filePath) {
    try {
        const zip = new adm_zip_1.default(filePath);
        const documentXml = zip.readAsText("word/document.xml");
        // Build a rels map rId -> target (e.g. media/image1.png)
        let relsXml = "";
        try {
            relsXml = zip.readAsText("word/_rels/document.xml.rels");
        }
        catch (e) {
            // No rels file, proceed without images
            relsXml = "";
        }
        const rels = {};
        if (relsXml) {
            const relRegex = /<Relationship[^>]*Id="([^\"]+)"[^>]*Target="([^\"]+)"/g;
            let rm;
            while ((rm = relRegex.exec(relsXml)) !== null) {
                let tgt = rm[2];
                // Normalize possible '../' path prefixes
                if (tgt.startsWith("../"))
                    tgt = tgt.replace(/^\.\.\//, "");
                rels[rm[1]] = tgt;
            }
        }
        let fullText = "";
        const paragraphs = documentXml.split(/<w:p[\s>]/);
        for (const para of paragraphs) {
            if (!para.trim())
                continue;
            let paraText = processParagraph(para);
            // Find image references (r:embed or r:id) in the paragraph and upload
            // them to cloudinary, then append URLs in-line so downstream parsing
            // picks them up as images.
            const embeds = [...para.matchAll(/\br:(?:embed|id)="([^"]+)"/g)].map((m) => m[1]);
            const imageUrls = [];
            for (const rId of embeds) {
                try {
                    const target = rels[rId];
                    if (!target)
                        continue;
                    const mediaPath = `word/${target}`;
                    const fileBuff = zip.readFile(mediaPath);
                    if (!fileBuff)
                        continue;
                    const ext = path.extname(mediaPath).replace(".", "").toLowerCase();
                    const mimeMap = {
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
                        const uploadRes = await (0, streamifier_1.uploadDataUri)(dataUri, "exams");
                        if (uploadRes && uploadRes.secure_url) {
                            imageUrls.push(uploadRes.secure_url);
                        }
                        else {
                            // Fallback: use data URI directly
                            imageUrls.push(dataUri);
                        }
                    }
                    catch (uploadErr) {
                        // Upload failed – include data URI as fallback
                        imageUrls.push(dataUri);
                    }
                }
                catch (ex) {
                    // ignore particular image failures – continue parsing text
                    console.warn("Error handling embedded image for rId", rId, ex?.message || ex);
                }
            }
            if (imageUrls.length > 0) {
                // Append each URL as bracketed url to be picked up later
                paraText += " " + imageUrls.map((u) => `[${u}]`).join(" ");
            }
            if (paraText.trim())
                fullText += paraText.trim() + "\n";
        }
        return fullText.replace(/\n\n\n+/g, "\n\n").trim();
    }
    catch (error) {
        console.error("Error extracting DOCX:", error);
        throw error;
    }
}
function processParagraph(paraXml) {
    const elements = [];
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
            }
            else if (runXml.includes('w:val="superscript"')) {
                elements.push({ pos: match.index, content: toUnicodeSuperscript(runText) });
            }
            else {
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
function processMathElement(mathXml) {
    const SUPER = {
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
        "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
        "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
        a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ",
        n: "ⁿ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
    };
    const SUB = {
        "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
        "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
        "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
        a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ",
        n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
    };
    const toSup = (s) => s
        .split("")
        .map((c) => SUPER[c] || c)
        .join("");
    const toSub = (s) => s
        .split("")
        .map((c) => SUB[c] || c)
        .join("");
    const isElementSymbol = (base) => /^[A-Z][a-z]?$/.test(base.trim());
    const nextRunStartsWithUpper = (index) => {
        const tail = mathXml.slice(index);
        const match = tail.match(/<m:r[^>]*>.*?<m:t[^>]*>([^<]*)<\/m:t>/s);
        if (!match)
            return false;
        const txt = (match[1] || "").trim();
        return /^[A-Z]/.test(txt);
    };
    const structures = [];
    const add = (s) => {
        if (structures.some((x) => !(s.end <= x.start || s.start >= x.end)))
            return;
        structures.push(s);
    };
    let m;
    // 1. sSubSup → ²³⁵₉₂U (most important)
    const subSupRegex = /<m:sSubSup>(.*?)<\/m:sSubSup>/gs;
    while ((m = subSupRegex.exec(mathXml)) !== null) {
        const xml = m[1];
        const base = processMathElement(xml.match(/<m:e>(.*?)<\/m:e>/s)?.[1] || "").trim();
        const sub = processMathElement(xml.match(/<m:sub>(.*?)<\/m:sub>/s)?.[1] || "").trim();
        const sup = processMathElement(xml.match(/<m:sup>(.*?)<\/m:sup>/s)?.[1] || "").trim();
        const content = isElementSymbol(base)
            ? `${toSup(sup)}${toSub(sub)}${base}` // ²³⁵₉₂U → correct
            : `${base}${toSub(sub)}${toSup(sup)}`;
        add({ start: m.index, end: m.index + m[0].length, content });
    }
    // 2. Superscript only → ¹⁴C
    const supRegex = /<m:sSup>(.*?)<\/m:sSup>/gs;
    while ((m = supRegex.exec(mathXml)) !== null) {
        const xml = m[1];
        const base = processMathElement(xml.match(/<m:e>(.*?)<\/m:e>/s)?.[1] || "").trim();
        const sup = processMathElement(xml.match(/<m:sup>(.*?)<\/m:sup>/s)?.[1] || "").trim();
        const content = isElementSymbol(base) && /^\d+$/.test(sup.replace(/[^\d]/g, ""))
            ? `${toSup(sup)}${base}`
            : `${base}${toSup(sup)}`;
        add({ start: m.index, end: m.index + m[0].length, content });
    }
    // 3. Subscript only → ₄Be, ₆C (atomic number) or H₂ (stoichiometry)
    const subRegex = /<m:sSub>(.*?)<\/m:sSub>/gs;
    while ((m = subRegex.exec(mathXml)) !== null) {
        const xml = m[1];
        const base = processMathElement(xml.match(/<m:e>(.*?)<\/m:e>/s)?.[1] || "").trim();
        const sub = processMathElement(xml.match(/<m:sub>(.*?)<\/m:sub>/s)?.[1] || "").trim();
        let content = "";
        if (isElementSymbol(base) && /^\d+$/.test(sub)) {
            // If the math token *after* this structure begins with an uppercase
            // letter then it's likely stoichiometry (e.g., H₂O) — put the subscript
            // after the element. Otherwise, treat it as atomic number prefix.
            if (nextRunStartsWithUpper(m.index + m[0].length)) {
                content = `${base}${toSub(sub)}`; // H₂ (stoichiometry)
            }
            else {
                content = `${toSub(sub)}${base}`; // ₄Be (atomic number)
            }
        }
        else {
            content = `${base}${toSub(sub)}`;
        }
        add({ start: m.index, end: m.index + m[0].length, content });
    }
    // Fractions & radicals (unchanged)
    const fracRegex = /<m:f>(.*?)<\/m:f>/gs;
    while ((m = fracRegex.exec(mathXml)) !== null) {
        const num = processMathElement(m[1].match(/<m:num>(.*?)<\/m:num>/s)?.[1] || "");
        const den = processMathElement(m[1].match(/<m:den>(.*?)<\/m:den>/s)?.[1] || "");
        add({
            start: m.index,
            end: m.index + m[0].length,
            content: `(${num})/(${den})`,
        });
    }
    const radRegex = /<m:rad>(.*?)<\/m:rad>/gs;
    while ((m = radRegex.exec(mathXml)) !== null) {
        const deg = processMathElement(m[1].match(/<m:deg>(.*?)<\/m:deg>/s)?.[1] || "").trim();
        const base = processMathElement(m[1].match(/<m:e>(.*?)<\/m:e>/s)?.[1] || "");
        const content = deg && deg !== "2" ? `${toSup(deg)}√(${base})` : `√(${base})`;
        add({ start: m.index, end: m.index + m[0].length, content });
    }
    // Final assembly
    structures.sort((a, b) => a.start - b.start);
    let pos = 0;
    let result = "";
    const runs = [];
    const runRegex = /<m:r>(.*?)<\/m:r>/gs;
    while ((m = runRegex.exec(mathXml)) !== null) {
        const text = (m[1].match(/<m:t[^>]*>([^<]*)<\/m:t>/g) || [])
            .map((t) => t.replace(/<[^>]*>/g, ""))
            .join("");
        if (text)
            runs.push({ start: m.index, content: text });
    }
    if (structures.length === 0) {
        result = runs.map((r) => r.content).join("");
    }
    else {
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
// helper to extract URLs from string
const extractUrlsFromText = (text) => {
    // Match both http(s) and data URIs
    const urlRegex = /(https?:\/\/[^\s\)\]]+|data:[^\s\)\]]+)/g;
    const matches = Array.from((text || "").matchAll(urlRegex));
    return matches.map((m) => m[0]);
};
// Attempts to trim trailing garbage after common image extensions
const sanitizeUrl = (url) => {
    if (!url || typeof url !== "string")
        return url;
    const extRegex = /(\.(?:png|jpe?g|gif|webp|svg|bmp|pdf|txt))(?:[?#][^\s\)\]]*)?/i;
    const match = url.match(extRegex);
    if (!match || match.index === undefined)
        return url;
    const endIndex = match.index + match[0].length;
    return url.slice(0, endIndex);
};
const createSubjectMidTest = async (req, res) => {
    try {
        const { classID, subjectID } = req.params;
        const { instruction, duration, mark, theory } = req.body;
        let filePath = path.join(require("os").tmpdir(), "examination");
        const classRoom = await classroomModel_1.default.findById(classID);
        const checkForSubject = await subjectModel_1.default.findById(subjectID);
        const findTeacher = await staffModel_1.default.findById(classRoom?.teacherID);
        const findSubjectTeacher = await subjectModel_1.default.findById(checkForSubject?.teacherID);
        const school = await schoolModel_1.default.findById(findTeacher?.schoolIDs);
        const uploadedPath = req?.file?.path;
        if (!uploadedPath) {
            return res
                .status(400)
                .json({ message: "No upload file provided", status: 400 });
        }
        const originalName = req?.file?.originalname || uploadedPath;
        const ext = path.extname(originalName).toLowerCase();
        let value = [];
        if (ext === ".doc" || ext === ".docx") {
            // Direct XML parsing for high-fidelity scientific/math support
            const rawText = await extractRawTextFromDocx(uploadedPath);
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
            let questionData = {};
            let options = [];
            const BRACKET_URL_REGEX = /\[([^\]]+)\]/;
            for (let idx = 0; idx < lines.length; idx++) {
                let line = lines[idx];
                if (/^\d+[\.\)]/.test(line)) {
                    // Save previous question
                    if (Object.keys(questionData).length) {
                        questionData.options = options;
                        value.push(questionData);
                        questionData = {};
                        options = [];
                    }
                    const match = line.match(BRACKET_URL_REGEX);
                    let url = match ? match[1].trim() : null;
                    if (!url) {
                        const extracted = extractUrlsFromText(line);
                        if (extracted.length)
                            url = sanitizeUrl(extracted[0]);
                    }
                    line = line.replace(BRACKET_URL_REGEX, "").trim();
                    questionData = { question: line.replace(/^\d+[\.\)]\s*/, "") };
                    if (url) {
                        url = sanitizeUrl(url);
                        questionData.images = [url];
                        questionData.url = url;
                    }
                }
                else if (/^[A-D][\.\)]/.test(line)) {
                    options.push(line.replace(/^[A-D][\.\)]\s*/, "").trim());
                }
                else if (/^Answer:/i.test(line)) {
                    questionData.answer = line.replace(/^Answer:\s*/i, "").trim();
                }
                else if (/^Explanation:/i.test(line)) {
                    questionData.explanation = line.replace(/^Explanation:\s*/i, "").trim();
                }
                else if (questionData && !questionData.options) {
                    // Continuation of question
                    const match = line.match(BRACKET_URL_REGEX);
                    let url = match ? match[1].trim() : null;
                    if (!url) {
                        const extracted = extractUrlsFromText(line);
                        if (extracted.length)
                            url = sanitizeUrl(extracted[0]);
                    }
                    line = line.replace(BRACKET_URL_REGEX, "").trim();
                    questionData.question = `${questionData.question} ${line}`.trim();
                    if (url) {
                        url = sanitizeUrl(url);
                        if (!questionData.images)
                            questionData.images = [];
                        questionData.images.push(url);
                        if (!questionData.url)
                            questionData.url = url;
                    }
                }
            }
            if (Object.keys(questionData).length) {
                questionData.options = options;
                value.push(questionData);
            }
        }
        else {
            const data = await (0, csvtojson_1.default)().fromFile(uploadedPath);
            for (const i of data) {
                const opts = i.options ? i.options.split(";;") : [];
                const possibleUrl = i.url || i.image || i.imageUrl || i.Image || i.URL || i.Url;
                let images = possibleUrl
                    ? typeof possibleUrl === "string"
                        ? [possibleUrl]
                        : possibleUrl
                    : [];
                images = images.map((u) => sanitizeUrl(String(u)));
                const read = {
                    question: i.Question ||
                        i.question ||
                        i.questionText ||
                        i.questionTitle ||
                        i.question,
                    images,
                    url: images && images.length ? images[0] : undefined,
                    options: opts,
                    answer: i.Answer || i.answer,
                    explanation: i.Explanation || i.explanation,
                };
                value.push(read);
            }
        }
        let term = lodash_1.default.find(value, { term: school?.presentTerm });
        let session = lodash_1.default.find(value, { session: school?.presentSession });
        const deleteFilesInFolder = (folderPath) => {
            if (fs.existsSync(folderPath)) {
                const files = fs.readdirSync(folderPath);
                files.forEach((file) => {
                    const filePath = path.join(folderPath, file);
                    fs.unlinkSync(filePath);
                });
                console.log(`All files in the folder '${folderPath}' have been deleted.`);
            }
            else {
                console.log(`The folder '${folderPath}' does not exist.`);
            }
        };
        if (checkForSubject) {
            const quizes = await midTestModel_1.default.create({
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
            checkForSubject?.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject?.performance?.push(new mongoose_1.Types.ObjectId(quizes._id));
            checkForSubject?.save();
            findTeacher?.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
            findTeacher?.save();
            findSubjectTeacher?.midTest.push(new mongoose_1.Types.ObjectId(quizes._id));
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
        }
        else {
            return res.status(404).json({
                message: "Subject doesn't exist for this class",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating class subject quiz",
            status: 404,
            error: error,
            data: error?.message,
        });
    }
};
exports.createSubjectMidTest = createSubjectMidTest;
const readSubjectMidTest = async (req, res) => {
    try {
        const { subjectID } = req.params;
        const subject = await subjectModel_1.default.findById(subjectID).populate({
            path: "midTest",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        let midTest = lodash_1.default.filter(subject?.midTest, {
            status: "midTest",
        })[0];
        return res.status(201).json({
            message: "subject midTest read successfully",
            midTest,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject exam",
            status: 404,
        });
    }
};
exports.readSubjectMidTest = readSubjectMidTest;
const startSubjectMidTest = async (req, res) => {
    try {
        const { midTestID } = req.params;
        const { started } = req.body;
        const subject = await midTestModel_1.default.findByIdAndUpdate(midTestID, {
            startMidTest: started,
        }, { new: true });
        return res.status(201).json({
            message: "start subject mid test read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject mid test",
            status: 404,
        });
    }
};
exports.startSubjectMidTest = startSubjectMidTest;
const randomizeSubjectMidTest = async (req, res) => {
    try {
        const { midTestID } = req.params;
        const { started } = req.body;
        const subject = await midTestModel_1.default.findByIdAndUpdate(midTestID, {
            randomize: started,
        }, { new: true });
        return res.status(201).json({
            message: "start randomize subject mid test read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject mid test",
            status: 404,
        });
    }
};
exports.randomizeSubjectMidTest = randomizeSubjectMidTest;
const updateSubjectMidTest = async (req, res) => {
    try {
        const { midTestID } = req.params;
        const { mark, duration } = req.body;
        const midTest = await midTestModel_1.default.findByIdAndUpdate(midTestID);
        const subject = await midTestModel_1.default.findByIdAndUpdate(midTestID, {
            quiz: {
                instruction: { duration, mark },
                question: midTest?.quiz?.question,
                theory: midTest?.quiz?.theory,
            },
        }, { new: true });
        return res.status(201).json({
            message: "start subject mid test read successfully",
            data: subject,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error reading subject mid test",
            status: 404,
        });
    }
};
exports.updateSubjectMidTest = updateSubjectMidTest;
const readMidTest = async (req, res) => {
    try {
        const { midTestID } = req.params;
        const quiz = await midTestModel_1.default.findById(midTestID);
        return res.status(201).json({
            message: "subject mid Test read successfully",
            data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject mid Test",
            data: error.message,
            status: 404,
        });
    }
};
exports.readMidTest = readMidTest;
const deleteMidTest = async (req, res) => {
    try {
        const { midTestID, subjectID } = req.params;
        const quizSubject = await subjectModel_1.default.findById(subjectID);
        const quizTeacher = await staffModel_1.default.findById(quizSubject?.teacherID);
        console.log("quizTeacher", quizTeacher);
        await midTestModel_1.default.findByIdAndDelete(midTestID);
        if (quizSubject && Array.isArray(quizSubject.midTest)) {
            quizSubject.midTest = quizSubject.midTest.filter((id) => id.toString() !== midTestID);
            await quizSubject.save();
        }
        quizTeacher.pull(new mongoose_1.Types.ObjectId(midTestID));
        quizTeacher.save();
        return res.status(201).json({
            message: "subject mid Test read successfully",
            // data: quiz,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating subject mid Test",
            data: error.message,
            status: 404,
        });
    }
};
exports.deleteMidTest = deleteMidTest;
