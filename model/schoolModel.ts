import { Types } from "mongoose";
import { Document, Schema, model } from "mongoose";

interface iSchool {
  started: boolean;

  email: string;
  verify: boolean;
  enrollmentID: string;
  status: string;

  schoolName: string;
  address: string;

  avatar: string;
  avatarID: string;

  plan: string;

  session: Array<{}>;
  staff: Array<{}>;
  lessonNotes: Array<{}>;

  schoolTags: Array<{}>;

  subjects: Array<{}>;
  classRooms: Array<{}>;

  payments: Array<{}>;
  announcements: Array<{}>;
  events: Array<{}>;
  students: Array<{}>;
}

interface iSchoolData extends iSchool, Document {}

const schoolModel = new Schema<iSchoolData>(
  {
    started: {
      type: Boolean,
      default: false,
    },
    avatar: {
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
        ref: "sessions",
      },
    ],
    events: [
      {
        type: Types.ObjectId,
        ref: "events",
      },
    ],

    announcements: [
      {
        type: Types.ObjectId,
        ref: "announcements",
      },
    ],

    subjects: [
      {
        type: Types.ObjectId,
        ref: "subjects",
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

    lessonNotes: [
      {
        type: Types.ObjectId,
        ref: "students",
      },
    ],
  },
  { timestamps: true }
);

export default model<iSchoolData>("schools", schoolModel);
