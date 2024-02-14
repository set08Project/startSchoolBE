import { Document, Model, Schema, Types, model } from "mongoose";

interface iStaff {
  staffName: string;
  schoolName: string;
  staffRole: string;
  staffAddress: string;
  salary: number;

  email: string;
  password: string;
  staffAvatar: string;
  staffAvatarID: string;
  enrollmentID: string;
  activeStatus: boolean;

  classesAssigned: string;
  subjectAssigned: Array<{}>;
  timeTables: Array<{}>;
  attendance: Array<{}>;

  staffRating: number;
  status: string;
  phone: string;
  gender: string;
  school: {};
}

interface iStaffData extends iStaff, Document {}

const staffModel = new Schema<iStaffData>(
  {
    gender: {
      type: String,
    },
    salary: {
      type: Number,
    },
    schoolName: {
      type: String,
    },
    enrollmentID: {
      type: String,
    },

    email: {
      type: String,
    },

    staffAddress: {
      type: String,
    },

    activeStatus: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
    },

    staffAvatar: {
      type: String,
    },

    staffAvatarID: {
      type: String,
    },

    staffName: {
      type: String,
    },

    staffRole: {
      type: String,
    },

    staffRating: {
      type: Number,
      default: 0,
    },

    classesAssigned: {
      type: String,
    },

    subjectAssigned: {
      type: [],
    },

    timeTables: [
      {
        type: Types.ObjectId,
        ref: "timeTables",
      },
    ],

    attendance: [
      {
        type: Types.ObjectId,
        ref: "attendances",
      },
    ],

    phone: {
      type: String,
    },

    status: {
      type: String,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iStaffData>("staffs", staffModel);
