"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestSMS = exports.sendClockOutSMS = exports.sendClockInSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const TERMII_URL = "https://api.ng.termii.com/api/sms/send";
const sendSMS = async (to, message, channel = "generic") => {
    const apiKey = process.env.TERMII_API_KEY;
    const senderId = process.env.TERMII_SENDER_ID || "Next54NG";
    if (!apiKey) {
        console.warn("SMS Skipped: TERMII_API_KEY is missing in .env");
        return;
    }
    if (!to) {
        console.warn("SMS Skipped: Recipient phone number is missing");
        return;
    }
    // Normalize Nigerian number: 080... → 2348...
    const phone = to.startsWith("0") ? `234${to.slice(1)}` : to;
    console.log(`[SMS Diagnostic] SenderID: "${senderId}" | Channel: "${channel}" | To: ${phone}`);
    try {
        const response = await axios_1.default.post(TERMII_URL, {
            api_key: apiKey,
            to: phone,
            from: senderId,
            sms: message,
            type: "plain",
            channel: channel,
        });
        console.log("Termii SMS Success:", response.data);
    }
    catch (error) {
        console.error("Termii API Error:", error.response?.data || error.message);
        throw error;
    }
};
const sendClockInSMS = async (student, school) => {
    try {
        const parentPhone = student?.parentPhoneNumber;
        if (!parentPhone)
            return;
        const studentLastName = student?.studentLastName || "";
        const studentFirstName = student?.studentFirstName?.split(" ")[0] || "";
        const time = student.clockInTime || "";
        const schoolName = school?.schoolName || "School";
        const message = `Hello Mr/Mrs ${studentLastName}, \nThis is to inform you that your child ${studentFirstName} has arrived at school now at ${time}. 
    \nPowered by ${schoolName.split(" ")[0]}`;
        console.log(`Triggering Clock-In SMS for ${studentFirstName}...`);
        await sendSMS(parentPhone, message, "dnd");
    }
    catch (error) {
        // SMS failure must never break the clock flow
        console.error("Termii clock-in SMS error:", error);
    }
};
exports.sendClockInSMS = sendClockInSMS;
const sendClockOutSMS = async (student, school, channel = "dnd") => {
    try {
        const parentPhone = student?.parentPhoneNumber;
        if (!parentPhone)
            return;
        const studentLastName = student?.studentLastName || "";
        const studentFirstName = student?.studentFirstName?.split(" ")[0] || "";
        const time = student.clockOutTime || "";
        const schoolName = school?.schoolName || "School";
        const message = `Hello Mr/Mrs ${studentLastName}, \nThis is to inform you that your child ${studentFirstName} has left school now at ${time}. \nPowered by ${schoolName.split(" ")[0]}`;
        console.log(`Triggering Clock-Out SMS for ${studentFirstName}...`);
        await sendSMS(parentPhone, message, channel);
    }
    catch (error) {
        console.error("Termii clock-out SMS error:", error);
    }
};
exports.sendClockOutSMS = sendClockOutSMS;
const sendTestSMS = async (to, channel = "dnd", customMessage) => {
    const message = customMessage || "This is a TEST SMS from your School Management System. Termii configuration is working!";
    await sendSMS(to, message, channel);
};
exports.sendTestSMS = sendTestSMS;
