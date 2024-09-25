import { Document, Schema, model } from "mongoose";

interface LearningItem {
  id: string;
  value: Array<{}>;
}

interface iScheme {
  weeks: string;
  subject: string;
  classType: string;
  topics: string;
  term: string;
  learningObject: Array<LearningItem>; 
  learningActivities: Array<LearningItem>; 
  embeddedCoreSkills: Array<LearningItem>; 
  learningResource: Array<LearningItem>; 
}

interface iSchemeData extends iScheme, Document {}

const LearningItemSchema = new Schema<LearningItem>({
  id: { type: String },
  value: {
    type: [String, Object] || String,  
    required: true
  },
});

const SchemeModel = new Schema<iSchemeData>(
  {
    classType: {
      type: String,
      required: true,
    },
    weeks: {
      type: String,
      required: true,
    },
    topics: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      required: true,
    },
    learningObject: [LearningItemSchema],
    learningActivities: [LearningItemSchema],
    learningResource: [LearningItemSchema],
    embeddedCoreSkills: [LearningItemSchema],
  },
  { timestamps: true }
);

export default model<iSchemeData>("schemes", SchemeModel);
