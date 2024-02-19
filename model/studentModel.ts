import { Document, Schema, Types, model } from "mongoose";

interface iStudent {
  totalPerformance: number;
  studentLastName: string;
  studentFirstName: string;
  studentAddress: string;
  schoolName: string;
  gender: string;
  classAssigned: string;
  schoolIDs: string;

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
  performance: Array<{}>;
  school: {};
  classroom: {};
  assignmentResolve: Array<{}>;
}

interface iStudentData extends iStudent, Document {}

const studentModel = new Schema<iStudentData>(
  {
    schoolIDs: {
      type: String,
    },
    password: {
      type: String,
    },
    studentFirstName: {
      type: String,
    },
    studentLastName: {
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

    performance: [
      {
        type: Types.ObjectId,
        ref: "performances",
      },
    ],

    assignmentResolve: [
      {
        type: Types.ObjectId,
        ref: "resolvs",
      },
    ],
  },
  { timestamps: true }
);

export default model<iStudentData>("students", studentModel);
