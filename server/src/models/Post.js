import mongoose from "mongoose";

export const POST_TYPES = ["mistake", "lesson", "experience"];
export const TOPICS = ["career", "relationships", "mental-health", "education", "life-decisions"];

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    content: { type: String, required: true, maxlength: 10000 },
    postType: { type: String, enum: POST_TYPES, required: true },
    topics: [{ type: String, enum: TOPICS }],
    images: [{ type: String }],
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ topics: 1 });

export const Post = mongoose.model("Post", postSchema);
