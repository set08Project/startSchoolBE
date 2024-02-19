import { Application, NextFunction, Request, Response } from "express";
import school from "./router/schoolRouter";
import session from "./router/sessionRouter";
import staff from "./router/staffRouter";
import payment from "./router/paymentRouter";
import classes from "./router/classRouter";
import subject from "./router/subjectRouter";
import event from "./router/anouncementRouter";
import performance from "./router/performanceRouter";

import student from "./router/studentRouter";
import timetable from "./router/timeTableRouter";
import attendance from "./router/attendanceRouter";
import quiz from "./router/quizRouter";
import lessonNote from "./router/lessonNoteRouter";
import assignment from "./router/assignmentResolveRouter";

import cronParser from "cron-parser";

import { HTTP } from "./utils/enums";
import { mainError } from "./error/mianError";
import { handleError } from "./error/handleError";
import cron from "node-cron";

export const mainApp = (app: Application) => {
  try {
    app.use("/api", school);
    app.use("/api", session);
    app.use("/api", staff);
    app.use("/api", payment);
    app.use("/api", classes);
    app.use("/api", subject);
    app.use("/api", event);
    app.use("/api", attendance);
    app.use("/api", quiz);
    app.use("/api", lessonNote);
    app.use("/api", performance);

    app.use("/api", student);
    app.use("/api", timetable);
    app.use("/api", assignment);

    app.get("/", (req: Request, res: Response) => {
      try {
        let { started } = req.body;

        function addTimeToCron(cronExpression: any, additionalMinutes: any) {
          try {
            // Parse the cron expression
            const interval = cronParser.parseExpression(cronExpression);

            // Get the next scheduled time
            const nextTime = interval.next().toDate();

            // Add additional minutes
            const newTime = new Date(
              // nextTime.getTime() + additionalMinutes * 60000
              nextTime.setFullYear(nextTime.getFullYear() + additionalMinutes)
            );

            // Output the result
            console.log(`Original cron expression: ${cronExpression}`);
            console.log(`Next scheduled time: ${nextTime}`);
            console.log(
              `New time after adding ${additionalMinutes} minutes: ${newTime}`
            );
          } catch (err: any) {
            console.error(`Error parsing cron expression: ${err.message}`);
          }
        }

        // Example usage
        const originalCronExpression = "0 0 0 0 0";
        const additionalMinutes = started;

        // addTimeToCron(originalCronExpression, additionalMinutes);

        cron.schedule("0 0 0 * * *", () => {
          let currentDate = new Date();

          currentDate.setFullYear(currentDate.getFullYear() + 1);

          console.log("New date:", currentDate);
        });

        return res.status(200).json({
          message: "School API",
        });
      } catch (error) {
        return res.status(404).json({
          message: "Error loading",
        });
      }
    });

    app.all("*", (req: Request, res: Response, next: NextFunction) => {
      next(
        new mainError({
          name: `Route Error`,
          message: `Route Error: because the page, ${req.originalUrl} doesn't exist`,
          status: HTTP.BAD_REQUEST,
          success: false,
        })
      );
    });

    app.use(handleError);
  } catch (error) {
    return error;
  }
};
