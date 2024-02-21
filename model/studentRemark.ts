import { Document, Schema, Types, model } from "mongoose";

interface iremake {
  remark: string;
  student: {};
  staff: {};
}

interface iremakeData extends iremake, Document {}

const remarkModel = new Schema<iremakeData>(
  {
    remark: {
      type: String,
    },

    student: {
      type: Types.ObjectId,
      ref: "students",
    },

    staff: {
      type: Types.ObjectId,
      ref: "staffs",
    },
  },
  { timestamps: true }
);

export default model<iremakeData>("remakes", remarkModel);
