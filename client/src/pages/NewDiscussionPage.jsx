import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { TOPICS } from "../constants.js";

/* ── example prompts to inspire the user ── */
const EXAMPLE_PROMPTS = [
  "Career change ke baare mein soch raha/rahi hoon — kya kisi ne yeh kiya hai?",
  "Long distance relationship mein hun — kaise manage karte ho?",
  "Anxiety ke liye kya natural cheezein help karti hain?",
  "Parents ki expectations aur apni dreams — kaise balance karein?",
  "First job mein imposter syndrome — normal hai kya?",
];

/* ── tip card shown on right side ── */
function TipCard({ icon, title, desc }) {
  return (
    <div className="ndp-tip">
      <span className="ndp-tip-icon">{icon}</span>
      <div>
        <p className="ndp-tip-title">{title}</p>
        <p className="ndp-tip-desc">{desc}</p>
      </div>
    </div>
  );
}

export function NewDiscussionPage() {
  const navigate = useNavigate();

  const [title,       setTitle]       = useState("");
  const [content,     setContent]     = useState("");
  const [topics,      setTopics]      = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error,       setError]       = useState("");
  const [saving,      setSaving]      = useState(false);
  const [promptIdx,   setPromptIdx]   = useState(0);

  const TITLE_MAX   = 200;
  const CONTENT_MAX = 1500;
  const titleLeft   = TITLE_MAX   - title.length;
  const contentLeft = CONTENT_MAX - content.length;

  function toggleTopic(id) {
    setTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function usePrompt() {
    setTitle(EXAMPLE_PROMPTS[promptIdx]);
    setPromptIdx((i) => (i + 1) % EXAMPLE_PROMPTS.length);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = await api.post("/discussions", {
        title,
        content,
        topics,
        isAnonymous,
      });
      navigate(`/discussions/${data.discussion.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Thread post nahi ho saka. Dobara try karo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position:200% center; }
        }
        @keyframes pulse {
          0%,100% { opacity:0.5; transform:scale(1); }
          50%     { opacity:1;   transform:scale(1.1); }
        }

        .ndp-root {
          font-family: 'DM Sans', sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding-bottom: 4rem;
          animation: fadeUp 0.45s ease both;
        }

        /* ── page header ── */
        .ndp-header {
          position: relative;
          background: linear-gradient(135deg, #1A0A00 0%, #3D1A0A 60%, #6B2E14 100%);
          border-radius: 20px;
          padding: 2rem 2rem 1.75rem;
          margin-bottom: 1.75rem;
          overflow: hidden;
        }
        .ndp-header-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 80% 30%, rgba(216,90,48,0.25) 0%, transparent 55%),
            radial-gradient(circle at 10% 80%, rgba(255,255,255,0.04) 0%, transparent 50%);
          pointer-events: none;
        }
        .ndp-header-circle {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.07);
          pointer-events: none;
        }
        .ndp-live-dot {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(216,90,48,0.2);
          border: 1px solid rgba(216,90,48,0.35);
          color: #F0997B;
          font-size: 10px; font-weight: 500; letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 11px; border-radius: 20px;
          margin-bottom: 1rem; position: relative;
        }
        .ndp-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #F0997B;
          animation: pulse 1.8s ease-in-out infinite;
        }
        .ndp-header-title {
          font-family: 'Lora', serif;
          font-size: 26px; font-weight: 500; color: #fff;
          margin: 0 0 6px; line-height: 1.25; position: relative;
        }
        .ndp-header-sub {
          font-size: 13.5px; color: rgba(255,255,255,0.6);
          margin: 0; font-weight: 300; line-height: 1.6;
          max-width: 420px; position: relative;
        }

        /* ── two-col layout ── */
        .ndp-layout {
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 680px) {
          .ndp-layout { grid-template-columns: 1fr; }
          .ndp-sidebar { order: -1; }
        }

        /* ── form sections ── */
        .ndp-section {
          background: #FFFAF6;
          border: 0.5px solid #EDD9CC;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
        }
        .ndp-section-label {
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.9px;
          text-transform: uppercase; color: #B08878; margin: 0 0 1rem;
          display: flex; align-items: center; gap: 8px;
        }
        .ndp-section-label::after {
          content: ''; flex: 1; height: 1px; background: #EDD9CC;
        }

        /* ── inputs ── */
        .ndp-field { margin-bottom: 0; }
        .ndp-label {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px; font-weight: 500; color: #5A3A2A;
          letter-spacing: 0.2px; text-transform: uppercase; margin-bottom: 6px;
        }
        .ndp-counter { font-weight: 400; font-size: 10.5px; color: #C4A898; text-transform: none; }
        .ndp-counter--warn { color: #D85A30; }

        .ndp-input, .ndp-textarea {
          width: 100%; font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #1A0A00;
          background: #fff; border: 1.5px solid #E8D5C8;
          border-radius: 10px; padding: 11px 13px;
          outline: none; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ndp-input::placeholder, .ndp-textarea::placeholder { color: #C4A898; }
        .ndp-input:focus, .ndp-textarea:focus {
          border-color: #D85A30;
          box-shadow: 0 0 0 3px rgba(216,90,48,0.1);
        }
        .ndp-textarea {
          min-height: 160px; resize: vertical; line-height: 1.7;
        }

        /* prompt suggester */
        .ndp-prompt-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 500; color: #D85A30;
          background: #FAECE7; border: none; border-radius: 8px;
          padding: 4px 10px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          margin-top: 6px; transition: background 0.15s;
        }
        .ndp-prompt-btn:hover { background: #F5C4B3; }

        /* ── topic pills ── */
        .ndp-topics {
          display: flex; flex-wrap: wrap; gap: 7px;
        }
        .ndp-topic {
          padding: 6px 13px; border-radius: 20px;
          font-size: 12px; font-weight: 500; cursor: pointer;
          border: 1.5px solid #EDD9CC; background: #fff;
          color: #8A6A5A; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .ndp-topic:hover:not(.ndp-topic--on) { border-color: #F0997B; color: #D85A30; }
        .ndp-topic--on { background: #D85A30; color: #fff; border-color: #D85A30; }

        /* ── anon toggle ── */
        .ndp-anon {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 1rem 1.25rem;
          background: #FFFAF6; border: 0.5px solid #EDD9CC;
          border-radius: 14px; margin-bottom: 1rem; cursor: pointer;
          transition: border-color 0.15s;
        }
        .ndp-anon:hover { border-color: #F0997B; }
        .ndp-toggle {
          width: 40px; height: 22px; border-radius: 11px;
          border: none; cursor: pointer; position: relative;
          flex-shrink: 0; margin-top: 2px; transition: background 0.2s;
          background: #EDD9CC;
        }
        .ndp-toggle::after {
          content: ''; position: absolute;
          width: 16px; height: 16px; background: #fff;
          border-radius: 50%; top: 3px;
          transition: left 0.2s;
          left: 3px;
        }
        .ndp-toggle--on  { background: #D85A30; }
        .ndp-toggle--on::after  { left: 21px; }
        .ndp-anon-text h3 {
          font-size: 13.5px; font-weight: 500; color: #1A0A00;
          margin: 0 0 3px; font-family: 'DM Sans', sans-serif;
        }
        .ndp-anon-text p {
          font-size: 12px; color: #8A6A5A; margin: 0;
          font-weight: 300; line-height: 1.55;
        }

        /* ── submit ── */
        .ndp-submit {
          width: 100%; padding: 14px;
          background: #D85A30; color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500;
          border: none; border-radius: 12px; cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.2px;
        }
        .ndp-submit:hover:not(:disabled) { background: #B84020; }
        .ndp-submit:active:not(:disabled) { transform: scale(0.98); }
        .ndp-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .ndp-submit--loading {
          background: linear-gradient(90deg,#D85A30,#E87A50,#D85A30) !important;
          background-size: 200% auto !important;
          animation: shimmer 1.2s linear infinite;
        }

        /* ── error ── */
        .ndp-error {
          background: #FAECE7; border: 1px solid #F5C4B3;
          border-left: 3px solid #D85A30; color: #993C1D;
          font-size: 13px; padding: 10px 14px;
          border-radius: 10px; margin-bottom: 1rem;
        }

        /* ── sidebar ── */
        .ndp-sidebar { display: flex; flex-direction: column; gap: 12px; }

        .ndp-sidebar-card {
          background: #FFFAF6; border: 0.5px solid #EDD9CC;
          border-radius: 16px; padding: 1.1rem 1.2rem;
        }
        .ndp-sidebar-title {
          font-family: 'Lora', serif; font-size: 14px; font-weight: 500;
          color: #1A0A00; margin: 0 0 0.85rem;
        }

        .ndp-tip {
          display: flex; gap: 10px; margin-bottom: 0.8rem;
          align-items: flex-start;
        }
        .ndp-tip:last-child { margin-bottom: 0; }
        .ndp-tip-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .ndp-tip-title { font-size: 12.5px; font-weight: 500; color: #1A0A00; margin: 0 0 2px; }
        .ndp-tip-desc  { font-size: 11.5px; color: #8A6A5A; margin: 0; font-weight: 300; line-height: 1.5; }

        /* active threads preview */
        .ndp-active-thread {
          padding: 9px 0;
          border-bottom: 0.5px solid #F5E8DC;
          cursor: pointer;
        }
        .ndp-active-thread:last-child { border-bottom: none; padding-bottom: 0; }
        .ndp-active-thread:first-child { padding-top: 0; }
        .ndp-thread-title {
          font-size: 12.5px; font-weight: 500; color: #1A0A00;
          margin: 0 0 3px; line-height: 1.4;
          transition: color 0.15s;
        }
        .ndp-active-thread:hover .ndp-thread-title { color: #D85A30; }
        .ndp-thread-meta { font-size: 10.5px; color: #B08878; }

        /* community rule */
        .ndp-rules {
          background: linear-gradient(135deg,#FAECE7,#FFF0E8);
          border: 0.5px solid #F5C4B3; border-radius: 14px;
          padding: 1rem 1.1rem;
        }
        .ndp-rules-title {
          font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
          text-transform: uppercase; color: #993C1D; margin: 0 0 0.75rem;
          display: flex; align-items: center; gap: 6px;
        }
        .ndp-rule {
          display: flex; gap: 8px; margin-bottom: 6px;
          font-size: 11.5px; color: #6A3A2A; line-height: 1.5;
          font-weight: 300;
        }
        .ndp-rule:last-child { margin-bottom: 0; }
        .ndp-rule-num {
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(216,90,48,0.15); color: #D85A30;
          font-size: 9px; font-weight: 700; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
      `}</style>

      <div className="ndp-root">

        {/* ── dark header ── */}
        <div className="ndp-header">
          <div className="ndp-header-glow" />
          <div className="ndp-header-circle" style={{ width:220, height:220, top:-80, right:-60 }} />
          <div className="ndp-header-circle" style={{ width:100, height:100, bottom:-30, left:20 }} />

          <div className="ndp-live-dot">
            <div className="ndp-dot" />
            Community advice
          </div>
          <h1 className="ndp-header-title">Community se poochho</h1>
          <p className="ndp-header-sub">
            Apna sawaal share karo — jinlogo ne wahi raah chali hai, woh guide karenge.
          </p>
        </div>

        {error && <div className="ndp-error">{error}</div>}

        {/* ── two-col layout ── */}
        <div className="ndp-layout">

          {/* ── LEFT: form ── */}
          <div>
            <form onSubmit={handleSubmit}>

              {/* title */}
              <div className="ndp-section">
                <p className="ndp-section-label">Apna sawaal</p>
                <div className="ndp-field">
                  <label className="ndp-label" htmlFor="ndp-title">
                    <span>Title *</span>
                    <span className={`ndp-counter ${titleLeft < 30 ? "ndp-counter--warn" : ""}`}>
                      {titleLeft} left
                    </span>
                  </label>
                  <input
                    id="ndp-title"
                    className="ndp-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={TITLE_MAX}
                    placeholder="Ek clear, specific sawaal likho…"
                  />
                  <button type="button" className="ndp-prompt-btn" onClick={usePrompt}>
                    ✨ Example se inspire lo
                  </button>
                </div>
              </div>

              {/* details */}
              <div className="ndp-section">
                <p className="ndp-section-label">Details</p>
                <div className="ndp-field">
                  <label className="ndp-label" htmlFor="ndp-content">
                    <span>Context do *</span>
                    <span className={`ndp-counter ${contentLeft < 100 ? "ndp-counter--warn" : ""}`}>
                      {contentLeft} left
                    </span>
                  </label>
                  <textarea
                    id="ndp-content"
                    className="ndp-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    minLength={20}
                    maxLength={CONTENT_MAX}
                    placeholder={
                      "Apni situation describe karo:\n" +
                      "• Kya ho raha hai?\n" +
                      "• Tumne abhi tak kya try kiya?\n" +
                      "• Specifically kahan stuck ho?\n\n" +
                      "Jitna clear, utna better advice milega."
                    }
                  />
                </div>
              </div>

              {/* topics */}
              <div className="ndp-section">
                <p className="ndp-section-label">Topics</p>
                <div className="ndp-topics">
                  {TOPICS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`ndp-topic ${topics.includes(t.id) ? "ndp-topic--on" : ""}`}
                      onClick={() => toggleTopic(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* anon toggle */}
              <div className="ndp-anon" onClick={() => setIsAnonymous((s) => !s)}>
                <button
                  type="button"
                  className={`ndp-toggle ${isAnonymous ? "ndp-toggle--on" : ""}`}
                  aria-label="Toggle anonymous"
                />
                <div className="ndp-anon-text">
                  <h3>Anonymously poochho</h3>
                  <p>
                    {isAnonymous
                      ? "✓ Tera username chhupa rahega. Sirf anonymous display naam dikhega."
                      : "Abhi tera username publicly dikhega. Toggle karo chhupane ke liye."}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className={`ndp-submit ${saving ? "ndp-submit--loading" : ""}`}
                disabled={saving}
              >
                {saving ? "Post ho raha hai…" : "Community se poochho 🤝"}
              </button>

            </form>
          </div>

          {/* ── RIGHT: sidebar ── */}
          <div className="ndp-sidebar">

            {/* tips */}
            <div className="ndp-sidebar-card">
              <p className="ndp-sidebar-title">Achha sawaal kaise poochhein?</p>
              <TipCard
                icon="🎯"
                title="Specific raho"
                desc="'Life mein kya karun?' nahi — 'Career switch at 25 sahi hai?' — aise specific sawaal better answers laate hain."
              />
              <TipCard
                icon="📝"
                title="Context do"
                desc="Apni situation, abhi tak ki koshishein, aur exact problem briefly explain karo."
              />
              <TipCard
                icon="💛"
                title="Khul ke share karo"
                desc="Yahan sab non-judgmental hain. Jitna honest, utni better help milegi."
              />
            </div>

            {/* community rules */}
            <div className="ndp-rules">
              <p className="ndp-rules-title">🛡 Community rules</p>
              {[
                "Dusron ke saath kind raho — harsh advice mat do",
                "Personal attacks ya trolling bilkul nahi",
                "Real info share karo — misinformation se bachao",
                "Dusron ki privacy respect karo",
              ].map((rule, i) => (
                <div key={i} className="ndp-rule">
                  <span className="ndp-rule-num">{i + 1}</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            {/* active threads */}
            <div className="ndp-sidebar-card">
              <p className="ndp-sidebar-title">Active threads</p>
              {[
                { title: "Job switch at 28 — sahi decision hai?", replies: 14 },
                { title: "Anxiety ko natural tarike se kaise handle karein?", replies: 22 },
                { title: "Parents ne arrange marriage ke liye pressure diya — kya karun?", replies: 31 },
              ].map((t, i) => (
                <div key={i} className="ndp-active-thread">
                  <p className="ndp-thread-title">{t.title}</p>
                  <p className="ndp-thread-meta">💬 {t.replies} replies</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
