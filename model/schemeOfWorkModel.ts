import { Document, Schema, Types, model } from "mongoose";

interface iScheme {
  week: string;
  subject: string;
  classType: string;
  term: string;

learningObject: Array<{}>;
learningActivities: Array<{}>;
embeddedCoreSkills: Array<{}>;
learningResource: Array<{}>;
}

interface iSchemeData extends iScheme, Document {}

const SchemeModel = new Schema<iSchemeData>(
  {
    classType: {
      type: String,
    },

    week: {
      type: String,
    },

    subject: {
      type: String,
    },

    term: {
      type: String,
    },

    learningObject: [
{
    type: {}
}
    ],
    learningActivities: [
{
    type: {}
}
    ],
    learningResource: [
{
    type: {}
}
    ],
    embeddedCoreSkills: [
{
    type: {}
}
    ],

    
  },
  { timestamps: true }
);

export default model<iSchemeData>("schemes", SchemeModel);
