import { Document, Model, Schema, Types, model } from "mongoose";

interface iStaff {
  staffName: string;
  schoolName: string;
  staffRole: string;

  classesAssigned: Array<string>;
  subjectAssigned: Array<string>;

  phone: string;
  school: {};
}

interface iStaffData extends iStaff, Document {}

const staffModel = new Schema<iStaffData>(
  {
    schoolName: {
      type: String,
    },
    staffName: {
      type: String,
    },
    staffRole: {
      type: String,
    },

    classesAssigned: {
      type: [],
    },

    subjectAssigned: {
      type: [],
    },

    phone: {
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
