"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWeeklyReport = exports.clockingOutEmail = exports.clockingInEmail = exports.verifySchoolFees = exports.changeTokenEmail = exports.addMemberEmail = exports.verifiedEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const moment_1 = __importDefault(require("moment"));
dotenv_1.default.config();
const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
const GOOGLE_REFRESH = process.env.GOOGLE_REFRESH;
const oAuth = new googleapis_1.google.auth.OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REDIRECT_URL);
oAuth.setCredentials({ refresh_token: GOOGLE_REFRESH });
const url = process.env.APP_URL_DEPLOY;
const verifiedEmail = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientSecret: GOOGLE_SECRET,
                clientId: GOOGLE_ID,
                refreshToken: GOOGLE_REFRESH,
                accessToken,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
        }, "secretCode", {
            expiresIn: "5m",
        });
        const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            const getSchool = yield schoolModel_1.default.findById(user._id);
            if (!getSchool.verify) {
                yield schoolModel_1.default.findByIdAndDelete(getSchool._id);
            }
            clearTimeout(timer);
        }), 5 * 60 * 1000);
        let frontEndURL = `${url}/${token}/sign-in`;
        let devURL = `${url}/auth/api/verify-user/${token}`;
        const myPath = path_1.default.join(__dirname, "../views/index.ejs");
        const html = yield ejs_1.default.renderFile(myPath, {
            link: devURL,
            tokenCode: user === null || user === void 0 ? void 0 : user.enrollmentID,
            userName: user === null || user === void 0 ? void 0 : user.userName,
        });
        const mailerOption = {
            from: "NEXT🟦🟦🟦 <codelabbest@gmail.com>",
            to: user.email,
            subject: "Account Verification",
            html,
        };
        yield transporter.sendMail(mailerOption);
    }
    catch (error) {
        console.error();
    }
});
exports.verifiedEmail = verifiedEmail;
const addMemberEmail = (member, getUser) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientSecret: GOOGLE_SECRET,
                clientId: GOOGLE_ID,
                refreshToken: GOOGLE_REFRESH,
                accessToken,
            },
        });
        let devURL = `${url}/api/verify-user/${getUser._id}`;
        const myPath = path_1.default.join(__dirname, "../views/memberAdded.ejs");
        const html = yield ejs_1.default.renderFile(myPath, {
            relationship: member.relationship,
            firstName: member.firstName,
        });
        const mailerOption = {
            from: "wecareHMO❤️⛑️🚑 <codelabbest@gmail.com>",
            to: getUser.email,
            subject: "Family Member added Notification",
            html,
        };
        yield transporter.sendMail(mailerOption);
    }
    catch (error) {
        console.error();
    }
});
exports.addMemberEmail = addMemberEmail;
const changeTokenEmail = (getUser) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientSecret: GOOGLE_SECRET,
                clientId: GOOGLE_ID,
                refreshToken: GOOGLE_REFRESH,
                accessToken,
            },
        });
        let devURL = `${url}/api/verify-user/${getUser._id}`;
        const myPath = path_1.default.join(__dirname, "../views/resetToken.ejs");
        const html = yield ejs_1.default.renderFile(myPath, {
            token: getUser.firstName,
            link: devURL,
        });
        const mailerOption = {
            from: "wecareHMO❤️⛑️🚑 <codelabbest@gmail.com>",
            to: getUser.email,
            subject: "Token reset Notification",
            html,
        };
        yield transporter.sendMail(mailerOption);
    }
    catch (error) {
        console.error();
    }
});
exports.changeTokenEmail = changeTokenEmail;
const verifySchoolFees = (user, term) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientSecret: GOOGLE_SECRET,
                clientId: GOOGLE_ID,
                refreshToken: GOOGLE_REFRESH,
                accessToken,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.parentEmail,
        }, "weEducation");
        let frontEndURL = `${url}/${token}/sign-in`;
        let devURL = `${url}/api/update-student-fees-1st/${user._id}`;
        const myPath = path_1.default.join(__dirname, "../views/feesMail.ejs");
        const html = yield ejs_1.default.renderFile(myPath, {
            link: devURL,
            token: user.token,
            studentName: user.studentFirstName,
            // schoolMail: user.email,
            // schoolName: user.schoolName,
        });
        const mailerOption = {
            from: `${user.schoolName}📘📘📘 <codelabbest@gmail.com>`,
            to: user.parentEmail,
            subject: `${term} Term School Fees Payment`,
            html,
        };
        yield transporter.sendMail(mailerOption);
    }
    catch (error) {
        console.error();
    }
});
exports.verifySchoolFees = verifySchoolFees;
const clockingInEmail = (user, school) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientSecret: GOOGLE_SECRET,
                clientId: GOOGLE_ID,
                refreshToken: GOOGLE_REFRESH,
                accessToken,
            },
        });
        const myPath = path_1.default.join(__dirname, "../views/clockinMail.ejs");
        const x = user === null || user === void 0 ? void 0 : user.clockInTime.split(",");
        const y = x[2].trim();
        const html = yield ejs_1.default.renderFile(myPath, {
            clockin: user.clockInTime,
            parent: user.studentLastName,
            child: user.studentFirstName,
            address: school === null || school === void 0 ? void 0 : school.address,
            school: school === null || school === void 0 ? void 0 : school.schoolName,
            phone: school === null || school === void 0 ? void 0 : school.phone,
            date: `${x[0]} ${x[1]} ${y.split(" ")[0]}`,
            time: `${y.split(" ")[1]} ${y.split(" ")[2]}`,
        });
        const mailerOption = {
            from: `${user.schoolName} 📘📘📘 <codelabbest@gmail.com>`,
            to: user.parentEmail,
            subject: `${user === null || user === void 0 ? void 0 : user.studentFirstName} just Clocked in`,
            html,
        };
        yield transporter.sendMail(mailerOption).then(() => {
            console.log("sent");
        });
    }
    catch (error) {
        console.error();
    }
});
exports.clockingInEmail = clockingInEmail;
const clockingOutEmail = (user, school) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientSecret: GOOGLE_SECRET,
                clientId: GOOGLE_ID,
                refreshToken: GOOGLE_REFRESH,
                accessToken,
            },
        });
        const myPath = path_1.default.join(__dirname, "../views/clockoutMail.ejs");
        const x = user === null || user === void 0 ? void 0 : user.clockOutTime.split(",");
        const y = x[2].trim();
        const html = yield ejs_1.default.renderFile(myPath, {
            clockin: user.clockInTime,
            parent: user.studentLastName,
            child: user.studentFirstName,
            address: school === null || school === void 0 ? void 0 : school.address,
            school: school === null || school === void 0 ? void 0 : school.schoolName,
            phone: school === null || school === void 0 ? void 0 : school.phone,
            date: `${x[0]} ${x[1]} ${y.split(" ")[0]}`,
            time: `${y.split(" ")[1]} ${y.split(" ")[2]}`,
        });
        const mailerOption = {
            from: `${user.schoolName} 📘📘📘 <codelabbest@gmail.com>`,
            to: user.parentEmail,
            subject: `${user === null || user === void 0 ? void 0 : user.studentFirstName} just Clocked Out`,
            html,
        };
        yield transporter.sendMail(mailerOption);
    }
    catch (error) {
        console.error();
    }
});
exports.clockingOutEmail = clockingOutEmail;
const sendWeeklyReport = (user, school, remark) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = (yield oAuth.getAccessToken()).token;
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "codelabbest@gmail.com",
                clientSecret: GOOGLE_SECRET,
                clientId: GOOGLE_ID,
                refreshToken: GOOGLE_REFRESH,
                accessToken,
            },
        });
        const myPath = path_1.default.join(__dirname, "../views/weeklyReport.ejs");
        // const x = user?.clockInTime.split(",");
        // const y = x[2].trim();
        let link = `${url}/report`;
        const html = yield ejs_1.default.renderFile(myPath, {
            parent: user.studentLastName,
            studentName: user.studentFirstName,
            address: school === null || school === void 0 ? void 0 : school.address,
            school: school === null || school === void 0 ? void 0 : school.schoolName,
            phone: school === null || school === void 0 ? void 0 : school.phone,
            date: (0, moment_1.default)(remark === null || remark === void 0 ? void 0 : remark.createdAt).format("LL"),
            attendance: parseInt(remark === null || remark === void 0 ? void 0 : remark.attendanceRatio) * 20,
            best: remark === null || remark === void 0 ? void 0 : remark.best,
            worst: remark === null || remark === void 0 ? void 0 : remark.worst,
            link,
            classParticipation: remark === null || remark === void 0 ? void 0 : remark.classParticipation,
            sportParticipation: remark === null || remark === void 0 ? void 0 : remark.sportParticipation,
        });
        const mailerOption = {
            from: `${user.schoolName} 📘📘📘 <codelabbest@gmail.com>`,
            to: user.parentEmail,
            subject: `${user === null || user === void 0 ? void 0 : user.studentFirstName} Weekly Academic Performance Report`,
            html,
        };
        yield transporter.sendMail(mailerOption).then(() => {
            console.log("sent");
        });
    }
    catch (error) {
        console.error();
    }
});
exports.sendWeeklyReport = sendWeeklyReport;
