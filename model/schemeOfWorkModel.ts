import { Document, Schema, model } from "mongoose";


interface LearningItem {
  id: string;
  value: Array<any> | string; 
}


interface iScheme {
  weeks: string;
  subject: string;
  classType: string;
  topics: Array<any>; 
  term: string;
  learningObject: Array<LearningItem>;
  learningActivities: Array<LearningItem>;
  embeddedCoreSkills: Array<LearningItem>;
  learningResource: Array<LearningItem>;
}


interface iSchemeData extends iScheme, Document {}


const LearningItemSchema = new Schema<LearningItem>({
  id: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true }, 
});


const SchemeModel = new Schema<iSchemeData>(
  {
    classType: { type: String, required: true },
    weeks: { type: String, required: true },
    topics: [{ type: Schema.Types.Mixed, required: true }], 
    subject: { type: String, required: true },
    term: { type: String },
    learningObject: [LearningItemSchema], 
    learningActivities: [LearningItemSchema],
    learningResource: [LearningItemSchema],
    embeddedCoreSkills: [LearningItemSchema],
  },
  { timestamps: true } 
);


export default model<iSchemeData>("Scheme", SchemeModel);
