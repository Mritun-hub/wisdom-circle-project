import { Router } from "express";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { authRequired } from "../middleware/auth.js";
import { publicUser, displayAuthor } from "../utils/serialize.js";

const router = Router();

router.put("/me", authRequired, async (req, res) => {
  try {
    const { bio, anonymousDisplayName, username } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (typeof bio === "string") user.bio = bio.slice(0, 500);
    if (typeof anonymousDisplayName === "string") {
      user.anonymousDisplayName = anonymousDisplayName.trim().slice(0, 40) || "Anonymous";
    }
    if (typeof username === "string" && username.trim().length >= 2) {
      const taken = await User.findOne({ username: username.trim(), _id: { $ne: user._id } });
      if (taken) return res.status(409).json({ error: "Username taken" });
      user.username = username.trim().slice(0, 32);
    }
    await user.save();
    res.json({
      user: {
        ...publicUser(user),
        email: user.email,
        anonymousDisplayName: user.anonymousDisplayName,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Update failed" });
  }
});

router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const shaped = posts.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      content: p.content.slice(0, 280) + (p.content.length > 280 ? "…" : ""),
      postType: p.postType,
      topics: p.topics,
      images: p.images,
      isAnonymous: p.isAnonymous,
      createdAt: p.createdAt,
      author: displayAuthor(user, p.isAnonymous, user.anonymousDisplayName),
    }));

    res.json({
      user: publicUser(user),
      posts: shaped,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

export default router;
