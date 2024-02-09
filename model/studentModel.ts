import { Document, Model, Schema, Types, model } from "mongoose";

interface iStudent {
  studentName: string;
  studentAddress: string;
  schoolName: string;
  classAssigned: string;

  enrollmentID: string;
  schoolID: string;
  password: string;
  email: string;
  phone: string;
  studentAvatar: string;
  studentAvatarID: string;
  school: {};
}

interface iStudentData extends iStudent, Document {}

const studentModel = new Schema<iStudentData>(
  {
    password: {
      type: String,
    },
    email: {
      type: String,
    },
    schoolName: {
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
  },
  { timestamps: true }
);

export default model<iStudentData>("students", studentModel);
