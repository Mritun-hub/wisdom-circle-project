import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { topicLabel } from "../constants.js";
import "./DiscussionPage.css";

/* ── Time ago formatter ── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/* ── Topic icon map ── */
const TOPIC_ICONS = {
  career: "💼",
  relationships: "💛",
  "mental-health": "🧠",
  education: "📚",
  "life-decisions": "🔀",
};

/* ── Loading skeleton ── */
function DiscussionSkeleton() {
  return (
    <div className="disc-skeleton">
      <div className="disc-skel-header">
        <div className="disc-skel disc-skel-title" />
        <div className="disc-skel disc-skel-meta" />
        <div className="disc-skel disc-skel-content" />
      </div>
      <div className="disc-skel-divider" />
      <div className="disc-skel-replies">
        {[1, 2, 3].map((i) => (
          <div key={i} className="disc-skel-reply">
            <div className="disc-skel disc-skel-circle" />
            <div style={{ flex: 1 }}>
              <div className="disc-skel disc-skel-line" style={{ width: "40%" }} />
              <div
                className="disc-skel disc-skel-line"
                style={{ width: "100%", marginTop: 8 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Reply item ── */
function ReplyItem({ reply, depth = 0 }) {
  const author = reply.author || {};
  const initial = (author.displayName?.[0] || "?").toUpperCase();
  const isAnon = author.isAnonymous;

  return (
    <div className={`disc-reply disc-reply-depth-${Math.min(depth, 2)}`}>
      <div className="disc-reply-header">
        <div className="disc-reply-avatar">{isAnon ? "?" : initial}</div>
        <div className="disc-reply-meta">
          <span className="disc-reply-author">
            {author.displayName || "Member"}
          </span>
          {isAnon && <span className="disc-reply-anon-tag">Anonymous</span>}
          <span className="disc-reply-sep">·</span>
          <time className="disc-reply-time">{timeAgo(reply.createdAt)}</time>
        </div>
      </div>
      <div className="disc-reply-content">{reply.content}</div>
      <div className="disc-reply-actions">
        <button className="disc-reply-btn">👍 Like</button>
        <button className="disc-reply-btn">💬 Reply</button>
      </div>
    </div>
  );
}

/* ── Main Discussion Page ── */
export function DiscussionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDiscussion();
  }, [id]);

  async function loadDiscussion() {
    try {
      setLoading(true);
      const { data } = await api.get(`/discussions/${id}`);
      setDiscussion(data);

      // Fetch replies for this discussion
      const { data: repliesData } = await api.get(`/discussions/${id}/replies`);
      setReplies(repliesData || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load discussion");
    } finally {
      setLoading(false);
    }
  }

  async function handleReplySubmit(e) {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      await api.post(`/discussions/${id}/replies`, {
        content: replyText,
      });
      setReplyText("");
      loadDiscussion(); // Reload to get new replies
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <DiscussionSkeleton />;
  if (error) {
    return (
      <div className="disc-error">
        <div className="disc-error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/discussions")} className="disc-btn-primary">
          ← Back to Discussions
        </button>
      </div>
    );
  }
  if (!discussion) {
    return (
      <div className="disc-error">
        <h2>Discussion not found</h2>
        <button onClick={() => navigate("/discussions")} className="disc-btn-primary">
          ← Back to Discussions
        </button>
      </div>
    );
  }

  const author = discussion.author || {};
  const authorInitial = (author.displayName?.[0] || "?").toUpperCase();

  return (
    <div className="disc-container">
      <button
        onClick={() => navigate("/discussions")}
        className="disc-back-btn"
        title="Back to Discussions"
      >
        ← Back
      </button>

      {/* ── Header ── */}
      <header className="disc-header">
        <div className="disc-header-top">
          <div className="disc-avatar-lg">{author.isAnonymous ? "?" : authorInitial}</div>
          <div className="disc-header-info">
            <div className="disc-author-line">
              <h3 className="disc-author-name">{author.displayName || "Member"}</h3>
              {author.isAnonymous && <span className="disc-anon-badge">Anonymous</span>}
            </div>
            <p className="disc-header-meta">
              Started <time>{timeAgo(discussion.createdAt)}</time>
              <span className="disc-meta-sep">•</span>
              <span>{replies.length} replies</span>
            </p>
          </div>
        </div>

        <h1 className="disc-title">{discussion.title}</h1>

        {discussion.topics && discussion.topics.length > 0 && (
          <div className="disc-topics">
            {discussion.topics.map((topic) => (
              <span key={topic} className="disc-topic-badge">
                {TOPIC_ICONS[topic] || "💬"} {topicLabel(topic)}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <article className="disc-content">
        <p>{discussion.content}</p>
      </article>

      {/* ── Divider ── */}
      <div className="disc-divider" />

      {/* ── Replies section ── */}
      <section className="disc-replies-section">
        <h2 className="disc-replies-title">
          Replies <span className="disc-replies-count">{replies.length}</span>
        </h2>

        {replies.length === 0 ? (
          <div className="disc-no-replies">
            <p>No replies yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="disc-replies-list">
            {replies.map((reply) => (
              <ReplyItem key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </section>

      {/* ── Reply form ── */}
      <section className="disc-reply-form-section">
        <h3 className="disc-form-title">Share your thoughts</h3>
        <form onSubmit={handleReplySubmit} className="disc-reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a thoughtful reply... (required)"
            className="disc-reply-textarea"
            rows="4"
          />
          <div className="disc-form-footer">
            <p className="disc-form-hint">Keep it respectful and on-topic</p>
            <button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="disc-btn-primary"
            >
              {submitting ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
