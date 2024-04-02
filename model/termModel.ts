import { Document, Schema, Types, model } from "mongoose";

interface iSessionTerm {
  year: string;
  term: string;
  presentTerm: string;

  classResult: any;

  totalStudents: number;
  studentFeesPaid: number;
  studentFeesNotPaid: number;
  numberOfTeachers: number;
  numberOfSubjects: number;
  totalAmountRecieved: number;
  profit: number;
  session: {};
}

interface iSessionTermData extends iSessionTerm, Document {}

const termModel = new Schema<iSessionTermData>(
  {
    year: {
      type: String,
    },

    presentTerm: {
      type: String,
    },

    classResult: {
      type: [],
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

    session: {
      type: Types.ObjectId,
      ref: "academicSessions",
    },
  },
  { timestamps: true }
);

export default model<iSessionTermData>("academicSessionsTerms", termModel);
