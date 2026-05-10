import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { PostCard } from "../components/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/* ── generate a consistent warm color from username ── */
const AVATAR_PALETTES = [
  { bg: "#FAECE7", text: "#993C1D", ring: "#F5C4B3" },
  { bg: "#E1F5EE", text: "#0F6E56", ring: "#9FE1CB" },
  { bg: "#E6F1FB", text: "#185FA5", ring: "#B5D4F4" },
  { bg: "#FAEEDA", text: "#854F0B", ring: "#FAC775" },
  { bg: "#FBEAF0", text: "#993556", ring: "#F4C0D1" },
  { bg: "#EAF3DE", text: "#3B6D11", ring: "#C0DD97" },
];

function getPalette(username = "") {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

/* ── stat card ── */
function StatCard({ label, value, icon }) {
  return (
    <div className="pp-stat">
      <span className="pp-stat-icon">{icon}</span>
      <span className="pp-stat-val">{value ?? "—"}</span>
      <span className="pp-stat-label">{label}</span>
    </div>
  );
}

export function ProfilePage() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [data, setData]   = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab]     = useState("stories"); // "stories" | "about"

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    api
      .get(`/users/${encodeURIComponent(username)}`)
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch(() => { if (!cancelled) setError("Profile nahi mila."); });
    return () => { cancelled = true; };
  }, [username]);

  if (error) return (
    <div className="pp-empty-state">
      <div className="pp-empty-icon">🔍</div>
      <p className="pp-empty-title">Profile nahi mila</p>
      <p className="pp-empty-sub">Shayad username change ho gaya ho.</p>
      <Link to="/" className="pp-back-link">← Feed pe wapas jao</Link>
    </div>
  );

  if (!data) return (
    <div className="pp-skeleton-wrap">
      <div className="pp-skel pp-skel-banner" />
      <div className="pp-skel-body">
        <div className="pp-skel pp-skel-avatar" />
        <div style={{ flex: 1 }}>
          <div className="pp-skel pp-skel-line" style={{ width: "40%", marginBottom: 10 }} />
          <div className="pp-skel pp-skel-line" style={{ width: "65%" }} />
        </div>
      </div>
    </div>
  );

  const { user, posts } = data;
  const isMe    = me?.username === user.username;
  const palette = getPalette(user.username);
  const initial = (user.username[0] || "?").toUpperCase();
  const joinYear = user.createdAt ? new Date(user.createdAt).getFullYear() : "—";
  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSkel {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .pp-root {
          font-family: 'DM Sans', sans-serif;
          max-width: 720px;
          margin: 0 auto;
          padding-bottom: 3rem;
          animation: fadeUp 0.4s ease both;
        }

        /* ── banner ── */
        .pp-banner {
          height: 160px;
          border-radius: 16px 16px 0 0;
          background: linear-gradient(135deg, #D85A30 0%, #B84020 45%, #7A2A0A 100%);
          position: relative;
          overflow: hidden;
        }
        .pp-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 15% 50%, rgba(255,255,255,0.08) 0%, transparent 55%),
            radial-gradient(circle at 85% 20%, rgba(0,0,0,0.12) 0%, transparent 50%);
        }
        .pp-banner-circles {
          position: absolute;
          inset: 0;
        }
        .pp-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* ── profile card ── */
        .pp-card {
          background: #FFFAF6;
          border: 0.5px solid #EDD9CC;
          border-top: none;
          border-radius: 0 0 16px 16px;
          padding: 0 1.75rem 1.5rem;
          margin-bottom: 1.25rem;
        }

        /* avatar floats over banner */
        .pp-avatar-wrap {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: -44px;
          margin-bottom: 1rem;
          position: relative;
        }

        .pp-avatar {
          width: 88px;
          height: 88px;
          border-radius: 22px;
          border: 4px solid #FFFAF6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Lora', serif;
          font-size: 32px;
          font-weight: 500;
          flex-shrink: 0;
          position: relative;
        }

        .pp-avatar-ring {
          position: absolute;
          inset: -6px;
          border-radius: 26px;
          border: 2px solid;
          opacity: 0.4;
          pointer-events: none;
        }

        /* edit button */
        .pp-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1.5px solid #D85A30;
          color: #D85A30;
          background: transparent;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          margin-bottom: 4px;
        }
        .pp-edit-btn:hover {
          background: #D85A30;
          color: #fff;
        }

        /* name + bio */
        .pp-username {
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 500;
          color: #1A0A00;
          margin: 0 0 3px;
        }
        .pp-handle {
          font-size: 13px;
          color: #B08878;
          margin: 0 0 0.75rem;
          font-weight: 300;
        }
        .pp-bio {
          font-size: 14px;
          color: #5A3A2A;
          line-height: 1.65;
          margin: 0 0 1.25rem;
          font-weight: 300;
        }
        .pp-no-bio {
          font-size: 13px;
          color: #C4A898;
          font-style: italic;
          margin: 0 0 1.25rem;
        }

        /* stats row */
        .pp-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 0;
        }
        .pp-stat {
          background: #fff;
          border: 0.5px solid #EDD9CC;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .pp-stat-icon { font-size: 16px; line-height: 1; margin-bottom: 2px; }
        .pp-stat-val {
          font-size: 20px;
          font-weight: 500;
          color: #1A0A00;
          font-family: 'Lora', serif;
          line-height: 1;
        }
        .pp-stat-label {
          font-size: 11px;
          color: #B08878;
          font-weight: 400;
          text-align: center;
          margin-top: 2px;
        }

        /* ── tab bar ── */
        .pp-tabs {
          display: flex;
          gap: 0;
          background: #FFFAF6;
          border: 0.5px solid #EDD9CC;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 1.25rem;
        }
        .pp-tab {
          flex: 1;
          padding: 9px;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          color: #B08878;
          background: none;
          border: none;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .pp-tab.active {
          background: #D85A30;
          color: #fff;
        }
        .pp-tab:not(.active):hover {
          background: #FAECE7;
          color: #D85A30;
        }

        /* ── empty posts ── */
        .pp-no-posts {
          text-align: center;
          padding: 3rem 1rem;
          background: #FFFAF6;
          border: 0.5px dashed #EDD9CC;
          border-radius: 14px;
        }
        .pp-no-posts-icon { font-size: 36px; margin-bottom: 0.75rem; }
        .pp-no-posts-title {
          font-family: 'Lora', serif;
          font-size: 17px;
          color: #1A0A00;
          margin: 0 0 6px;
        }
        .pp-no-posts-sub {
          font-size: 13px;
          color: #B08878;
          margin: 0 0 1.25rem;
          font-weight: 300;
        }
        .pp-write-btn {
          display: inline-block;
          padding: 9px 20px;
          background: #D85A30;
          color: #fff;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .pp-write-btn:hover { background: #B84020; }

        /* ── about tab ── */
        .pp-about-card {
          background: #FFFAF6;
          border: 0.5px solid #EDD9CC;
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
        }
        .pp-about-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 0.5px solid #F5E8DC;
          font-size: 14px;
          color: #5A3A2A;
        }
        .pp-about-row:last-child { border-bottom: none; }
        .pp-about-icon { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
        .pp-about-label { color: #B08878; font-size: 12px; min-width: 90px; font-weight: 400; }

        /* ── skeleton ── */
        .pp-skeleton-wrap { padding: 0; }
        .pp-skel {
          background: linear-gradient(90deg, #F5EDE6 25%, #EDD9CC 50%, #F5EDE6 75%);
          background-size: 400px 100%;
          animation: shimmerSkel 1.2s infinite linear;
          border-radius: 8px;
        }
        .pp-skel-banner { height: 160px; border-radius: 16px 16px 0 0; }
        .pp-skel-body { display: flex; gap: 16px; padding: 1.5rem; background: #FFFAF6; border-radius: 0 0 16px 16px; border: 0.5px solid #EDD9CC; }
        .pp-skel-avatar { width: 80px; height: 80px; border-radius: 20px; flex-shrink: 0; }
        .pp-skel-line { height: 16px; }

        /* ── error / empty ── */
        .pp-empty-state {
          text-align: center;
          padding: 4rem 1rem;
        }
        .pp-empty-icon { font-size: 48px; margin-bottom: 1rem; }
        .pp-empty-title { font-family: 'Lora', serif; font-size: 20px; color: #1A0A00; margin: 0 0 8px; }
        .pp-empty-sub { font-size: 14px; color: #B08878; margin: 0 0 1.5rem; }
        .pp-back-link { color: #D85A30; text-decoration: none; font-size: 14px; font-weight: 500; }
      `}</style>

      <div className="pp-root">
        {/* ── banner ── */}
        <div className="pp-banner">
          <div className="pp-banner-circles">
            <div className="pp-circle" style={{ width: 200, height: 200, top: -60, right: -30 }} />
            <div className="pp-circle" style={{ width: 120, height: 120, bottom: -40, left: 40 }} />
            <div className="pp-circle" style={{ width: 60, height: 60, top: 20, left: "40%" }} />
          </div>
        </div>

        {/* ── profile card ── */}
        <div className="pp-card">
          <div className="pp-avatar-wrap">
            <div
              className="pp-avatar"
              style={{ background: palette.bg, color: palette.text }}
            >
              {initial}
              <div className="pp-avatar-ring" style={{ borderColor: palette.ring }} />
            </div>
            {isMe && (
              <Link to="/settings" className="pp-edit-btn">
                ✏ Edit profile
              </Link>
            )}
          </div>

          <h1 className="pp-username">{user.username}</h1>
          <p className="pp-handle">@{user.username}</p>

          {user.bio
            ? <p className="pp-bio">{user.bio}</p>
            : <p className="pp-no-bio">{isMe ? "Apna bio add karo — Settings mein jao" : "No bio yet."}</p>
          }

          <div className="pp-stats">
            <StatCard label="Stories" value={posts.length}  icon="📖" />
            <StatCard label="Total likes" value={totalLikes} icon="♥" />
            <StatCard label="Member since" value={joinYear} icon="🗓" />
          </div>
        </div>

        {/* ── tab bar ── */}
        <div className="pp-tabs">
          <button
            className={`pp-tab ${tab === "stories" ? "active" : ""}`}
            onClick={() => setTab("stories")}
          >
            Stories
          </button>
          <button
            className={`pp-tab ${tab === "about" ? "active" : ""}`}
            onClick={() => setTab("about")}
          >
            About
          </button>
        </div>

        {/* ── stories tab ── */}
        {tab === "stories" && (
          posts.length === 0 ? (
            <div className="pp-no-posts">
              <div className="pp-no-posts-icon">✍️</div>
              <p className="pp-no-posts-title">Koi story nahi hai abhi</p>
              <p className="pp-no-posts-sub">
                {isMe
                  ? "Apni pehli story share karo — koi wait kar raha hai."
                  : "Is user ne abhi kuch share nahi kiya."}
              </p>
              {isMe && <Link to="/create" className="pp-write-btn">Share a story</Link>}
            </div>
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} compact />)
          )
        )}

        {/* ── about tab ── */}
        {tab === "about" && (
          <div className="pp-about-card">
            <div className="pp-about-row">
              <span className="pp-about-icon">👤</span>
              <span className="pp-about-label">Username</span>
              <span>@{user.username}</span>
            </div>
            <div className="pp-about-row">
              <span className="pp-about-icon">📖</span>
              <span className="pp-about-label">Stories shared</span>
              <span>{posts.length}</span>
            </div>
            <div className="pp-about-row">
              <span className="pp-about-icon">♥</span>
              <span className="pp-about-label">Total likes</span>
              <span>{totalLikes}</span>
            </div>
            <div className="pp-about-row">
              <span className="pp-about-icon">🗓</span>
              <span className="pp-about-label">Member since</span>
              <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : "—"}</span>
            </div>
            {user.bio && (
              <div className="pp-about-row" style={{ alignItems: "flex-start" }}>
                <span className="pp-about-icon">💬</span>
                <span className="pp-about-label">Bio</span>
                <span style={{ lineHeight: 1.6 }}>{user.bio}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
