import { Types } from "mongoose";
import { Document, Schema, model } from "mongoose";

interface iSchool {
  started: boolean;

  email: string;
  verify: boolean;
  enrollmentID: string;
  status: string;
  presentTerm: string;
  presentSession: string;

  name: string;
  name2: string;

  schoolName: string;
  address: string;
  freeMode: boolean;

  avatar: string;
  avatarID: string;

  plan: string;
  phone: string;

  bankDetails: {};

  session: Array<{}>;
  staff: Array<{}>;

  lessonNotes: Array<{}>;
  schoolTags: Array<{}>;

  receipt: [];

  subjects: Array<{}>;
  classRooms: Array<{}>;

  payments: Array<{}>;
  announcements: Array<{}>;
  historys: Array<{}>;
  events: Array<{}>;
  students: Array<{}>;
  store: Array<{}>;
  articles: Array<{}>;
  pushClass: Array<{}>;
  gallaries: Array<{}>;
  complain: Array<{}>;
  reportCard: Array<{}>;
  classHistory: Array<{}>;
  purchaseHistory: Array<{}>;
  schoolFeesHistory: Array<{}>;
}

interface iSchoolData extends iSchool, Document {}

const schoolModel = new Schema<iSchoolData>(
  {
    purchaseHistory: [
      {
        type: Types.ObjectId,
        ref: "purchasedHistories",
      },
    ],
    started: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
    },

    freeMode: {
      type: Boolean,
      default: true,
    },
    presentTerm: {
      type: String,
    },
    presentSession: {
      type: String,
    },

    name: {
      type: String,
    },

    name2: {
      type: String,
    },

    avatarID: {
      type: String,
    },

    address: {
      type: String,
    },

    plan: {
      type: String,
      default: "in active",
    },

    schoolName: {
      type: String,
    },
    bankDetails: {
      type: {},
    },
    status: {
      type: String,
    },
    enrollmentID: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    verify: {
      type: Boolean,
      default: false,
    },

    schoolTags: [
      {
        type: {},
      },
    ],

    session: [
      {
        type: Types.ObjectId,
        ref: "academicSessions",
      },
    ],

    schoolFeesHistory: [
      {
        type: Types.ObjectId,
        ref: "schoolFeesHistories",
      },
    ],
    historys: [
      {
        type: Types.ObjectId,
        ref: "historys",
      },
    ],
    events: [
      {
        type: Types.ObjectId,
        ref: "events",
      },
    ],

    classHistory: [
      {
        type: Types.ObjectId,
        ref: "classHistroy",
      },
    ],

    announcements: [
      {
        type: Types.ObjectId,
        ref: "announcements",
      },
    ],

    reportCard: [
      {
        type: Types.ObjectId,
        ref: "myReportCards",
      },
    ],

    subjects: [
      {
        type: Types.ObjectId,
        ref: "subjects",
      },
    ],

    complain: [
      {
        type: Types.ObjectId,
        ref: "complains",
      },
    ],

    pushClass: [
      {
        type: Types.ObjectId,
        ref: "classHistories",
      },
    ],

    classRooms: [
      {
        type: Types.ObjectId,
        ref: "classes",
      },
    ],

    staff: [
      {
        type: Types.ObjectId,
        ref: "staffs",
      },
    ],

    payments: [
      {
        type: Types.ObjectId,
        ref: "payments",
      },
    ],

    students: [
      {
        type: Types.ObjectId,
        ref: "students",
      },
    ],

    store: [
      {
        type: Types.ObjectId,
        ref: "stores",
      },
    ],

    receipt: {
      type: [],
    },

    lessonNotes: [
      {
        type: Types.ObjectId,
        ref: "lessonNotes",
      },
    ],

    articles: [
      {
        type: Types.ObjectId,
        ref: "articles",
      },
    ],

    gallaries: [
      {
        type: Types.ObjectId,
        ref: "gallaries",
      },
    ],
  },
  { timestamps: true }
);

export default model<iSchoolData>("schools", schoolModel);
