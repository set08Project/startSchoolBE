import { Document, Model, Schema, Types, model } from "mongoose";

interface iStaff {
  staffName: string;
  schoolName: string;
  staffRole: string;
  staffAddress: string;
  schoolIDs: string;
  salary: number;
  avatar: string;
  avatarID: string;
  presentClassID: string;

  email: string;
  password: string;
  staffAvatar: string;
  staffAvatarID: string;
  enrollmentID: string;
  activeStatus: boolean;
  classesAssigned: [];

  subjectAssigned: Array<{}>;
  schedule: Array<{}>;
  reportCard: Array<{}>;
  attendance: Array<{}>;
  quiz: Array<{}>;
  lessonNotes: Array<{}>;
  assignment: Array<{}>;
  assignmentResolve: Array<{}>;
  remark: Array<{}>;
  complain: Array<{}>;
  purchaseHistory: Array<{}>;

  staffRating: number;
  status: string;
  phone: string;
  gender: string;
  school: {};
}

interface iStaffData extends iStaff, Document {}

const staffModel = new Schema<iStaffData>(
  {
    complain: [
      {
        type: Types.ObjectId,
        ref: "complains",
      },
    ],

    presentClassID: {
      type: String,
    },

    schoolIDs: {
      type: String,
    },
    gender: {
      type: String,
    },

    avatar: {
      type: String,
    },

    avatarID: {
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
      type: [],
    },

    subjectAssigned: {
      type: [],
    },

    schedule: [
      {
        type: Types.ObjectId,
        ref: "timeTables",
      },
    ],

    assignment: [
      {
        type: Types.ObjectId,
        ref: "assignments",
      },
    ],

    assignmentResolve: [
      {
        type: Types.ObjectId,
        ref: "resolves",
      },
    ],
    reportCard: [
      {
        type: Types.ObjectId,
        ref: "myReportCards",
      },
    ],

    purchaseHistory: [
      {
        type: Types.ObjectId,
        ref: "purchasedHistories",
      },
    ],

    attendance: [
      {
        type: Types.ObjectId,
        ref: "attendances",
      },
    ],

    lessonNotes: [
      {
        type: Types.ObjectId,
        ref: "lessonNotes",
      },
    ],

    remark: [
      {
        type: Types.ObjectId,
        ref: "remakes",
      },
    ],

    quiz: [
      {
        type: Types.ObjectId,
        ref: "quizes",
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
