import { Document, Model, Schema, Types, model } from "mongoose";

interface iSubject {
  schoolName: string;
  teacherID: string;
  subjectTeacherName: string;
  subjectTitle: string;
  designated: string;
  quiz: Array<{}>;
  assignment: Array<{}>;
  assignmentResolve: Array<{}>;

  subjectPerformance: number;
  school: {};
  class: {};
  classDetails: {};
  performance: Array<{}>;
}

interface iSubjectData extends iSubject, Document {}

const subjectModel = new Schema<iSubjectData>(
  {
    assignmentResolve: [
      {
        type: Types.ObjectId,
        ref: "resolvs",
      },
    ],
    quiz: [
      {
        type: Types.ObjectId,
        ref: "quizes",
      },
    ],
    assignment: [
      {
        type: Types.ObjectId,
        ref: "assignments",
      },
    ],

    performance: [
      {
        type: Types.ObjectId,
        ref: "performances",
      },
    ],
    teacherID: {
      type: String,
    },
    schoolName: {
      type: String,
    },
    subjectTeacherName: {
      type: String,
    },
    subjectTitle: {
      type: String,
    },
    designated: {
      type: String,
    },
    classDetails: {
      type: {},
    },

    subjectPerformance: {
      type: Number,
      default: 0,
    },

    school: {
      type: Types.ObjectId,
      ref: "schools",
    },

    class: {
      type: Types.ObjectId,
      ref: "classes",
    },
  },
  { timestamps: true }
);

export default model<iSubjectData>("subjects", subjectModel);
