import { Router } from "express";
import { Discussion } from "../models/Discussion.js";
import { DiscussionReply } from "../models/DiscussionReply.js";
import { User } from "../models/User.js";
import { TOPICS } from "../models/Post.js";
import { authRequired, authOptional } from "../middleware/auth.js";
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

function serializeDiscussion(doc, authorUser) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    content: doc.content,
    topics: doc.topics || [],
    isAnonymous: doc.isAnonymous,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    author: displayAuthor(authorUser, doc.isAnonymous, authorUser?.anonymousDisplayName),
  };
}

router.get("/", authOptional, async (req, res) => {
  try {
    const { topic, q, page = "1", limit = "15" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const filter = {};
    if (topic && TOPICS.includes(topic)) filter.topics = topic;
    if (q && String(q).trim()) {
      const esc = String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ title: new RegExp(esc, "i") }, { content: new RegExp(esc, "i") }];
    }
    const skip = (pageNum - 1) * lim;
    const rows = await Discussion.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean();
    const authorIds = [...new Set(rows.map((r) => r.author.toString()))];
    const authors = await User.find({ _id: { $in: authorIds } }).lean();
    const byId = Object.fromEntries(authors.map((a) => [a._id.toString(), a]));
    const discussions = rows.map((d) => serializeDiscussion(d, byId[d.author.toString()]));
    const replyCounts = await DiscussionReply.aggregate([
      { $match: { discussion: { $in: rows.map((r) => r._id) } } },
      { $group: { _id: "$discussion", count: { $sum: 1 } } },
    ]);
    const rcMap = Object.fromEntries(replyCounts.map((x) => [x._id.toString(), x.count]));
    discussions.forEach((d) => {
      d.replyCount = rcMap[d.id] || 0;
    });
    res.json({ discussions, page: pageNum, hasMore: rows.length === lim });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load discussions" });
  }
});

router.post("/", authRequired, async (req, res) => {
  try {
    const { title, content, isAnonymous } = req.body;
    const topics = parseTopics(req.body.topics);
    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required" });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const d = await Discussion.create({
      author: req.userId,
      title: String(title).slice(0, 200),
      content: String(content).slice(0, 8000),
      topics,
      isAnonymous: isAnonymous === true || isAnonymous === "true",
    });
    const doc = d.toObject();
    res.status(201).json({ discussion: { ...serializeDiscussion(doc, user), replyCount: 0 } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create discussion" });
  }
});

router.get("/:id/replies", authOptional, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    const replies = await DiscussionReply.find({ discussion: discussion._id }).sort({ createdAt: 1 }).lean();
    const authorIds = [...new Set(replies.map((r) => r.author.toString()))];
    const authors = await User.find({ _id: { $in: authorIds } }).lean();
    const byId = Object.fromEntries(authors.map((a) => [a._id.toString(), a]));
    const out = replies.map((r) => ({
      id: r._id.toString(),
      content: r.content,
      createdAt: r.createdAt,
      ...displayAuthor(byId[r.author.toString()], r.isAnonymous, byId[r.author.toString()]?.anonymousDisplayName),
    }));
    res.json({ replies: out });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load replies" });
  }
});

router.post("/:id/replies", authRequired, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    const { content, isAnonymous } = req.body;
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: "content is required" });
    }
    const user = await User.findById(req.userId);
    const reply = await DiscussionReply.create({
      discussion: discussion._id,
      author: req.userId,
      content: String(content).slice(0, 4000),
      isAnonymous: isAnonymous === true || isAnonymous === "true",
    });
    const r = reply.toObject();
    res.status(201).json({
      reply: {
        id: r._id.toString(),
        content: r.content,
        createdAt: r.createdAt,
        ...displayAuthor(user, r.isAnonymous, user?.anonymousDisplayName),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to add reply" });
  }
});

router.get("/:id", authOptional, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id).lean();
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    const author = await User.findById(discussion.author).lean();
    const replyCount = await DiscussionReply.countDocuments({ discussion: discussion._id });
    res.json({
      discussion: { ...serializeDiscussion(discussion, author), replyCount },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load discussion" });
  }
});

export default router;
