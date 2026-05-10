import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api.js";
import { postTypeLabel, topicLabel } from "../constants.js";
import { useAuth } from "../context/AuthContext.jsx";

/* ── consistent avatar color from name ── */
const PALETTES = [
  { bg:"#FAECE7", text:"#993C1D" },
  { bg:"#EAF3DE", text:"#3B6D11" },
  { bg:"#E6F1FB", text:"#185FA5" },
  { bg:"#FAEEDA", text:"#854F0B" },
  { bg:"#F3E8FF", text:"#6B21A8" },
  { bg:"#E1F5EE", text:"#0F6E56" },
];
function getPalette(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTES[Math.abs(h) % PALETTES.length];
}

/* ── post type metadata ── */
const TYPE_META = {
  lesson:      { icon:"💡", label:"Lesson learned", accentBg:"#FEF9C3", accentText:"#854D0E" },
  achievement: { icon:"🏆", label:"Achievement",    accentBg:"#EAF3DE", accentText:"#3B6D11" },
  struggle:    { icon:"🌧",  label:"Struggle",       accentBg:"#E6F1FB", accentText:"#185FA5" },
  advice:      { icon:"🤝", label:"Advice",         accentBg:"#F3E8FF", accentText:"#6B21A8" },
  story:       { icon:"📖", label:"Story",          accentBg:"#FAECE7", accentText:"#993C1D" },
};

/* ── time ago helper ── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "abhi";
  if (m < 60) return `${m}m pehle`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h pehle`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d pehle`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}

/* ── single comment item ── */
function CommentItem({ comment, index }) {
  const pal = getPalette(comment.displayName || "");
  const initial = (comment.displayName?.[0] || "?").toUpperCase();
  return (
    <li className="pp2-comment" style={{ animationDelay:`${index * 0.05}s` }}>
      <div className="pp2-comment-av" style={{ background:pal.bg, color:pal.text }}>
        {comment.isAnonymous ? "?" : initial}
      </div>
      <div className="pp2-comment-body">
        <div className="pp2-comment-head">
          <strong className="pp2-comment-name">{comment.displayName || "Member"}</strong>
          {comment.isAnonymous && <span className="pp2-anon-tag">Anon</span>}
          <time className="pp2-comment-time">{timeAgo(comment.createdAt)}</time>
        </div>
        <p className="pp2-comment-text">{comment.content}</p>
      </div>
    </li>
  );
}

/* ── delete confirmation modal ── */
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="pp2-modal-backdrop" onClick={onCancel}>
      <div className="pp2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pp2-modal-icon">🗑</div>
        <h3 className="pp2-modal-title">Post delete karein?</h3>
        <p className="pp2-modal-sub">Yeh action permanent hai aur undo nahi ho sakta.</p>
        <div className="pp2-modal-actions">
          <button className="pp2-modal-cancel" onClick={onCancel}>Ruk jao</button>
          <button className="pp2-modal-confirm" onClick={onConfirm}>Haan, delete karo</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export function PostPage() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const { isAuthenticated } = useAuth();
  const commentRef        = useRef(null);

  const [post,         setPost]         = useState(null);
  const [comments,     setComments]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [commentText,  setCommentText]  = useState("");
  const [commentAnon,  setCommentAnon]  = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [showDelete,   setShowDelete]   = useState(false);
  const [likeAnim,     setLikeAnim]     = useState(false);
  const [toast,        setToast]        = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.get(`/posts/${id}`), api.get(`/posts/${id}/comments`)])
      .then(([pRes, cRes]) => {
        if (cancelled) return;
        setPost(pRes.data.post);
        setComments(cRes.data.comments);
        setError("");
      })
      .catch(() => { if (!cancelled) setError("Post load nahi ho saki."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function toggleLike() {
    if (!isAuthenticated) { showToast("Like karne ke liye login karo!"); return; }
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    try {
      const { data } = await api.post(`/posts/${id}/like`);
      setPost(data.post);
    } catch { /* ignore */ }
  }

  async function sendComment(e) {
    e.preventDefault();
    if (!isAuthenticated || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${id}/comments`, {
        content:     commentText,
        isAnonymous: commentAnon,
      });
      setComments((prev) => [data.comment, ...prev]);
      setCommentText("");
      setPost((prev) => prev ? { ...prev, commentCount:(prev.commentCount || 0) + 1 } : prev);
      showToast("Comment post ho gaya! 🎉");
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  }

  async function confirmDelete() {
    try {
      await api.delete(`/posts/${id}`);
      navigate("/");
    } catch { setShowDelete(false); }
  }

  /* ── skeleton ── */
  if (loading) return (
    <div className="pp2-skeleton-wrap">
      <div className="pp2-skel pp2-skel-hero" />
      <div className="pp2-skel-card">
        <div style={{ display:"flex", gap:14, marginBottom:16, alignItems:"center" }}>
          <div className="pp2-skel pp2-skel-circle" />
          <div style={{ flex:1 }}>
            <div className="pp2-skel pp2-skel-line" style={{ width:"40%", marginBottom:8 }} />
            <div className="pp2-skel pp2-skel-line" style={{ width:"25%", height:10 }} />
          </div>
        </div>
        <div className="pp2-skel pp2-skel-line" style={{ width:"80%", height:22, marginBottom:10 }} />
        {[100,90,95,70,85].map((w,i) => (
          <div key={i} className="pp2-skel pp2-skel-line" style={{ width:`${w}%`, marginBottom:8 }} />
        ))}
      </div>
      <style>{skeletonCSS}</style>
    </div>
  );

  if (error || !post) return (
    <div className="pp2-error-state">
      <div className="pp2-error-icon">😔</div>
      <h2>Post nahi mili</h2>
      <p>{error || "Shayad delete ho gayi ho."}</p>
      <Link to="/" className="pp2-back-btn">← Feed pe wapas jao</Link>
      <style>{skeletonCSS}</style>
    </div>
  );

  const display  = post.author?.displayName || "Member";
  const initial  = display[0]?.toUpperCase() || "?";
  const pal      = getPalette(display);
  const typeMeta = TYPE_META[post.postType] || TYPE_META.story;
  const postDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes likePop   { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 70%{transform:scale(0.9)} 100%{transform:scale(1)} }
        @keyframes toastIn   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastOut  { from{opacity:1} to{opacity:0} }
        @keyframes shimmerSk { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes commentIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }

        .pp2-root {
          font-family:'DM Sans',sans-serif;
          max-width:720px; margin:0 auto;
          padding-bottom:5rem;
          animation:fadeUp 0.4s ease both;
        }

        /* ── back link ── */
        .pp2-back {
          display:inline-flex; align-items:center; gap:6px;
          font-size:13px; color:#B08878; text-decoration:none;
          margin-bottom:1.25rem; transition:color 0.15s;
          font-weight:400;
        }
        .pp2-back:hover { color:#D85A30; }

        /* ── story type banner ── */
        .pp2-type-banner {
          border-radius:16px 16px 0 0;
          padding:1.25rem 1.75rem;
          display:flex; align-items:center; gap:12px;
          position:relative; overflow:hidden;
        }
        .pp2-type-banner::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events:none;
        }
        .pp2-type-banner-icon { font-size:28px; position:relative; }
        .pp2-type-banner-label {
          font-size:12px; font-weight:600; letter-spacing:0.8px;
          text-transform:uppercase; position:relative; opacity:0.85;
        }
        .pp2-type-banner-date {
          margin-left:auto; font-size:11.5px;
          position:relative; opacity:0.7; font-weight:300;
        }

        /* ── main post card ── */
        .pp2-card {
          background:#FFFAF6;
          border:0.5px solid #EDD9CC;
          border-top:none;
          border-radius:0 0 20px 20px;
          padding:1.75rem;
          margin-bottom:1.25rem;
        }

        /* author row */
        .pp2-author-row {
          display:flex; align-items:center; gap:12px;
          margin-bottom:1.5rem;
          padding-bottom:1.25rem;
          border-bottom:1px solid #F5E8DC;
        }
        .pp2-avatar {
          width:52px; height:52px; border-radius:14px;
          display:flex; align-items:center; justify-content:center;
          font-family:'Lora',serif; font-size:20px; font-weight:500;
          flex-shrink:0; position:relative;
        }
        .pp2-avatar-ring {
          position:absolute; inset:-4px; border-radius:17px;
          border:2px solid; opacity:0.3; pointer-events:none;
        }
        .pp2-author-info { flex:1; }
        .pp2-author-name {
          font-size:15px; font-weight:500; color:#1A0A00; margin:0 0 2px;
          display:flex; align-items:center; gap:8px;
        }
        .pp2-anon-tag {
          font-size:9.5px; font-weight:600; letter-spacing:0.5px;
          text-transform:uppercase; padding:2px 7px; border-radius:10px;
          background:rgba(0,0,0,0.06); color:#8A6A5A;
        }
        .pp2-author-meta { font-size:12px; color:#B08878; font-weight:300; }

        /* post title + body */
        .pp2-post-title {
          font-family:'Lora',serif;
          font-size:clamp(22px,3.5vw,30px);
          font-weight:500; color:#1A0A00;
          line-height:1.3; margin:0 0 1rem;
        }
        .pp2-post-body {
          font-size:15px; color:#3D1A0A;
          line-height:1.85; white-space:pre-wrap;
          margin:0 0 1.5rem;
          font-weight:300;
          font-family:'Lora',serif;
        }

        /* images */
        .pp2-images {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
          gap:8px; margin-bottom:1.5rem;
        }
        .pp2-image {
          border-radius:12px; overflow:hidden;
          aspect-ratio:4/3;
          border:0.5px solid #EDD9CC;
        }
        .pp2-image img { width:100%; height:100%; object-fit:cover; transition:transform 0.3s; }
        .pp2-image:hover img { transform:scale(1.03); }

        /* topic pills */
        .pp2-topics {
          display:flex; flex-wrap:wrap; gap:6px; margin-bottom:1.5rem;
        }
        .pp2-topic {
          padding:5px 12px; border-radius:20px;
          font-size:12px; font-weight:500;
          background:#F5EDE6; color:#8A6A5A;
          text-decoration:none; transition:all 0.15s;
        }
        .pp2-topic:hover { background:#FAECE7; color:#D85A30; }

        /* action bar */
        .pp2-actions {
          display:flex; align-items:center; gap:10px;
          padding-top:1.25rem; border-top:1px solid #F5E8DC;
          flex-wrap:wrap;
        }
        .pp2-like-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:9px 18px;
          border-radius:22px; border:1.5px solid;
          font-size:13.5px; font-weight:500;
          font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:all 0.2s;
        }
        .pp2-like-btn--off {
          background:transparent; border-color:#EDD9CC; color:#8A6A5A;
        }
        .pp2-like-btn--off:hover { border-color:#F0997B; color:#D85A30; }
        .pp2-like-btn--on {
          background:#FAECE7; border-color:#F0997B; color:#D85A30;
        }
        .pp2-like-heart {
          font-size:16px; line-height:1;
          display:inline-block;
        }
        .pp2-like-heart--anim { animation:likePop 0.4s ease; }

        .pp2-comment-jump {
          display:inline-flex; align-items:center; gap:7px;
          padding:9px 18px; border-radius:22px;
          border:1.5px solid #EDD9CC; background:transparent;
          font-size:13.5px; font-weight:500; color:#8A6A5A;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          transition:all 0.15s; text-decoration:none;
        }
        .pp2-comment-jump:hover { border-color:#F0997B; color:#D85A30; }

        .pp2-delete-btn {
          margin-left:auto; padding:9px 16px; border-radius:22px;
          border:1.5px solid #FECACA; background:transparent;
          color:#DC2626; font-size:13px; font-weight:500;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          transition:all 0.15s;
        }
        .pp2-delete-btn:hover { background:#FEF2F2; }

        .pp2-login-nudge {
          font-size:13px; color:#B08878; font-weight:300;
        }
        .pp2-login-nudge a { color:#D85A30; font-weight:500; text-decoration:none; }

        /* ── comments section ── */
        .pp2-comments-section {
          background:#FFFAF6; border:0.5px solid #EDD9CC;
          border-radius:20px; padding:1.5rem 1.75rem;
        }
        .pp2-comments-header {
          display:flex; align-items:center; gap:10px;
          margin-bottom:1.25rem;
        }
        .pp2-comments-title {
          font-family:'Lora',serif; font-size:18px; font-weight:500;
          color:#1A0A00; margin:0;
        }
        .pp2-comments-count {
          font-size:12px; font-weight:500; color:#fff;
          background:#D85A30; padding:2px 9px; border-radius:12px;
        }

        /* comment form */
        .pp2-comment-form { margin-bottom:1.5rem; }
        .pp2-comment-input-wrap { position:relative; }
        .pp2-comment-textarea {
          width:100%; font-family:'DM Sans',sans-serif;
          font-size:13.5px; color:#1A0A00;
          background:#fff; border:1.5px solid #E8D5C8;
          border-radius:12px; padding:12px 14px;
          outline:none; box-sizing:border-box;
          resize:vertical; min-height:100px; line-height:1.65;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .pp2-comment-textarea::placeholder { color:#C4A898; }
        .pp2-comment-textarea:focus {
          border-color:#D85A30;
          box-shadow:0 0 0 3px rgba(216,90,48,0.1);
        }
        .pp2-comment-bottom {
          display:flex; align-items:center; justify-content:space-between;
          margin-top:8px; flex-wrap:wrap; gap:8px;
        }
        .pp2-anon-check {
          display:flex; align-items:center; gap:7px;
          font-size:12.5px; color:#8A6A5A; cursor:pointer;
          font-weight:300;
        }
        .pp2-anon-check input { accent-color:#D85A30; }
        .pp2-comment-submit {
          padding:9px 20px; background:#D85A30; color:#fff;
          border:none; border-radius:20px;
          font-size:13px; font-weight:500;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          transition:background 0.15s, transform 0.1s;
        }
        .pp2-comment-submit:hover:not(:disabled) { background:#B84020; }
        .pp2-comment-submit:active:not(:disabled) { transform:scale(0.97); }
        .pp2-comment-submit:disabled { opacity:0.65; cursor:not-allowed; }

        /* comment list */
        .pp2-comment-list { list-style:none; margin:0; padding:0; }
        .pp2-comment {
          display:flex; gap:12px; padding:1rem 0;
          border-top:0.5px solid #F5E8DC;
          animation:commentIn 0.3s ease both;
        }
        .pp2-comment:first-child { border-top:none; }
        .pp2-comment-av {
          width:36px; height:36px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:600; flex-shrink:0;
          margin-top:2px;
        }
        .pp2-comment-body { flex:1; }
        .pp2-comment-head {
          display:flex; align-items:center; gap:8px;
          margin-bottom:5px; flex-wrap:wrap;
        }
        .pp2-comment-name { font-size:13px; font-weight:500; color:#1A0A00; }
        .pp2-comment-time { font-size:11px; color:#C4A898; font-weight:300; }
        .pp2-comment-text { font-size:13.5px; color:#3D1A0A; line-height:1.65; margin:0; white-space:pre-wrap; font-weight:300; }

        /* no comments state */
        .pp2-no-comments {
          text-align:center; padding:2rem 1rem;
          border-top:0.5px solid #F5E8DC;
        }
        .pp2-no-comments-icon { font-size:32px; margin-bottom:8px; }
        .pp2-no-comments-text { font-size:13.5px; color:#B08878; font-weight:300; }

        /* ── toast ── */
        .pp2-toast {
          position:fixed; bottom:1.5rem; left:50%;
          transform:translateX(-50%);
          background:#1A0A00; color:#fff;
          font-size:13px; font-weight:500;
          padding:10px 20px; border-radius:22px;
          box-shadow:0 4px 20px rgba(0,0,0,0.2);
          z-index:999; white-space:nowrap;
          animation:toastIn 0.3s ease;
          font-family:'DM Sans',sans-serif;
        }

        /* ── delete modal ── */
        .pp2-modal-backdrop {
          position:fixed; inset:0; background:rgba(0,0,0,0.45);
          z-index:1000; display:flex; align-items:center; justify-content:center;
          padding:1rem;
        }
        .pp2-modal {
          background:#FFFAF6; border-radius:20px; padding:2rem;
          max-width:360px; width:100%; text-align:center;
          animation:modalIn 0.25s ease;
          border:0.5px solid #EDD9CC;
        }
        .pp2-modal-icon { font-size:40px; margin-bottom:0.75rem; }
        .pp2-modal-title { font-family:'Lora',serif; font-size:20px; font-weight:500; color:#1A0A00; margin:0 0 8px; }
        .pp2-modal-sub { font-size:13px; color:#8A6A5A; margin:0 0 1.5rem; font-weight:300; line-height:1.55; }
        .pp2-modal-actions { display:flex; gap:10px; }
        .pp2-modal-cancel {
          flex:1; padding:11px; background:transparent;
          border:1.5px solid #EDD9CC; border-radius:12px;
          font-size:13.5px; font-weight:500; color:#8A6A5A;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          transition:all 0.15s;
        }
        .pp2-modal-cancel:hover { border-color:#C4A898; }
        .pp2-modal-confirm {
          flex:1; padding:11px; background:#DC2626;
          border:none; border-radius:12px;
          font-size:13.5px; font-weight:500; color:#fff;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          transition:background 0.15s;
        }
        .pp2-modal-confirm:hover { background:#B91C1C; }
      `}</style>

      {skeletonStyle}

      <div className="pp2-root">

        {/* ── back link ── */}
        <Link to="/" className="pp2-back">← Feed pe wapas jao</Link>

        {/* ── type banner ── */}
        <div
          className="pp2-type-banner"
          style={{ background:`linear-gradient(135deg, ${typeMeta.accentBg}, ${typeMeta.accentBg}cc)`, color:typeMeta.accentText }}
        >
          <span className="pp2-type-banner-icon">{typeMeta.icon}</span>
          <span className="pp2-type-banner-label">{typeMeta.label}</span>
          <span className="pp2-type-banner-date">{postDate}</span>
        </div>

        {/* ── main card ── */}
        <div className="pp2-card">

          {/* author */}
          <div className="pp2-author-row">
            <div className="pp2-avatar" style={{ background:pal.bg, color:pal.text }}>
              {post.author?.isAnonymous ? "?" : initial}
              <div className="pp2-avatar-ring" style={{ borderColor:pal.text }} />
            </div>
            <div className="pp2-author-info">
              <div className="pp2-author-name">
                {display}
                {post.author?.isAnonymous && <span className="pp2-anon-tag">Anonymous</span>}
              </div>
              <div className="pp2-author-meta">
                {post.createdAt ? timeAgo(post.createdAt) : ""} · {post.commentCount || 0} comments
              </div>
            </div>
          </div>

          {/* title */}
          {post.title && <h1 className="pp2-post-title">{post.title}</h1>}

          {/* body */}
          <p className="pp2-post-body">{post.content}</p>

          {/* images */}
          {post.images?.length > 0 && (
            <div className="pp2-images">
              {post.images.map((src) => (
                <div key={src} className="pp2-image">
                  <img src={mediaUrl(src)} alt="" />
                </div>
              ))}
            </div>
          )}

          {/* topics */}
          {post.topics?.length > 0 && (
            <div className="pp2-topics">
              {post.topics.map((t) => (
                <Link key={t} to={`/explore?topic=${encodeURIComponent(t)}`} className="pp2-topic">
                  {topicLabel(t)}
                </Link>
              ))}
            </div>
          )}

          {/* actions */}
          <div className="pp2-actions">
            <button
              type="button"
              className={`pp2-like-btn ${post.likedByMe ? "pp2-like-btn--on" : "pp2-like-btn--off"}`}
              onClick={toggleLike}
            >
              <span className={`pp2-like-heart ${likeAnim ? "pp2-like-heart--anim" : ""}`}>
                {post.likedByMe ? "♥" : "♡"}
              </span>
              {post.likedByMe ? "Liked" : "Like"} · {post.likeCount || 0}
            </button>

            <button
              type="button"
              className="pp2-comment-jump"
              onClick={() => commentRef.current?.scrollIntoView({ behavior:"smooth" })}
            >
              💬 {post.commentCount || 0} comments
            </button>

            {!isAuthenticated && (
              <span className="pp2-login-nudge">
                <Link to="/login">Login karo</Link> to like & comment
              </span>
            )}

            {post.isAuthor && (
              <button type="button" className="pp2-delete-btn" onClick={() => setShowDelete(true)}>
                🗑 Delete
              </button>
            )}
          </div>
        </div>

        {/* ── comments ── */}
        <section className="pp2-comments-section" ref={commentRef}>
          <div className="pp2-comments-header">
            <h2 className="pp2-comments-title">Comments</h2>
            <span className="pp2-comments-count">{comments.length}</span>
          </div>

          {/* comment form */}
          {isAuthenticated ? (
            <form onSubmit={sendComment} className="pp2-comment-form">
              <textarea
                className="pp2-comment-textarea"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Apna perspective share karo — supportive aur kind raho…"
                required
              />
              <div className="pp2-comment-bottom">
                <label className="pp2-anon-check">
                  <input
                    type="checkbox"
                    checked={commentAnon}
                    onChange={(e) => setCommentAnon(e.target.checked)}
                  />
                  Anonymously comment karo
                </label>
                <button
                  type="submit"
                  className="pp2-comment-submit"
                  disabled={submitting || !commentText.trim()}
                >
                  {submitting ? "Post ho raha hai…" : "Comment karo →"}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ padding:"1rem 0 1.25rem", borderBottom:"0.5px solid #F5E8DC", marginBottom:"0.5rem" }}>
              <span className="pp2-login-nudge">
                <Link to="/login">Login karo</Link> ya{" "}
                <Link to="/register" style={{ color:"#D85A30", fontWeight:500, textDecoration:"none" }}>account banao</Link>{" "}
                comment karne ke liye.
              </span>
            </div>
          )}

          {/* comment list */}
          {comments.length === 0 ? (
            <div className="pp2-no-comments">
              <div className="pp2-no-comments-icon">💬</div>
              <p className="pp2-no-comments-text">Pehle comment karne wale bano. Kuch share karo!</p>
            </div>
          ) : (
            <ul className="pp2-comment-list">
              {comments.map((c, i) => (
                <CommentItem key={c.id} comment={c} index={i} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── toast ── */}
      {toast && <div className="pp2-toast">{toast}</div>}

      {/* ── delete modal ── */}
      {showDelete && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}

/* ── skeleton CSS (shared) ── */
const skeletonCSS = `
  @keyframes shimmerSk { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  .pp2-skeleton-wrap { max-width:720px; margin:0 auto; font-family:'DM Sans',sans-serif; }
  .pp2-skel { background:linear-gradient(90deg,#F5EDE6 25%,#EDD9CC 50%,#F5EDE6 75%); background-size:400px 100%; animation:shimmerSk 1.2s infinite linear; border-radius:8px; }
  .pp2-skel-hero { height:60px; border-radius:16px 16px 0 0; margin-bottom:0; }
  .pp2-skel-card { background:#FFFAF6; border:0.5px solid #EDD9CC; border-radius:0 0 20px 20px; padding:1.75rem; margin-bottom:1rem; }
  .pp2-skel-circle { width:52px; height:52px; border-radius:14px; flex-shrink:0; }
  .pp2-skel-line { height:13px; margin-bottom:6px; }
  .pp2-error-state { text-align:center; padding:4rem 1rem; font-family:'DM Sans',sans-serif; }
  .pp2-error-icon { font-size:48px; margin-bottom:1rem; }
  .pp2-error-state h2 { font-family:'Lora',serif; font-size:22px; color:#1A0A00; margin:0 0 8px; }
  .pp2-error-state p { font-size:14px; color:#B08878; margin:0 0 1.5rem; }
  .pp2-back-btn { display:inline-block; padding:10px 20px; background:#D85A30; color:#fff; border-radius:20px; font-size:13px; font-weight:500; text-decoration:none; }
`;

const skeletonStyle = <style>{skeletonCSS}</style>;
