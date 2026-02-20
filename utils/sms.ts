import axios from "axios";
import env from "dotenv";
env.config();

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "N-Alert";
const TERMII_URL = "https://api.ng.termii.com/api/sms/send";

const sendSMS = async (to: string, message: string): Promise<void> => {
  if (!to || !TERMII_API_KEY) return;

  // Normalize Nigerian number: 080... → 2348...
  const phone = to.startsWith("0") ? `234${to.slice(1)}` : to;

  await axios.post(TERMII_URL, {
    api_key: TERMII_API_KEY,
    to: phone,
    from: TERMII_SENDER_ID,
    sms: message,
    type: "plain",
    channel: "generic",
  });
};

export const sendClockInSMS = async (student: any, school: any): Promise<void> => {
  try {
    const parentPhone = student?.parentPhoneNumber;
    if (!parentPhone) return;

    const name = `${student.studentFirstName} ${student.studentLastName}`;
    const time = student.clockInTime || "";
    const schoolName = school?.schoolName || "School";

    const message = `${schoolName}: ${name} has CLOCKED IN at ${time}. Reply or call the school if this is unexpected.`;

    await sendSMS(parentPhone, message);
  } catch (error) {
    // SMS failure must never break the clock flow
    console.error("Termii clock-in SMS error:", error);
  }
};

export const sendClockOutSMS = async (student: any, school: any): Promise<void> => {
  try {
    const parentPhone = student?.parentPhoneNumber;
    if (!parentPhone) return;

    const name = `${student.studentFirstName} ${student.studentLastName}`;
    const time = student.clockOutTime || "";
    const schoolName = school?.schoolName || "School";

    const message = `${schoolName}: ${name} has CLOCKED OUT at ${time}. They are on their way home.`;

    await sendSMS(parentPhone, message);
  } catch (error) {
    console.error("Termii clock-out SMS error:", error);
  }
};
