import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";

import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import { mainApp } from "./mainApp";
import { dbConfig } from "./utils/dbConfig";
dotenv.config();

// import { rateLimit } from "express-rate-limit";

import MongoDB from "connect-mongodb-session";

// const MongoDBStore = MongoDB(session);

// const store = new MongoDBStore({
//   uri: process.env.MONGO_DB_URL_LOCAL!,
//   collection: "sessions",
// });

const app: Application = express();
const portServer = process.env.PORT!;

const port = parseInt(portServer);

// cors headers starts

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
// [`${process.env.APP_URL_DEPLOY}`, "https://just-next.onrender.com"]
// cors headers ends

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 10,
//   message: "Limit exceeded, please try again in 15mins time!!!",
//   // standardHeaders: "draft-7",
//   // legacyHeaders: false, process.env.APP_URL_DEPLOY

// });
// app.use(
//   cors({
//     origin: [
//       process.env.APP_URL_DEPLOY as string,
//       "https://justnext-dev.vercel.app",
//       "https://justnext-dev.netlify.app",
//     ],
//   })
// );
app.use(
  cors({
    origin: [
      process.env.APP_URL_DEPLOY as string,
      "https://justnext-dev.vercel.app",
      "https://justnext-dev.netlify.app",
      "https://just-next.web.app",
    ],
  })
);
app.use(express.json());

app.use(helmet());
app.use(morgan("dev"));

// app.use(limiter)
app.use(cookieParser(process.env.SESSION_SECRET as string));
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,

    cookie: {
      maxAge: 1000 * 60 * 24 * 60,
      // sameSite: "lax",
      // secure: false,
      httpOnly: true,
      // domain: process.env.APP_URL_DEPLOY,
    },

    // store,
  })
);

mainApp(app);

//13.51.1.65/.well-known/pki-validation/F5F57A81136A32F3A3EB73DF8DB4BC06.txt

const server = app.listen(process.env.PORT || port, () => {
  console.clear();
  console.log();
  dbConfig();
});

process.on("uncaughtException", (error: Error) => {
  console.log("uncaughtException: ", error);

  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  console.log("unhandledRejection: ", reason);

  server.close(() => {
    process.exit(1);
  });
});
