"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainApp = void 0;
const schoolRouter_1 = __importDefault(require("./router/schoolRouter"));
const sessionRouter_1 = __importDefault(require("./router/sessionRouter"));
const staffRouter_1 = __importDefault(require("./router/staffRouter"));
const paymentRouter_1 = __importDefault(require("./router/paymentRouter"));
const classRouter_1 = __importDefault(require("./router/classRouter"));
const subjectRouter_1 = __importDefault(require("./router/subjectRouter"));
const anouncementRouter_1 = __importDefault(require("./router/anouncementRouter"));
const performanceRouter_1 = __importDefault(require("./router/performanceRouter"));
const articleRouter_1 = __importDefault(require("./router/articleRouter"));
const studentRouter_1 = __importDefault(require("./router/studentRouter"));
const timeTableRouter_1 = __importDefault(require("./router/timeTableRouter"));
const attendanceRouter_1 = __importDefault(require("./router/attendanceRouter"));
const quizRouter_1 = __importDefault(require("./router/quizRouter"));
const lessonNoteRouter_1 = __importDefault(require("./router/lessonNoteRouter"));
const assignmentResolveRouter_1 = __importDefault(require("./router/assignmentResolveRouter"));
const remarkRouter_1 = __importDefault(require("./router/remarkRouter"));
const storeRouter_1 = __importDefault(require("./router/storeRouter"));
const gallaryRouter_1 = __importDefault(require("./router/gallaryRouter"));
const complainRouter_1 = __importDefault(require("./router/complainRouter"));
const reportCardRouter_1 = __importDefault(require("./router/reportCardRouter"));
const pastQuestionRouter_1 = __importDefault(require("./router/pastQuestionRouter"));
const cron_parser_1 = __importDefault(require("cron-parser"));
const enums_1 = require("./utils/enums");
const mianError_1 = require("./error/mianError");
const handleError_1 = require("./error/handleError");
const node_cron_1 = __importDefault(require("node-cron"));
const mainApp = (app) => {
    try {
        app.use("/api", schoolRouter_1.default);
        app.use("/api", sessionRouter_1.default);
        app.use("/api", staffRouter_1.default);
        app.use("/api", paymentRouter_1.default);
        app.use("/api", classRouter_1.default);
        app.use("/api", subjectRouter_1.default);
        app.use("/api", anouncementRouter_1.default);
        app.use("/api", attendanceRouter_1.default);
        app.use("/api", quizRouter_1.default);
        app.use("/api", lessonNoteRouter_1.default);
        app.use("/api", performanceRouter_1.default);
        app.use("/api", remarkRouter_1.default);
        app.use("/api", storeRouter_1.default);
        app.use("/api", articleRouter_1.default);
        app.use("/api", reportCardRouter_1.default);
        app.use("/api", pastQuestionRouter_1.default);
        app.use("/api", studentRouter_1.default);
        app.use("/api", timeTableRouter_1.default);
        app.use("/api", assignmentResolveRouter_1.default);
        app.use("/api", gallaryRouter_1.default);
        app.use("/api", complainRouter_1.default);
        app.get("/", (req, res) => {
            try {
                let { started } = req.body;
                function addTimeToCron(cronExpression, additionalMinutes) {
                    try {
                        // Parse the cron expression
                        const interval = cron_parser_1.default.parseExpression(cronExpression);
                        // Get the next scheduled time
                        const nextTime = interval.next().toDate();
                        // Add additional minutes
                        const newTime = new Date(
                        // nextTime.getTime() + additionalMinutes * 60000
                        nextTime.setFullYear(nextTime.getFullYear() + additionalMinutes));
                        // Output the result
                        console.log(`Original cron expression: ${cronExpression}`);
                        console.log(`Next scheduled time: ${nextTime}`);
                        console.log(`New time after adding ${additionalMinutes} minutes: ${newTime}`);
                    }
                    catch (err) {
                        console.error(`Error parsing cron expression: ${err.message}`);
                    }
                }
                // Example usage
                const originalCronExpression = "0 0 0 0 0";
                const additionalMinutes = started;
                // addTimeToCron(originalCronExpression, additionalMinutes);
                node_cron_1.default.schedule("0 0 0 * * *", () => {
                    let currentDate = new Date();
                    currentDate.setFullYear(currentDate.getFullYear() + 1);
                    console.log("New date:", currentDate);
                });
                return res.status(200).json({
                    message: "School API",
                });
            }
            catch (error) {
                return res.status(404).json({
                    message: "Error loading",
                });
            }
        });
        app.all("*", (req, res, next) => {
            next(new mianError_1.mainError({
                name: `Route Error`,
                message: `Route Error: because the page, ${req.originalUrl} doesn't exist`,
                status: enums_1.HTTP.BAD_REQUEST,
                success: false,
            }));
        });
        app.use(handleError_1.handleError);
    }
    catch (error) {
        return error;
    }
};
exports.mainApp = mainApp;
