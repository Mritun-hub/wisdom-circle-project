import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 32 },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: "", maxlength: 500 },
    avatarUrl: { type: String, default: "" },
    /** When posting anonymously, show this label instead of username (optional). */
    anonymousDisplayName: { type: String, default: "Anonymous", maxlength: 40 },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
