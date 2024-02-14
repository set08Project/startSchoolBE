import { Document, Schema, Types, model } from "mongoose";

interface iStudent {
  totalPerformance: number;
  studentName: string;
  studentAddress: string;
  schoolName: string;
  gender: string;
  classAssigned: string;

  started: boolean;
  status: string;
  enrollmentID: string;
  schoolID: string;
  password: string;
  email: string;
  phone: string;
  studentAvatar: string;
  studentAvatarID: string;
  attendance: Array<{}>;
  school: {};
  classroom: {};
}

interface iStudentData extends iStudent, Document {}

const studentModel = new Schema<iStudentData>(
  {
    password: {
      type: String,
    },

    totalPerformance: {
      type: Number,
    },

    classAssigned: {
      type: String,
    },

    gender: {
      type: String,
    },

    email: {
      type: String,
    },

    schoolName: {
      type: String,
    },

    started: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
    },

    studentName: {
      type: String,
    },

    enrollmentID: {
      type: String,
    },

    schoolID: {
      type: String,
    },

    studentAddress: {
      type: String,
    },

    studentAvatar: {
      type: String,
    },

    studentAvatarID: {
      type: String,
    },

    phone: {
      type: String,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },

    classroom: {
      type: Types.ObjectId,
      ref: "classes",
    },

    attendance: [
      {
        type: Types.ObjectId,
        ref: "attendances",
      },
    ],
  },
  { timestamps: true }
);

export default model<iStudentData>("students", studentModel);
