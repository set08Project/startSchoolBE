import { Document, Schema, Types, model } from "mongoose";

interface ilessonNote {
  week: string;
  endingAt: string;
  createDate: string;
  subject: string;
  classes: string;
  term: string;
  subTopic: string;
  period: string;
  duration: string;
  instructionalMaterial: string;
  referenceMaterial: string;
  previousKnowledge: string;
  specificObjectives: string;
  content: string;
  evalution: string;
  summary: string;
  presentation: string;
  assignment: string;
  adminSignation: boolean;
  staff: {};
  school: {};
}

interface ilessonNoteData extends ilessonNote, Document {}

const lessonNoteModel = new Schema<ilessonNoteData>(
  {
    week: {
      type: String,
    },

    endingAt: {
      type: String,
    },

    createDate: {
      type: String,
    },
    classes: {
      type: String,
    },
    subTopic: {
      type: String,
    },
    period: {
      type: String,
    },
    duration: {
      type: String,
    },
    instructionalMaterial: {
      type: String,
    },
    referenceMaterial: {
      type: String,
    },
    previousKnowledge: {
      type: String,
    },
    specificObjectives: {
      type: String,
    },
    content: {
      type: String,
    },
    evalution: {
      type: String,
    },
    summary: {
      type: String,
    },
    presentation: {
      type: String,
    },
    term: {
      type: String,
    },
    assignment: {
      type: String,
    },
    adminSignation: {
      type: Boolean,
      default: false,
    },

    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },
    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<ilessonNoteData>("lessonNotes", lessonNoteModel);
