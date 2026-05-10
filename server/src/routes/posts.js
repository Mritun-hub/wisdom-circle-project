import { Router } from "express";
import path from "path";
import { Post, POST_TYPES, TOPICS } from "../models/Post.js";
import { Comment } from "../models/Comment.js";
import { Like } from "../models/Like.js";
import { User } from "../models/User.js";
import { authRequired, authOptional } from "../middleware/auth.js";
import { uploadPostImages } from "../middleware/upload.js";
import { displayAuthor } from "../utils/serialize.js";

const router = Router();

function parseTopics(raw) {
  if (!raw) return [];
  let arr = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr.filter((t) => TOPICS.includes(t));
}

async function attachCountsAndLiked(postIds, userId) {
  const [likeCounts, commentCounts, myLikes] = await Promise.all([
    Like.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]),
    Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]),
    userId
      ? Like.find({ user: userId, post: { $in: postIds } }).select("post").lean()
      : Promise.resolve([]),
  ]);
  const likeMap = Object.fromEntries(likeCounts.map((x) => [x._id.toString(), x.count]));
  const commentMap = Object.fromEntries(commentCounts.map((x) => [x._id.toString(), x.count]));
  const likedSet = new Set(myLikes.map((l) => l.post.toString()));
  return { likeMap, commentMap, likedSet };
}

function serializePost(doc, authorUser, counts, viewerUserId) {
  const id = doc._id.toString();
  const images = (doc.images || []).map((img) => `/uploads/${path.basename(img)}`);
  const authorId = doc.author?.toString?.() ?? doc.author;
  const isAuthor = Boolean(viewerUserId && authorId && authorId === viewerUserId.toString());
  return {
    id,
    title: doc.title || "",
    content: doc.content,
    postType: doc.postType,
    topics: doc.topics || [],
    images,
    isAnonymous: doc.isAnonymous,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    author: displayAuthor(authorUser, doc.isAnonymous, authorUser?.anonymousDisplayName),
    likeCount: counts.likeMap[id] || 0,
    commentCount: counts.commentMap[id] || 0,
    likedByMe: counts.likedSet.has(id),
    isAuthor,
  };
}

router.get("/", authOptional, async (req, res) => {
  try {
    const { topic, q, postType, page = "1", limit = "15" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const filter = {};
    if (topic && TOPICS.includes(topic)) filter.topics = topic;
    if (postType && POST_TYPES.includes(postType)) filter.postType = postType;
    if (q && String(q).trim()) {
      filter.$or = [
        { content: new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
        { title: new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      ];
    }
    const skip = (pageNum - 1) * lim;
    const posts = await Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean();
    const authorIds = [...new Set(posts.map((row) => row.author.toString()))];
    const authors = await User.find({ _id: { $in: authorIds } }).lean();
    const authorById = Object.fromEntries(authors.map((a) => [a._id.toString(), a]));
    const postIds = posts.map((row) => row._id);
    const counts = await attachCountsAndLiked(postIds, req.userId);
    const out = posts.map((post) =>
      serializePost(post, authorById[post.author.toString()], counts, req.userId)
    );
    res.json({ posts: out, page: pageNum, hasMore: posts.length === lim });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load posts" });
  }
});

router.post("/", authRequired, (req, res, next) => {
  uploadPostImages.array("images", 6)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || "Invalid upload" });
    next();
  });
}, async (req, res) => {
  try {
    const { title, content, postType, isAnonymous } = req.body;
    const topics = parseTopics(req.body.topics);
    if (!content || !postType) {
      return res.status(400).json({ error: "content and postType are required" });
    }
    if (!POST_TYPES.includes(postType)) {
      return res.status(400).json({ error: `postType must be one of: ${POST_TYPES.join(", ")}` });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const files = req.files || [];
    const imagePaths = files.map((f) => f.filename);

    const post = await Post.create({
      author: req.userId,
      title: title ? String(title).slice(0, 120) : "",
      content: String(content).slice(0, 10000),
      postType,
      topics,
      images: imagePaths,
      isAnonymous: isAnonymous === true || isAnonymous === "true",
    });
    const counts = await attachCountsAndLiked([post._id], req.userId);
    res.status(201).json({
      post: serializePost(post.toObject(), user, counts, req.userId),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.get("/explore", authOptional, async (req, res) => {
  try {
    const { topic, mood, q, page = "1", limit = "15" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const filter = {};
    if (topic && topic !== "all" && TOPICS.includes(topic)) filter.topics = topic;
    if (q && String(q).trim()) {
      filter.$or = [
        { content: new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
        { title: new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      ];
    }
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .lean();
    const totalCount = await Post.countDocuments(filter);
    const authorIds = [...new Set(posts.map((p) => p.author?.toString?.() ?? p.author).filter(Boolean))];
    const authors = await User.find({ _id: { $in: authorIds } }).lean();
    const byId = Object.fromEntries(authors.map((a) => [a._id.toString(), a]));
    const counts = await attachCountsAndLiked(
      posts.map((p) => p._id),
      req.userId
    );
    const serialized = posts.map((p) => serializePost(p, byId[p.author?.toString?.() ?? p.author], counts, req.userId));
    res.json({
      stories: serialized,
      hasMore: pageNum * lim < totalCount,
      total: totalCount,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load explore posts" });
  }
});

router.get("/:id/comments", authOptional, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 }).lean();
    const authorIds = [...new Set(comments.map((c) => c.author.toString()))];
    const authors = await User.find({ _id: { $in: authorIds } }).lean();
    const byId = Object.fromEntries(authors.map((a) => [a._id.toString(), a]));
    const out = comments.map((c) => ({
      id: c._id.toString(),
      content: c.content,
      createdAt: c.createdAt,
      ...displayAuthor(byId[c.author.toString()], c.isAnonymous, byId[c.author.toString()]?.anonymousDisplayName),
    }));
    res.json({ comments: out });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

router.post("/:id/comments", authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const { content, isAnonymous } = req.body;
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: "content is required" });
    }
    const user = await User.findById(req.userId);
    const comment = await Comment.create({
      post: post._id,
      author: req.userId,
      content: String(content).slice(0, 4000),
      isAnonymous: isAnonymous === true || isAnonymous === "true",
    });
    const c = comment.toObject();
    res.status(201).json({
      comment: {
        id: c._id.toString(),
        content: c.content,
        createdAt: c.createdAt,
        ...displayAuthor(user, c.isAnonymous, user?.anonymousDisplayName),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.post("/:id/like", authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const existing = await Like.findOne({ post: post._id, user: req.userId });
    if (existing) {
      await existing.deleteOne();
    } else {
      await Like.create({ post: post._id, user: req.userId });
    }
    const counts = await attachCountsAndLiked([post._id], req.userId);
    const author = await User.findById(post.author).lean();
    res.json({ post: serializePost(post.toObject(), author, counts, req.userId) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Like failed" });
  }
});

router.get("/:id", authOptional, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ error: "Post not found" });
    const author = await User.findById(post.author).lean();
    const counts = await attachCountsAndLiked([post._id], req.userId);
    res.json({ post: serializePost(post, author, counts, req.userId) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load post" });
  }
});

router.put("/:id", authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: "Not allowed" });
    }
    const { title, content, postType, isAnonymous } = req.body;
    if (typeof title === "string") post.title = title.slice(0, 120);
    if (typeof content === "string") post.content = content.slice(0, 10000);
    if (postType && POST_TYPES.includes(postType)) post.postType = postType;
    if (typeof isAnonymous === "boolean") post.isAnonymous = isAnonymous;
    if (req.body.topics !== undefined) post.topics = parseTopics(req.body.topics);
    await post.save();
    const author = await User.findById(post.author).lean();
    const counts = await attachCountsAndLiked([post._id], req.userId);
    res.json({ post: serializePost(post.toObject(), author, counts, req.userId) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/:id", authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: "Not allowed" });
    }
    await Promise.all([
      post.deleteOne(),
      Comment.deleteMany({ post: post._id }),
      Like.deleteMany({ post: post._id }),
    ]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
