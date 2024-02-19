import { Document, Model, Schema, Types, model } from "mongoose";

interface iClass {
  className: string;
  classTeacherName: string;
  teacherID: string;

  class1stFee: number;
  class2ndFee: number;
  class3rdFee: number;

  classPerformance: number;

  classSubjects: Array<{}>;
  classAttendence: Array<{}>;
  timeTable: Array<{}>;
  attendance: Array<{}>;

  students: Array<{}>;
  assignment: Array<{}>;
  assignmentResolve: Array<{}>;
  school: {};
}

interface iClassData extends iClass, Document {}

const classesModel = new Schema<iClassData>(
  {
    class1stFee: {
      type: Number,
    },

    class2ndFee: {
      type: Number,
    },

    class3rdFee: {
      type: Number,
    },

    className: {
      type: String,
    },

    teacherID: {
      type: String,
    },

    classTeacherName: {
      type: String,
    },
    classPerformance: {
      type: Number,
      default: 0,
    },

    classSubjects: [
      {
        type: Types.ObjectId,
        ref: "subjects",
      },
    ],

    classAttendence: [
      {
        type: Types.ObjectId,
        ref: "attendances",
      },
    ],

    assignment: [
      {
        type: Types.ObjectId,
        ref: "assignments",
      },
    ],

    students: [
      {
        type: Types.ObjectId,
        ref: "students",
      },
    ],

    attendance: [
      {
        type: Types.ObjectId,
        ref: "attendances",
      },
    ],

    assignmentResolve: [
      {
        type: Types.ObjectId,
        ref: "resolvs",
      },
    ],

    timeTable: [
      {
        type: Types.ObjectId,
        ref: "timeTables",
      },
    ],

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iClassData>("classes", classesModel);
