import { Document, Schema, Types, model } from "mongoose";

interface iSessionHistroy {
  school: {};
}

interface iSessionHistoryData extends iSessionHistroy, Document {}

const sessionHistroyModel = new Schema<iSessionHistoryData>(
  {
    school: {
      type: Types.ObjectId,
      ref: "schools",
    },
  },
  { timestamps: true }
);

export default model<iSessionHistoryData>(
  "sessionHistroys",
  sessionHistroyModel
);
