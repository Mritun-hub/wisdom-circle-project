import mongoose from "mongoose";
import { TOPICS } from "./Post.js";

const discussionSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 8000 },
    topics: [{ type: String, enum: TOPICS }],
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

discussionSchema.index({ createdAt: -1 });

export const Discussion = mongoose.model("Discussion", discussionSchema);
