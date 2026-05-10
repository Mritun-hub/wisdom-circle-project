import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 4000 },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DiscussionReply = mongoose.model("DiscussionReply", replySchema);
