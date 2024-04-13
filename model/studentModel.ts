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
  avatar: string;
  avatarID: string;

  presentClassID: string;

  records: any;

  feesPaid1st: boolean;
  feesPaid2nd: boolean;
  feesPaid3rd: boolean;

  started: boolean;
  status: string;
  enrollmentID: string;
  schoolID: string;
  password: string;
  email: string;
  parentEmail: string;
  phone: string;
  studentAvatar: string;
  studentAvatarID: string;
  attendance: Array<{}>;
  performance: Array<{}>;
  history: Array<{}>;
  reportCard: Array<{}>;
  pastQuestionHistory: Array<{}>;

  weekStudent: {};

  school: {};
  classroom: {};
  assignmentResolve: Array<{}>;
  remark: Array<{}>;
  articles: Array<{}>;
  complain: Array<{}>;
  purchaseHistory: Array<{}>;
  schoolFeesHistory: Array<{}>;
}

interface iStudentData extends iStudent, Document {}

const studentModel = new Schema<iStudentData>(
  {
    feesPaid1st: {
      type: Boolean,
      default: false,
    },
    records: {
      type: Array<any>,
    },

    feesPaid2nd: {
      type: Boolean,
      default: false,
    },

    feesPaid3rd: {
      type: Boolean,
      default: false,
    },

    schoolIDs: {
      type: String,
    },

    presentClassID: {
      type: String,
    },

    avatar: {
      type: String,
    },

    avatarID: {
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

    parentEmail: {
      type: String,
      default: "",
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
    history: [
      {
        type: Types.ObjectId,
        ref: "historys",
      },
    ],

    performance: [
      {
        type: Types.ObjectId,
        ref: "performances",
        default: [],
      },
    ],

    assignmentResolve: [
      {
        type: Types.ObjectId,
        ref: "resolvs",
      },
    ],

    remark: [
      {
        type: Types.ObjectId,
        ref: "remarks",
      },
    ],

    articles: [
      {
        type: Types.ObjectId,
        ref: "articles",
      },
    ],

    complain: [
      {
        type: Types.ObjectId,
        ref: "complains",
      },
    ],

    reportCard: [
      {
        type: Types.ObjectId,
        ref: "myReportCards",
      },
    ],
    pastQuestionHistory: [
      {
        type: Types.ObjectId,
        ref: "pquestions",
      },
    ],
    purchaseHistory: [
      {
        type: Types.ObjectId,
        ref: "purchasedHistories",
      },
    ],
    schoolFeesHistory: [
      {
        type: Types.ObjectId,
        ref: "schoolFeesHistories",
      },
    ],
  },
  { timestamps: true }
);

export default model<iStudentData>("students", studentModel);
