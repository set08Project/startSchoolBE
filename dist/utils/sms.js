"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendClockOutSMS = exports.sendClockInSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "N-Alert";
const TERMII_URL = "https://api.ng.termii.com/api/sms/send";
const sendSMS = async (to, message) => {
    if (!TERMII_API_KEY) {
        console.warn("SMS Skipped: TERMII_API_KEY is missing in .env");
        return;
    }
    if (!to) {
        console.warn("SMS Skipped: Recipient phone number is missing");
        return;
    }
    // Normalize Nigerian number: 080... → 2348...
    const phone = to.startsWith("0") ? `234${to.slice(1)}` : to;
    console.log(`Attempting to send SMS to ${phone} via Termii...`);
    try {
        const response = await axios_1.default.post(TERMII_URL, {
            api_key: TERMII_API_KEY,
            to: phone,
            from: TERMII_SENDER_ID,
            sms: message,
            type: "plain",
            channel: "generic",
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
        const name = `${student.studentFirstName} ${student.studentLastName}`;
        const time = student.clockInTime || "";
        const schoolName = school?.schoolName || "School";
        const message = `${schoolName}: ${name} has CLOCKED IN at ${time}. Reply or call the school if this is unexpected.`;
        console.log(`Triggering Clock-In SMS for ${name}...`);
        await sendSMS(parentPhone, message);
    }
    catch (error) {
        // SMS failure must never break the clock flow
        console.error("Termii clock-in SMS error:", error);
    }
};
exports.sendClockInSMS = sendClockInSMS;
const sendClockOutSMS = async (student, school) => {
    try {
        const parentPhone = student?.parentPhoneNumber;
        if (!parentPhone)
            return;
        const name = `${student.studentFirstName} ${student.studentLastName}`;
        const time = student.clockOutTime || "";
        const schoolName = school?.schoolName || "School";
        const message = `${schoolName}: ${name} has CLOCKED OUT at ${time}. They are on their way home.`;
        console.log(`Triggering Clock-Out SMS for ${name}...`);
        await sendSMS(parentPhone, message);
    }
    catch (error) {
        console.error("Termii clock-out SMS error:", error);
    }
};
exports.sendClockOutSMS = sendClockOutSMS;
