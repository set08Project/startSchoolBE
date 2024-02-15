import { Document, Schema, Types, model } from "mongoose";

interface iTimeTable {
  quiz: {};
  subjectTitle: string;

  subject: {};
  staff: {};
}

interface iTimeTableData extends iTimeTable, Document {}

const quizModel = new Schema<iTimeTableData>(
  {
    quiz: {
      type: {},
    },
    subjectTitle: {
      type: String,
    },

    subject: {
      type: Types.ObjectId,
      ref: "subjects",
    },

    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },
  },
  { timestamps: true }
);

export default model<iTimeTableData>("quizes", quizModel);
