import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { PostCard } from "../components/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/* ── rotating taglines in hero ── */
const TAGLINES = [
  "Real mistakes. Real lessons. Real people.",
  "Someone out there needs your story today.",
  "Every scar holds a wisdom worth sharing.",
  "You are never as alone as you think.",
];

/* ── featured story card (first post, large) ── */
function FeaturedCard({ post }) {
  const palette = getPostPalette(post.postType);
  const display = post.author?.displayName || "Member";
  const initial = display[0]?.toUpperCase() || "?";

  return (
    <Link to={`/post/${post.id}`} className="fp-featured-link">
      <article className="fp-featured">
        <div className="fp-featured-left">
          <span className={`fp-badge fp-badge--${post.postType}`}>
            {palette.icon} {palette.label}
          </span>
          {post.title && <h2 className="fp-featured-title">{post.title}</h2>}
          <p className="fp-featured-preview">
            {post.content?.slice(0, 200)}{post.content?.length > 200 ? "…" : ""}
          </p>
          <div className="fp-featured-footer">
            <div className="fp-mini-avatar" style={{ background: palette.avatarBg, color: palette.avatarText }}>
              {initial}
            </div>
            <span className="fp-featured-author">{display}</span>
            <span className="fp-featured-sep">·</span>
            <span className="fp-featured-likes">♥ {post.likeCount || 0}</span>
            <span className="fp-featured-sep">·</span>
            <span className="fp-featured-comments">💬 {post.commentCount || 0}</span>
          </div>
        </div>
        <div className="fp-featured-right">
          <div className="fp-featured-art" style={{ background: palette.artBg }}>
            <span className="fp-featured-art-icon">{palette.icon}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ── compact story card ── */
function StoryCard({ post, index }) {
  const palette = getPostPalette(post.postType);
  const display = post.author?.displayName || "Member";
  const initial = display[0]?.toUpperCase() || "?";

  return (
    <Link
      to={`/post/${post.id}`}
      className="fp-card-link"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <article className="fp-card">
        <div className="fp-card-top">
          <div className="fp-card-avatar" style={{ background: palette.avatarBg, color: palette.avatarText }}>
            {initial}
          </div>
          <div className="fp-card-meta">
            <span className="fp-card-author">{display}</span>
            <span className="fp-card-dot">·</span>
            <time className="fp-card-time">
              {post.createdAt ? timeAgo(post.createdAt) : "recently"}
            </time>
          </div>
          <span className={`fp-badge fp-badge--${post.postType} fp-badge--sm`}>
            {palette.icon}
          </span>
        </div>

        {post.title && <h3 className="fp-card-title">{post.title}</h3>}
        <p className="fp-card-preview">
          {post.content?.slice(0, 130)}{post.content?.length > 130 ? "…" : ""}
        </p>

        <div className="fp-card-footer">
          <div className="fp-card-stats">
            <span>♥ {post.likeCount || 0}</span>
            <span>💬 {post.commentCount || 0}</span>
          </div>
          {post.topics?.slice(0, 2).map((t) => (
            <span key={t} className="fp-card-topic">{t}</span>
          ))}
        </div>
      </article>
    </Link>
  );
}

/* ── skeleton loader card ── */
function SkeletonCard() {
  return (
    <div className="fp-skeleton">
      <div className="fp-skel-top">
        <div className="fp-skel-circle" />
        <div className="fp-skel-lines">
          <div className="fp-skel-line" style={{ width: "35%" }} />
          <div className="fp-skel-line" style={{ width: "55%", height: 10 }} />
        </div>
      </div>
      <div className="fp-skel-line" style={{ width: "80%", height: 16, marginBottom: 8 }} />
      <div className="fp-skel-line" style={{ width: "100%" }} />
      <div className="fp-skel-line" style={{ width: "70%" }} />
    </div>
  );
}

/* ── helpers ── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "abhi";
  if (m < 60) return `${m}m pehle`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h pehle`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d pehle`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getPostPalette(type) {
  const map = {
    lesson:      { icon: "💡", label: "Lesson",      avatarBg: "#FEF9C3", avatarText: "#854D0E", artBg: "linear-gradient(135deg,#FEF9C3,#FDE68A)", },
    achievement: { icon: "🏆", label: "Achievement", avatarBg: "#EAF3DE", avatarText: "#3B6D11", artBg: "linear-gradient(135deg,#EAF3DE,#BBF7D0)", },
    struggle:    { icon: "🌧",  label: "Struggle",    avatarBg: "#E6F1FB", avatarText: "#185FA5", artBg: "linear-gradient(135deg,#E6F1FB,#BFDBFE)", },
    advice:      { icon: "🤝", label: "Advice",      avatarBg: "#F3E8FF", avatarText: "#6B21A8", artBg: "linear-gradient(135deg,#F3E8FF,#E9D5FF)", },
    story:       { icon: "📖", label: "Story",       avatarBg: "#FAECE7", avatarText: "#993C1D", artBg: "linear-gradient(135deg,#FAECE7,#FED7AA)", },
  };
  return map[type] || map.story;
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [posts,   setPosts]   = useState([]);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/posts", { params: { page, limit: 12 } })
      .then((res) => {
        if (cancelled) return;
        setPosts((prev) => page === 1 ? res.data.posts : [...prev, ...res.data.posts]);
        setHasMore(res.data.hasMore);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Feed load nahi ho saki. Server chal raha hai?");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const featured  = posts[0] || null;
  const remaining = posts.slice(1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmerSkel {
          0%   { background-position:-400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes heroPulse {
          0%,100% { opacity:0.6; transform:scale(1); }
          50%     { opacity:1;   transform:scale(1.04); }
        }
        @keyframes badgePop {
          from { opacity:0; transform:scale(0.85); }
          to   { opacity:1; transform:scale(1); }
        }

        .fp-root {
          font-family: 'DM Sans', sans-serif;
          max-width: 740px;
          margin: 0 auto;
          padding-bottom: 4rem;
        }

        /* ════ HERO ════ */
        .fp-hero {
          position: relative;
          padding: 2.5rem 2rem 2rem;
          border-radius: 20px;
          background: linear-gradient(140deg, #D85A30 0%, #B84020 50%, #7A2A0A 100%);
          overflow: hidden;
          margin-bottom: 1.75rem;
          animation: fadeUp 0.5s ease both;
        }

        .fp-hero-glow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 10% 40%, rgba(255,255,255,0.09) 0%, transparent 55%),
            radial-gradient(circle at 90% 10%, rgba(0,0,0,0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        /* decorative circles */
        .fp-hero-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          pointer-events: none;
        }

        .fp-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.9);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 20px;
          margin-bottom: 1rem;
          position: relative;
          animation: badgePop 0.4s ease 0.2s both;
        }

        .fp-hero-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #fff;
          animation: heroPulse 2s ease-in-out infinite;
        }

        .fp-hero-title {
          font-family: 'Lora', serif;
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 500;
          color: #fff;
          line-height: 1.25;
          margin: 0 0 0.5rem;
          position: relative;
          animation: fadeUp 0.5s ease 0.1s both;
        }

        .fp-hero-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.78);
          margin: 0 0 1.5rem;
          font-weight: 300;
          max-width: 440px;
          line-height: 1.6;
          position: relative;
          animation: fadeUp 0.5s ease 0.2s both;
        }

        .fp-hero-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          position: relative;
          animation: fadeUp 0.5s ease 0.3s both;
        }

        .fp-btn-primary {
          padding: 10px 20px;
          background: #fff;
          color: #D85A30;
          border: none;
          border-radius: 22px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          display: inline-block;
        }
        .fp-btn-primary:hover { background: #FFF0E8; transform: translateY(-1px); }

        .fp-btn-ghost {
          padding: 10px 20px;
          background: rgba(255,255,255,0.15);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 22px;
          font-size: 13px;
          font-weight: 400;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s;
          display: inline-block;
        }
        .fp-btn-ghost:hover { background: rgba(255,255,255,0.25); }

        /* hero stats */
        .fp-hero-stats {
          display: flex;
          gap: 1.5rem;
          margin-top: 1.5rem;
          position: relative;
          animation: fadeUp 0.5s ease 0.35s both;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.15);
        }
        .fp-hero-stat { text-align: center; }
        .fp-hero-stat-val {
          font-family: 'Lora', serif;
          font-size: 22px;
          color: #fff;
          font-weight: 500;
          display: block;
          line-height: 1;
        }
        .fp-hero-stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.65);
          margin-top: 3px;
          display: block;
        }

        /* ════ SECTION LABEL ════ */
        .fp-section-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1rem;
        }
        .fp-section-title {
          font-family: 'Lora', serif;
          font-size: 18px;
          font-weight: 500;
          color: #1A0A00;
          margin: 0;
        }
        .fp-section-line {
          flex: 1;
          height: 1px;
          background: #EDD9CC;
        }

        /* ════ FEATURED CARD ════ */
        .fp-featured-link {
          display: block;
          text-decoration: none;
          margin-bottom: 1rem;
          animation: fadeUp 0.5s ease 0.2s both;
        }
        .fp-featured {
          display: flex;
          gap: 0;
          background: #FFFAF6;
          border: 0.5px solid #EDD9CC;
          border-radius: 18px;
          overflow: hidden;
          transition: border-color 0.15s, box-shadow 0.2s;
        }
        .fp-featured:hover {
          border-color: #F0997B;
          box-shadow: 0 4px 24px rgba(216,90,48,0.1);
        }
        .fp-featured-left {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fp-featured-title {
          font-family: 'Lora', serif;
          font-size: 20px;
          font-weight: 500;
          color: #1A0A00;
          margin: 0;
          line-height: 1.35;
        }
        .fp-featured-preview {
          font-size: 13.5px;
          color: #6A4A3A;
          line-height: 1.65;
          margin: 0;
          font-weight: 300;
          flex: 1;
        }
        .fp-featured-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .fp-mini-avatar {
          width: 26px; height: 26px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .fp-featured-author { font-size: 13px; font-weight: 500; color: #1A0A00; }
        .fp-featured-sep    { color: #C4A898; font-size: 12px; }
        .fp-featured-likes, .fp-featured-comments { font-size: 12px; color: #8A6A5A; }

        .fp-featured-right {
          width: 160px;
          flex-shrink: 0;
        }
        .fp-featured-art {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 140px;
        }
        .fp-featured-art-icon { font-size: 52px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.08)); }

        /* ════ BADGE ════ */
        .fp-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 12px;
        }
        .fp-badge--lesson      { background:#FEF9C3; color:#854D0E; }
        .fp-badge--achievement { background:#EAF3DE; color:#3B6D11; }
        .fp-badge--struggle    { background:#E6F1FB; color:#185FA5; }
        .fp-badge--advice      { background:#F3E8FF; color:#6B21A8; }
        .fp-badge--story       { background:#FAECE7; color:#993C1D; }
        .fp-badge--sm { font-size: 14px; padding: 0; background: none; }

        /* ════ STORY CARDS GRID ════ */
        .fp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 12px;
          margin-bottom: 1.25rem;
        }

        .fp-card-link {
          display: block;
          text-decoration: none;
          animation: fadeUp 0.4s ease both;
        }
        .fp-card {
          background: #FFFAF6;
          border: 0.5px solid #EDD9CC;
          border-radius: 16px;
          padding: 1.1rem 1.2rem;
          transition: border-color 0.15s, box-shadow 0.2s, transform 0.15s;
          height: 100%;
          box-sizing: border-box;
        }
        .fp-card:hover {
          border-color: #F0997B;
          box-shadow: 0 4px 20px rgba(216,90,48,0.08);
          transform: translateY(-2px);
        }

        .fp-card-top {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0.75rem;
        }
        .fp-card-avatar {
          width: 32px; height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .fp-card-meta {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        .fp-card-author { font-size: 13px; font-weight: 500; color: #1A0A00; }
        .fp-card-dot    { color: #C4A898; font-size: 11px; }
        .fp-card-time   { font-size: 11px; color: #B08878; font-weight: 300; }

        .fp-card-title {
          font-family: 'Lora', serif;
          font-size: 15px;
          font-weight: 500;
          color: #1A0A00;
          margin: 0 0 6px;
          line-height: 1.4;
        }
        .fp-card-preview {
          font-size: 13px;
          color: #6A4A3A;
          line-height: 1.6;
          margin: 0 0 0.85rem;
          font-weight: 300;
        }
        .fp-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }
        .fp-card-stats {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #8A6A5A;
        }
        .fp-card-topic {
          font-size: 10px;
          font-weight: 500;
          padding: 3px 8px;
          background: #F5EDE6;
          color: #8A6A5A;
          border-radius: 10px;
        }

        /* ════ ERROR ════ */
        .fp-error {
          background: #FAECE7;
          border: 1px solid #F5C4B3;
          border-left: 3px solid #D85A30;
          color: #993C1D;
          font-size: 13px;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .fp-retry-btn {
          padding: 6px 14px;
          background: #D85A30;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        /* ════ SKELETON ════ */
        .fp-skeleton {
          background: #FFFAF6;
          border: 0.5px solid #EDD9CC;
          border-radius: 16px;
          padding: 1.1rem 1.2rem;
        }
        .fp-skel-top {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
          align-items: center;
        }
        .fp-skel-circle {
          width: 32px; height: 32px;
          border-radius: 9px;
          flex-shrink: 0;
          background: linear-gradient(90deg, #F5EDE6 25%, #EDD9CC 50%, #F5EDE6 75%);
          background-size: 400px 100%;
          animation: shimmerSkel 1.2s infinite linear;
        }
        .fp-skel-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .fp-skel-line {
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(90deg, #F5EDE6 25%, #EDD9CC 50%, #F5EDE6 75%);
          background-size: 400px 100%;
          animation: shimmerSkel 1.2s infinite linear;
          margin-bottom: 6px;
        }

        /* ════ LOAD MORE ════ */
        .fp-load-more {
          width: 100%;
          padding: 13px;
          background: #FFFAF6;
          border: 1.5px solid #EDD9CC;
          color: #8A6A5A;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 0.5rem;
        }
        .fp-load-more:hover {
          border-color: #D85A30;
          color: #D85A30;
          background: #FAECE7;
        }

        /* ════ EMPTY STATE ════ */
        .fp-empty {
          text-align: center;
          padding: 4rem 1rem;
          background: #FFFAF6;
          border: 0.5px dashed #EDD9CC;
          border-radius: 18px;
        }
        .fp-empty-icon { font-size: 48px; margin-bottom: 1rem; }
        .fp-empty-title {
          font-family: 'Lora', serif;
          font-size: 20px;
          color: #1A0A00;
          margin: 0 0 8px;
        }
        .fp-empty-sub {
          font-size: 14px;
          color: #B08878;
          margin: 0 0 1.5rem;
          font-weight: 300;
        }
        .fp-empty-btn {
          display: inline-block;
          padding: 10px 22px;
          background: #D85A30;
          color: #fff;
          border-radius: 22px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .fp-empty-btn:hover { background: #B84020; }
      `}</style>

      <div className="fp-root">

        {/* ════ HERO ════ */}
        <section className="fp-hero">
          <div className="fp-hero-glow" />
          {/* decorative circles */}
          <div className="fp-hero-circle" style={{ width:220, height:220, top:-70, right:-50 }} />
          <div className="fp-hero-circle" style={{ width:120, height:120, bottom:-40, left:30 }} />
          <div className="fp-hero-circle" style={{ width:60,  height:60,  top:20,  left:"45%" }} />

          <div className="fp-hero-tag">
            <div className="fp-hero-dot" />
            Community stories
          </div>

          <h1 className="fp-hero-title">
            Stories that guide us
          </h1>
          <p className="fp-hero-sub">{tagline}</p>

          <div className="fp-hero-actions">
            {isAuthenticated ? (
              <Link to="/create" className="fp-btn-primary">
                ✨ Share your story
              </Link>
            ) : (
              <>
                <Link to="/register" className="fp-btn-primary">Create an account</Link>
                <Link to="/login"    className="fp-btn-ghost">Log in</Link>
              </>
            )}
            <Link to="/explore" className="fp-btn-ghost">Explore all →</Link>
          </div>

          <div className="fp-hero-stats">
            <div className="fp-hero-stat">
              <span className="fp-hero-stat-val">{posts.length > 0 ? `${posts.length}+` : "—"}</span>
              <span className="fp-hero-stat-label">Stories shared</span>
            </div>
            <div className="fp-hero-stat">
              <span className="fp-hero-stat-val">100%</span>
              <span className="fp-hero-stat-label">Anon friendly</span>
            </div>
            <div className="fp-hero-stat">
              <span className="fp-hero-stat-val">Free</span>
              <span className="fp-hero-stat-label">Always & forever</span>
            </div>
          </div>
        </section>

        {/* ════ ERROR ════ */}
        {error && (
          <div className="fp-error">
            <span>{error}</span>
            <button className="fp-retry-btn" onClick={() => { setPage(1); }}>
              Retry
            </button>
          </div>
        )}

        {/* ════ SKELETON ════ */}
        {loading && page === 1 && (
          <>
            <div className="fp-section-label" style={{ marginBottom:"1rem" }}>
              <h2 className="fp-section-title">Latest stories</h2>
              <div className="fp-section-line" />
            </div>
            <div className="fp-grid">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        )}

        {/* ════ FEATURED + FEED ════ */}
        {!loading && posts.length === 0 && !error && (
          <div className="fp-empty">
            <div className="fp-empty-icon">✍️</div>
            <p className="fp-empty-title">Abhi koi story nahi hai</p>
            <p className="fp-empty-sub">Pehli story share karne wale bano — koi wait kar raha hai.</p>
            <Link to="/create" className="fp-empty-btn">Share a story</Link>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <>
            {/* featured first post */}
            {featured && (
              <>
                <div className="fp-section-label">
                  <h2 className="fp-section-title">Featured story</h2>
                  <div className="fp-section-line" />
                </div>
                <FeaturedCard post={featured} />
              </>
            )}

            {/* rest of posts */}
            {remaining.length > 0 && (
              <>
                <div className="fp-section-label">
                  <h2 className="fp-section-title">Latest stories</h2>
                  <div className="fp-section-line" />
                </div>
                <div className="fp-grid">
                  {remaining.map((p, i) => (
                    <StoryCard key={p.id} post={p} index={i} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ════ LOAD MORE ════ */}
        {hasMore && !loading && (
          <button className="fp-load-more" onClick={() => setPage((x) => x + 1)}>
            Aur stories load karo ↓
          </button>
        )}
        {loading && page > 1 && (
          <p style={{ textAlign:"center", color:"#B08878", fontSize:13, padding:"1rem" }}>
            Load ho raha hai…
          </p>
        )}

      </div>
    </>
  );
}