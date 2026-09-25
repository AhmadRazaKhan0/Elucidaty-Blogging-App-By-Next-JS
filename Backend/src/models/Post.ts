import { Schema, model, models, Model } from "mongoose";

export interface IPost {
  _id: string; title: string; slug: string; excerpt: string; content: string; featuredImage: string;
  category: string; tags: string[]; author: string; status: "draft" | "published"; readingTime: number;
  createdAt: string; updatedAt: string; publishedAt?: string | null;
}

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 140 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    excerpt: { type: String, required: true, trim: true, minlength: 10, maxlength: 300 },
    content: { type: String, required: true, minlength: 20 },
    featuredImage: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    author: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    readingTime: { type: Number, default: 1 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default (models.Post as Model<IPost>) || model<IPost>("Post", PostSchema);
