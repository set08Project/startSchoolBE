import { Document, Model, Schema, Types, model } from "mongoose";

interface iStaff {
  subjectTitle: string;
  subjectID: string;
  subjectTeacher: string;
  studentName: string;
  studentAvatar: string;
  className: string;
  studentGrade: string;
  quizID: string;
  remark: string;
  quizDone: boolean;

  studentScore: number;
  performanceRating: number;

  paymentID: string;

  student: {};
  quiz: {};
  subject: {};
}

interface iStaffData extends iStaff, Document {}

const performanceModel = new Schema<iStaffData>(
  {
    quizID: {
      type: String,
    },
    remark: {
      type: String,
    },
    quizDone: {
      type: Boolean,
      default: false,
    },

    className: {
      type: String,
    },

    subjectTitle: {
      type: String,
    },
    subjectID: {
      type: String,
    },

    studentName: {
      type: String,
    },
    studentAvatar: {
      type: String,
    },

    subjectTeacher: {
      type: String,
    },

    studentGrade: {
      type: String,
    },

    studentScore: {
      type: Number,
    },

    performanceRating: {
      type: Number,
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },
    quiz: {
      type: Types.ObjectId,
      ref: "quizes",
    },
    subject: {
      type: Types.ObjectId,
      ref: "subjects",
    },
  },
  { timestamps: true }
);

export default model<iStaffData>("performances", performanceModel);
