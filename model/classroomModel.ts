import { Document, Model, Schema, Types, model } from "mongoose";

interface iClass {
  className: string;
  classTeacherName: string;
  classPerformance: number;

  classSubjects: Array<{}>;
  classStudents: Array<{}>;
  classAttendence: Array<{}>;

  school: {};
}

interface iClassData extends iClass, Document {}

const classesModel = new Schema<iClassData>(
  {
    className: {
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

    classStudents: [
      {
        type: Types.ObjectId,
        ref: "students",
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
