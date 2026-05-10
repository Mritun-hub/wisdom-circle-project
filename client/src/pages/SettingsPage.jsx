import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

/* ── section wrapper card ── */
function SettingSection({ icon, title, desc, children }) {
  return (
    <div className="sp-section">
      <div className="sp-section-header">
        <span className="sp-section-icon">{icon}</span>
        <div>
          <h2 className="sp-section-title">{title}</h2>
          <p className="sp-section-desc">{desc}</p>
        </div>
      </div>
      <div className="sp-section-body">{children}</div>
    </div>
  );
}

/* ── individual field ── */
function Field({ label, hint, children }) {
  return (
    <div className="sp-field">
      <label className="sp-label">{label}</label>
      {children}
      {hint && <p className="sp-hint">{hint}</p>}
    </div>
  );
}

/* ── toast notification ── */
function Toast({ msg, type }) {
  return (
    <div className={`sp-toast sp-toast--${type}`}>
      <span className="sp-toast-icon">{type === "success" ? "✓" : "✕"}</span>
      {msg}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export function SettingsPage() {
  const { user, refreshMe } = useAuth();

  const [username,            setUsername]            = useState("");
  const [bio,                 setBio]                 = useState("");
  const [anonymousDisplayName,setAnonymousDisplayName]= useState("");
  const [toast,               setToast]               = useState(null); // { msg, type }
  const [saving,              setSaving]              = useState(false);
  const [usernameWarning,     setUsernameWarning]     = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAnonymousDisplayName(user.anonymousDisplayName || "Anonymous");
    }
  }, [user]);

  /* watch username changes to show warning */
  useEffect(() => {
    if (user) setUsernameWarning(username !== user.username && username.length > 0);
  }, [username, user]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/me", { username, bio, anonymousDisplayName });
      await refreshMe();
      showToast("Your profile has been saved successfully.", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Could not save changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return (
    <div className="sp-loading">
      <div className="sp-loading-spinner" />
      <p>Loading your settings…</p>
    </div>
  );

  const bioLeft = 500 - bio.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes toastSlide {
          from { opacity:0; transform:translateY(16px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position:200% center; }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
        @keyframes warnPulse {
          0%,100% { border-color:#F59E0B; }
          50%     { border-color:#D97706; }
        }

        .sp-root {
          font-family: 'DM Sans', sans-serif;
          max-width: 680px;
          margin: 0 auto;
          padding-bottom: 4rem;
          animation: fadeUp 0.4s ease both;
        }

        /* ── page header ── */
        .sp-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #EDD9CC;
        }
        .sp-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 1.4px;
          text-transform: uppercase; color: #D85A30; margin: 0 0 8px;
        }
        .sp-page-title {
          font-family: 'Lora', serif; font-size: 28px; font-weight: 500;
          color: #1A0A00; margin: 0 0 6px; line-height: 1.2;
        }
        .sp-page-sub {
          font-size: 14px; color: #8A6A5A; margin: 0; font-weight: 300;
          line-height: 1.6;
        }

        /* ── avatar preview strip ── */
        .sp-avatar-strip {
          background: linear-gradient(135deg, #FFF8F2, #FFF0E6);
          border: 0.5px solid #EDD9CC;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .sp-avatar-big {
          width: 72px; height: 72px; border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Lora', serif; font-size: 28px; font-weight: 500;
          background: #FAECE7; color: #993C1D;
          flex-shrink: 0;
          border: 3px solid #fff;
          box-shadow: 0 2px 12px rgba(216,90,48,0.12);
        }
        .sp-avatar-info { flex: 1; }
        .sp-avatar-name {
          font-size: 16px; font-weight: 500; color: #1A0A00; margin: 0 0 3px;
        }
        .sp-avatar-handle {
          font-size: 12px; color: #B08878; margin: 0 0 6px; font-weight: 300;
        }
        .sp-avatar-anon-preview {
          display: inline-flex; align-items: center; gap: 5px;
          background: #F5EDE6; color: #8A6A5A;
          font-size: 11px; padding: 3px 10px; border-radius: 10px;
        }

        /* ── section card ── */
        .sp-section {
          background: #FFFAF6;
          border: 0.5px solid #EDD9CC;
          border-radius: 16px;
          margin-bottom: 1rem;
          overflow: hidden;
          animation: fadeUp 0.4s ease both;
        }
        .sp-section-header {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 1.1rem 1.5rem;
          border-bottom: 0.5px solid #F5E8DC;
          background: linear-gradient(to right, #FFFAF6, #FFF5EE);
        }
        .sp-section-icon {
          font-size: 20px; flex-shrink: 0; margin-top: 1px;
        }
        .sp-section-title {
          font-size: 14px; font-weight: 500; color: #1A0A00; margin: 0 0 3px;
          font-family: 'DM Sans', sans-serif;
        }
        .sp-section-desc {
          font-size: 12px; color: #B08878; margin: 0; font-weight: 300;
          line-height: 1.5;
        }
        .sp-section-body { padding: 1.25rem 1.5rem; }

        /* ── fields ── */
        .sp-field { margin-bottom: 1.1rem; }
        .sp-field:last-child { margin-bottom: 0; }
        .sp-label {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px; font-weight: 500; color: #5A3A2A;
          text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px;
        }
        .sp-hint {
          font-size: 11.5px; color: #B08878; margin: 5px 0 0;
          font-weight: 300; line-height: 1.5;
        }
        .sp-counter {
          font-size: 10.5px; font-weight: 400; text-transform: none;
          letter-spacing: 0; color: #C4A898;
        }
        .sp-counter--warn { color: #D85A30; }

        .sp-input, .sp-textarea {
          width: 100%; font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #1A0A00;
          background: #fff; border: 1.5px solid #E8D5C8;
          border-radius: 10px; padding: 11px 13px;
          outline: none; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sp-input::placeholder, .sp-textarea::placeholder { color: #C4A898; }
        .sp-input:focus, .sp-textarea:focus {
          border-color: #D85A30;
          box-shadow: 0 0 0 3px rgba(216,90,48,0.1);
        }
        .sp-textarea { min-height: 100px; resize: vertical; line-height: 1.65; }

        /* username warning */
        .sp-username-warning {
          display: flex; align-items: flex-start; gap: 8px;
          background: #FFFBEB; border: 1.5px solid #F59E0B;
          border-radius: 10px; padding: 10px 13px; margin-top: 7px;
          animation: warnPulse 2s ease infinite;
        }
        .sp-warning-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .sp-warning-text { font-size: 12px; color: #92400E; line-height: 1.55; font-weight: 300; margin: 0; }

        /* anon name preview */
        .sp-anon-preview-box {
          background: #F5EDE6; border: 0.5px solid #EDD9CC;
          border-radius: 10px; padding: 10px 13px; margin-top: 7px;
          display: flex; align-items: center; gap: 8px;
        }
        .sp-anon-preview-label { font-size: 11px; color: #B08878; font-weight: 400; }
        .sp-anon-preview-name  { font-size: 13px; color: #1A0A00; font-weight: 500; }

        /* ── danger zone ── */
        .sp-danger-section {
          background: #FFF5F5;
          border: 0.5px solid #FECACA;
          border-radius: 16px;
          padding: 1.1rem 1.5rem;
          margin-bottom: 1rem;
        }
        .sp-danger-title {
          font-size: 13px; font-weight: 500; color: #DC2626; margin: 0 0 4px;
          display: flex; align-items: center; gap: 6px;
        }
        .sp-danger-desc {
          font-size: 12px; color: #B08878; margin: 0 0 0.9rem; font-weight: 300; line-height: 1.5;
        }
        .sp-danger-btn {
          padding: 8px 16px; background: transparent;
          border: 1.5px solid #FECACA; border-radius: 10px;
          font-size: 12.5px; font-weight: 500; color: #DC2626;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.15s;
        }
        .sp-danger-btn:hover { background: #FEF2F2; border-color: #FCA5A5; }

        /* ── save bar (sticky bottom) ── */
        .sp-save-bar {
          position: sticky; bottom: 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
          background: #FFFAF6; border: 0.5px solid #EDD9CC;
          border-radius: 14px; padding: 0.9rem 1.25rem;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          gap: 12px; flex-wrap: wrap;
          margin-top: 1.25rem;
        }
        .sp-save-info {
          font-size: 13px; color: #8A6A5A; font-weight: 300;
        }
        .sp-save-btn {
          padding: 11px 28px;
          background: #D85A30; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 500; border: none; border-radius: 10px;
          cursor: pointer; transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.2px; white-space: nowrap;
        }
        .sp-save-btn:hover:not(:disabled) { background: #B84020; }
        .sp-save-btn:active:not(:disabled) { transform: scale(0.98); }
        .sp-save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .sp-save-btn--loading {
          background: linear-gradient(90deg,#D85A30,#E87A50,#D85A30) !important;
          background-size: 200% auto !important;
          animation: shimmer 1.2s linear infinite;
        }

        /* ── toast ── */
        .sp-toast {
          position: fixed; bottom: 1.5rem; right: 1.5rem;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 18px; border-radius: 12px;
          font-size: 13.5px; font-weight: 500;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          z-index: 999; animation: toastSlide 0.3s ease;
          font-family: 'DM Sans', sans-serif; max-width: 320px;
        }
        .sp-toast--success { background: #1A0A00; color: #fff; }
        .sp-toast--error   { background: #DC2626; color: #fff; }
        .sp-toast-icon {
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0;
        }
        .sp-toast--success .sp-toast-icon { background: #D85A30; }
        .sp-toast--error   .sp-toast-icon { background: rgba(255,255,255,0.25); }

        /* ── loading ── */
        .sp-loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 4rem; gap: 1rem;
          color: #B08878; font-size: 14px;
        }
        .sp-loading-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2.5px solid #EDD9CC;
          border-top-color: #D85A30;
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div className="sp-root">

        {/* ── page header ── */}
        <div className="sp-header">
          <p className="sp-eyebrow">Account</p>
          <h1 className="sp-page-title">Settings</h1>
          <p className="sp-page-sub">
            Manage how you appear on the platform and control your privacy preferences.
          </p>
        </div>

        {/* ── live avatar preview ── */}
        <div className="sp-avatar-strip">
          <div className="sp-avatar-big">
            {(username[0] || "?").toUpperCase()}
          </div>
          <div className="sp-avatar-info">
            <p className="sp-avatar-name">{username || "Your Name"}</p>
            <p className="sp-avatar-handle">@{username || "username"}</p>
            <span className="sp-avatar-anon-preview">
              🎭 Anonymous as: <strong style={{ marginLeft:4 }}>{anonymousDisplayName || "Anonymous"}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── PUBLIC PROFILE ── */}
          <SettingSection
            icon="👤"
            title="Public Profile"
            desc="This information is visible to everyone on LifeThreads."
          >
            <Field
              label="Username"
              hint="Your unique handle on the platform. Changing it will break existing profile links."
            >
              <input
                className="sp-input"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                minLength={2}
                maxLength={32}
                placeholder="your_username"
                required
              />
              {usernameWarning && (
                <div className="sp-username-warning">
                  <span className="sp-warning-icon">⚠️</span>
                  <p className="sp-warning-text">
                    <strong>Heads up:</strong> Changing your username will break any existing links to your profile. Others who have bookmarked your page will need to find you again.
                  </p>
                </div>
              )}
            </Field>

            <Field label={
              <span style={{ display:"flex", justifyContent:"space-between", width:"100%" }}>
                <span>Bio</span>
                <span className={`sp-counter ${bioLeft < 50 ? "sp-counter--warn" : ""}`}>{bioLeft} characters left</span>
              </span>
            }>
              <textarea
                className="sp-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                placeholder="Tell the community a little about yourself — your experiences, what you're here for, or anything you'd like to share."
              />
            </Field>
          </SettingSection>

          {/* ── PRIVACY ── */}
          <SettingSection
            icon="🎭"
            title="Anonymous Identity"
            desc="When you post anonymously, this name appears instead of your username."
          >
            <Field
              label="Anonymous Display Name"
              hint='This label replaces your username on anonymous posts. Be creative — "Quiet Observer", "Night Owl", or just "Anonymous" works great.'
            >
              <input
                className="sp-input"
                value={anonymousDisplayName}
                onChange={(e) => setAnonymousDisplayName(e.target.value)}
                maxLength={40}
                placeholder='e.g. Quiet Observer, Night Owl, Wandering Soul'
              />
              {anonymousDisplayName && (
                <div className="sp-anon-preview-box">
                  <span className="sp-anon-preview-label">Preview:</span>
                  <span className="sp-anon-preview-name">🎭 {anonymousDisplayName}</span>
                  <span className="sp-anon-preview-label" style={{ marginLeft:"auto" }}>will show on anonymous posts</span>
                </div>
              )}
            </Field>
          </SettingSection>

          {/* ── ACCOUNT INFO (read-only) ── */}
          <SettingSection
            icon="📋"
            title="Account Information"
            desc="Read-only details about your account."
          >
            <Field label="Email Address" hint="Your email is private and never shown publicly.">
              <input
                className="sp-input"
                value={user.email || ""}
                readOnly
                style={{ background:"#F5EDE6", color:"#8A6A5A", cursor:"not-allowed" }}
              />
            </Field>
            <Field label="Member Since">
              <input
                className="sp-input"
                value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : "—"}
                readOnly
                style={{ background:"#F5EDE6", color:"#8A6A5A", cursor:"not-allowed" }}
              />
            </Field>
          </SettingSection>

          {/* ── sticky save bar ── */}
          <div className="sp-save-bar">
            <p className="sp-save-info">
              Changes are saved to your account immediately.
            </p>
            <button
              type="submit"
              className={`sp-save-btn ${saving ? "sp-save-btn--loading" : ""}`}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

        </form>

        {/* ── danger zone ── */}
        <div className="sp-danger-section">
          <p className="sp-danger-title">⚠ Danger Zone</p>
          <p className="sp-danger-desc">
            Permanently delete your account and all associated stories, comments, and data. This action cannot be undone.
          </p>
          <button type="button" className="sp-danger-btn" onClick={() => alert("Contact support to delete your account.")}>
            Delete My Account
          </button>
        </div>

      </div>

      {/* ── toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}
