import { Document, Model, Schema, Types, model } from "mongoose";

interface iArticle {
  content: string;
  title: string;
  student: string;
  desc: string;
}

interface iArticleData extends iArticle, Document {}

const articleModel = new Schema<iArticleData>(
  {
    content: {
      type: String,
    },

    title: {
      type: String,
    },

    student: {
      type: String,
    },

    desc: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model<iArticleData>("articles", articleModel);
