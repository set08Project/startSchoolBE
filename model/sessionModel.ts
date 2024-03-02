import { Document, Schema, Types, model } from "mongoose";

interface iSession {
  year: string;
  term: string;
  totalStudents: number;
  studentFeesPaid: number;
  studentFeesNotPaid: number;
  numberOfTeachers: number;
  numberOfSubjects: number;
  totalAmountRecieved: number;
  profit: number;
}

interface iSessionData extends iSession, Document {}

const sessionModel = new Schema<iSessionData>(
  {
    year: {
      type: String,
    },

    term: {
      type: String,
    },

    studentFeesPaid: {
      type: Number,
      default: 0,
    },

    studentFeesNotPaid: {
      type: Number,
      default: 0,
    },

    numberOfTeachers: {
      type: Number,
      default: 0,
    },

    numberOfSubjects: {
      type: Number,
      default: 0,
    },

    totalStudents: {
      type: Number,
      default: 0,
    },

    totalAmountRecieved: {
      type: Number,
      default: 0,
    },

    profit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default model<iSessionData>("academicSessions", sessionModel);
