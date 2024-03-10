import { Document, Schema, Types, model } from "mongoose";

interface iCardReport {
  result: Array<{}>;
  approve: boolean;
  points: number;
  grade: string;
  classInfo: string;
  adminComment: string;
  classTeacherComment: string;

  school: {};
  student: {};
  classes: {};
  performance: Array<{}>;
}

interface iCardReportData extends iCardReport, Document {}

const cardRportModel = new Schema<iCardReportData>(
  {
    result: [
      {
        type: {},
      },
    ],

    approve: {
      type: Boolean,
      default: false,
    },

    points: {
      type: Number,
      default: 0,
    },

    classInfo: {
      type: String,
    },

    grade: {
      type: String,
      default: "Not Recorded Yet",
    },

    adminComment: {
      type: String,
    },

    classTeacherComment: {
      type: String,
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },

    classes: {
      type: Types.ObjectId,
      ref: "classes",
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iCardReportData>("myReportCards", cardRportModel);
