import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { TOPICS, topicLabel } from "../constants.js";

/* ── time ago helper ── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

/* ── topic icon map ── */
const TOPIC_ICONS = {
  career:          "💼",
  relationships:   "💛",
  "mental-health": "🧠",
  education:       "📚",
  "life-decisions":"🔀",
};

/* ── activity level badge ── */
function ActivityBadge({ replyCount }) {
  if (replyCount >= 20) return <span className="dp-activity dp-activity--hot">🔥 Hot</span>;
  if (replyCount >= 10) return <span className="dp-activity dp-activity--active">💬 Active</span>;
  return null;
}

/* ── skeleton card ── */
function SkeletonCard() {
  return (
    <div className="dp-skeleton">
      <div className="dp-skel-top">
        <div className="dp-skel dp-skel-circle" />
        <div style={{ flex:1 }}>
          <div className="dp-skel dp-skel-line" style={{ width:"30%", marginBottom:6 }} />
          <div className="dp-skel dp-skel-line" style={{ width:"18%", height:10 }} />
        </div>
      </div>
      <div className="dp-skel dp-skel-line" style={{ width:"85%", height:18, marginBottom:8 }} />
      <div className="dp-skel dp-skel-line" style={{ width:"100%", marginBottom:5 }} />
      <div className="dp-skel dp-skel-line" style={{ width:"65%" }} />
    </div>
  );
}

/* ── single discussion card ── */
function DiscussionCard({ d, index }) {
  const initial = (d.author?.displayName?.[0] || "?").toUpperCase();
  const isAnon  = d.author?.isAnonymous;

  return (
    <Link
      to={`/discussions/${d.id}`}
      className="dp-card"
      style={{ animationDelay:`${index * 0.06}s` }}
    >
      {/* left accent line */}
      <div className="dp-card-accent" />

      <div className="dp-card-inner">
        {/* top row */}
        <div className="dp-card-top">
          <div className="dp-avatar">
            {isAnon ? "?" : initial}
          </div>
          <div className="dp-card-meta">
            <span className="dp-author">{d.author?.displayName || "Member"}</span>
            {isAnon && <span className="dp-anon-tag">Anon</span>}
            <span className="dp-sep">·</span>
            <time className="dp-time">{d.createdAt ? timeAgo(d.createdAt) : ""}</time>
          </div>
          <ActivityBadge replyCount={d.replyCount || 0} />
        </div>

        {/* title */}
        <h2 className="dp-card-title">{d.title}</h2>

        {/* excerpt */}
        <p className="dp-card-excerpt">
          {d.content?.slice(0, 160)}{d.content?.length > 160 ? "…" : ""}
        </p>

        {/* footer */}
        <div className="dp-card-footer">
          <div className="dp-topics">
            {d.topics?.slice(0, 2).map((t) => (
              <span key={t} className="dp-topic-pill">
                {TOPIC_ICONS[t] || "💬"} {topicLabel(t)}
              </span>
            ))}
          </div>
          <div className="dp-reply-count">
            <span className="dp-reply-icon">💬</span>
            <strong>{d.replyCount ?? 0}</strong>
            <span>{d.replyCount === 1 ? "reply" : "replies"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export function DiscussionsPage() {
  const [params, setParams] = useSearchParams();
  const topic = params.get("topic") || "";

  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const qs = useMemo(() => params.toString(), [params]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get("/discussions", { params: { topic: topic || undefined, limit: 30 } })
      .then((res) => {
        if (!cancelled) { setRows(res.data.discussions); setError(""); }
      })
      .catch(() => { if (!cancelled) setError("Could not load discussions. Please try again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [qs, topic]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmerSk {
          0%   { background-position:-400px 0; }
          100% { background-position:400px 0; }
        }
        @keyframes badgePop {
          from { opacity:0; transform:scale(0.8); }
          to   { opacity:1; transform:scale(1); }
        }

        .dp-root {
          font-family: 'DM Sans', sans-serif;
          max-width: 780px;
          margin: 0 auto;
          padding-bottom: 4rem;
          animation: fadeUp 0.4s ease both;
        }

        /* ── hero header ── */
        .dp-hero {
          background: linear-gradient(135deg, #1A0A00 0%, #3D1A0A 55%, #6B2E14 100%);
          border-radius: 20px;
          padding: 2rem 2rem 0;
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .dp-hero-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 80% 25%, rgba(216,90,48,0.22) 0%, transparent 55%),
            radial-gradient(circle at 15% 75%, rgba(255,255,255,0.03) 0%, transparent 50%);
          pointer-events: none;
        }
        .dp-hero-circle {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.07);
          pointer-events: none;
        }
        .dp-hero-top {
          position: relative; z-index: 2;
          margin-bottom: 1.5rem;
        }
        .dp-eyebrow {
          font-size: 10.5px; font-weight: 500;
          letter-spacing: 1.4px; text-transform: uppercase;
          color: #F0997B; margin: 0 0 8px;
          display: flex; align-items: center; gap: 6px;
        }
        .dp-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #F0997B;
          animation: badgePop 2s ease-in-out infinite alternate;
        }
        .dp-hero-title {
          font-family: 'Lora', serif;
          font-size: clamp(22px, 3.5vw, 30px);
          font-weight: 500; color: #fff;
          margin: 0 0 6px; line-height: 1.2;
        }
        .dp-hero-sub {
          font-size: 13.5px; color: rgba(255,255,255,0.58);
          margin: 0 0 1.5rem; font-weight: 300; line-height: 1.6;
        }
        .dp-hero-actions {
          display: flex; align-items: center; gap: 10px;
          flex-wrap: wrap; position: relative; z-index: 2;
        }
        .dp-ask-btn {
          padding: 10px 22px;
          background: #D85A30; color: #fff;
          border: none; border-radius: 22px;
          font-size: 13.5px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 7px;
          transition: background 0.15s, transform 0.1s;
        }
        .dp-ask-btn:hover { background: #B84020; transform: translateY(-1px); color: #fff; }

        /* tab strip sits at bottom of hero */
        .dp-tabs {
          display: flex;
          gap: 0;
          position: relative; z-index: 2;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 0 -2rem;
          padding: 0 2rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .dp-tabs::-webkit-scrollbar { display: none; }
        .dp-tab {
          padding: 12px 16px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.45);
          border: none; background: none;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .dp-tab:hover  { color: rgba(255,255,255,0.8); }
        .dp-tab.active { color: #fff; border-bottom-color: #D85A30; }

        /* ── results bar ── */
        .dp-results-bar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem; flex-wrap: wrap; gap: 8px;
        }
        .dp-results-count {
          font-size: 13px; color: #8A6A5A; font-weight: 300;
        }
        .dp-results-count strong { color: #1A0A00; font-weight: 500; }

        /* ── discussion card ── */
        .dp-card {
          display: flex;
          background: #FFFAF6;
          border: 0.5px solid #EDD9CC;
          border-radius: 16px;
          margin-bottom: 10px;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          transition: border-color 0.15s, box-shadow 0.2s, transform 0.15s;
          animation: fadeUp 0.4s ease both;
        }
        .dp-card:hover {
          border-color: #F0997B;
          box-shadow: 0 4px 20px rgba(216,90,48,0.09);
          transform: translateY(-2px);
        }

        /* accent line on left */
        .dp-card-accent {
          width: 3px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #D85A30, #F0997B);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .dp-card:hover .dp-card-accent { opacity: 1; }

        .dp-card-inner { flex: 1; padding: 1.1rem 1.25rem; }

        .dp-card-top {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 0.75rem; flex-wrap: wrap;
        }

        .dp-avatar {
          width: 30px; height: 30px; border-radius: 9px;
          background: #FAECE7; color: #993C1D;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; flex-shrink: 0;
        }

        .dp-card-meta {
          display: flex; align-items: center; gap: 5px;
          flex-wrap: wrap; flex: 1;
        }
        .dp-author   { font-size: 13px; font-weight: 500; color: #1A0A00; }
        .dp-anon-tag {
          font-size: 9px; font-weight: 600; letter-spacing: 0.4px;
          text-transform: uppercase; padding: 2px 7px; border-radius: 10px;
          background: #F5EDE6; color: #B08878;
        }
        .dp-sep  { color: #C4A898; font-size: 11px; }
        .dp-time { font-size: 11.5px; color: #B08878; font-weight: 300; }

        .dp-activity {
          font-size: 10px; font-weight: 600; padding: 3px 9px;
          border-radius: 10px; white-space: nowrap;
          animation: badgePop 0.3s ease;
        }
        .dp-activity--hot    { background: #FEF3EC; color: #B84020; }
        .dp-activity--active { background: #E6F1FB; color: #185FA5; }

        .dp-card-title {
          font-family: 'Lora', serif;
          font-size: 16px; font-weight: 500; color: #1A0A00;
          line-height: 1.4; margin: 0 0 6px;
          transition: color 0.15s;
        }
        .dp-card:hover .dp-card-title { color: #D85A30; }

        .dp-card-excerpt {
          font-size: 13px; color: #6A4A3A;
          line-height: 1.65; margin: 0 0 0.85rem;
          font-weight: 300;
        }

        .dp-card-footer {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 8px;
        }

        .dp-topics { display: flex; gap: 5px; flex-wrap: wrap; }
        .dp-topic-pill {
          font-size: 11px; font-weight: 500;
          padding: 3px 9px; border-radius: 10px;
          background: #F5EDE6; color: #8A6A5A;
        }

        .dp-reply-count {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: #8A6A5A; font-weight: 300;
        }
        .dp-reply-count strong { font-weight: 600; color: #1A0A00; }
        .dp-reply-icon { font-size: 13px; }

        /* ── error ── */
        .dp-error {
          background: #FAECE7; border: 1px solid #F5C4B3;
          border-left: 3px solid #D85A30; color: #993C1D;
          font-size: 13px; padding: 12px 16px; border-radius: 12px;
          margin-bottom: 1rem; display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
        }
        .dp-retry {
          padding: 6px 14px; background: #D85A30; color: #fff;
          border: none; border-radius: 8px; font-size: 12px;
          font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }

        /* ── skeleton ── */
        .dp-skeleton {
          background: #FFFAF6; border: 0.5px solid #EDD9CC;
          border-radius: 16px; padding: 1.1rem 1.25rem;
          margin-bottom: 10px;
        }
        .dp-skel-top { display:flex; gap:10px; align-items:center; margin-bottom:12px; }
        .dp-skel {
          background: linear-gradient(90deg,#F5EDE6 25%,#EDD9CC 50%,#F5EDE6 75%);
          background-size: 400px 100%;
          animation: shimmerSk 1.2s infinite linear; border-radius:7px;
        }
        .dp-skel-circle { width:30px; height:30px; border-radius:9px; flex-shrink:0; }
        .dp-skel-line   { height:12px; margin-bottom:6px; }

        /* ── empty state ── */
        .dp-empty {
          text-align: center; padding: 3.5rem 1rem;
          background: #FFFAF6; border: 0.5px dashed #EDD9CC;
          border-radius: 18px;
        }
        .dp-empty-icon  { font-size: 44px; margin-bottom: 0.75rem; }
        .dp-empty-title { font-family:'Lora',serif; font-size:19px; font-weight:500; color:#1A0A00; margin:0 0 7px; }
        .dp-empty-sub   { font-size:13.5px; color:#B08878; margin:0 0 1.25rem; font-weight:300; }
        .dp-empty-btn {
          display: inline-block; padding: 10px 22px;
          background: #D85A30; color: #fff; border-radius: 22px;
          font-size: 13px; font-weight: 500; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .dp-empty-btn:hover { background: #B84020; color: #fff; }

        /* ── floating ask button (mobile) ── */
        .dp-fab {
          display: none;
          position: fixed; bottom: 5.5rem; right: 1.25rem;
          width: 52px; height: 52px; border-radius: 50%;
          background: #D85A30; color: #fff;
          font-size: 24px; border: none;
          box-shadow: 0 4px 20px rgba(216,90,48,0.35);
          align-items: center; justify-content: center;
          text-decoration: none; z-index: 100;
          transition: background 0.15s, transform 0.1s;
        }
        .dp-fab:hover { background: #B84020; transform: scale(1.08); }

        @media (max-width: 680px) {
          .dp-fab { display: flex; }
        }
      `}</style>

      <div className="dp-root">

        {/* ── HERO ── */}
        <div className="dp-hero">
          <div className="dp-hero-glow" />
          <div className="dp-hero-circle" style={{ width:200, height:200, top:-70, right:-55 }} />
          <div className="dp-hero-circle" style={{ width:90,  height:90,  bottom:-25, left:20 }} />

          <div className="dp-hero-top">
            <p className="dp-eyebrow">
              <span className="dp-eyebrow-dot" />
              Community advice
            </p>
            <h1 className="dp-hero-title">Ask the community</h1>
            <p className="dp-hero-sub">
              Real questions from real people — answered by those who've actually been there.
            </p>
            <div className="dp-hero-actions">
              <Link to="/discussions/new" className="dp-ask-btn">
                🤝 Ask a question
              </Link>
            </div>
          </div>

          {/* topic filter tabs inside hero */}
          <div className="dp-tabs">
            <button
              type="button"
              className={`dp-tab ${!topic ? "active" : ""}`}
              onClick={() => setParams({})}
            >
              All topics
            </button>
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`dp-tab ${topic === t.id ? "active" : ""}`}
                onClick={() => setParams({ topic: t.id })}
              >
                {TOPIC_ICONS[t.id] || "💬"} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS BAR ── */}
        {!loading && !error && (
          <div className="dp-results-bar">
            <p className="dp-results-count">
              <strong>{rows.length}</strong>{" "}
              {rows.length === 1 ? "thread" : "threads"}
              {topic ? ` in "${topicLabel(topic)}"` : " across all topics"}
            </p>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div className="dp-error">
            <span>{error}</span>
            <button className="dp-retry" onClick={() => setParams(params)}>Retry</button>
          </div>
        )}

        {/* ── SKELETON ── */}
        {loading && [...Array(5)].map((_, i) => <SkeletonCard key={i} />)}

        {/* ── EMPTY ── */}
        {!loading && !error && rows.length === 0 && (
          <div className="dp-empty">
            <div className="dp-empty-icon">💬</div>
            <p className="dp-empty-title">No threads yet</p>
            <p className="dp-empty-sub">
              {topic
                ? `No one has asked about "${topicLabel(topic)}" yet. Be the first!`
                : "No discussions yet. Start the first conversation!"}
            </p>
            <Link to="/discussions/new" className="dp-empty-btn">
              Ask a question →
            </Link>
          </div>
        )}

        {/* ── DISCUSSION LIST ── */}
        {!loading && !error && rows.length > 0 &&
          rows.map((d, i) => (
            <DiscussionCard key={d.id} d={d} index={i} />
          ))
        }

        {/* ── FAB (mobile) ── */}
        <Link to="/discussions/new" className="dp-fab" aria-label="Ask a question">
          +
        </Link>

      </div>
    </>
  );
}