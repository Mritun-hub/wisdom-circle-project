import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { POST_TYPES, TOPICS } from "../constants.js";

const WARM_GRADIENT = "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 40%, #FFA07A 70%, #FFB347 100%)";

const POST_TYPE_OPTIONS = [
  { id: "lesson", label: "Life Lesson", emoji: "💡", desc: "Something you learned" },
  { id: "experience", label: "Experience", emoji: "🌿", desc: "A moment that shaped you" },
  { id: "question", label: "Seeking Help", emoji: "🤝", desc: "Need support or advice" },
  { id: "reflection", label: "Reflection", emoji: "🪞", desc: "Deep thought or insight" },
  { id: "greatest", label: "Greatest Moment", emoji: "✨", desc: "Your proudest memory" },
  { id: "tough", label: "Tough Time", emoji: "🌧️", desc: "A challenge you faced" },
];

const TOPIC_OPTIONS = [
  { id: "love", label: "Love & Relationships", color: "#FF6B8A" },
  { id: "career", label: "Career & Work", color: "#FF8E53" },
  { id: "family", label: "Family", color: "#FFB347" },
  { id: "mental-health", label: "Mental Health", color: "#7EC8A0" },
  { id: "growth", label: "Personal Growth", color: "#6BB8FF" },
  { id: "grief", label: "Grief & Loss", color: "#A78BFA" },
  { id: "identity", label: "Identity", color: "#F472B6" },
  { id: "faith", label: "Faith & Spirituality", color: "#F59E0B" },
  { id: "recovery", label: "Recovery", color: "#34D399" },
  { id: "friendship", label: "Friendship", color: "#60A5FA" },
];

export function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("lesson");
  const [topics, setTopics] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1); // 1=type, 2=story, 3=details
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  function toggleTopic(id) {
    setTopics((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function handleFiles(newFiles) {
    setFiles(Array.from(newFiles).slice(0, 6));
  }

  async function handleSubmit() {
    setError("");
    if (!content.trim() || content.trim().length < 10) {
      setError("Please write at least 10 characters in your story before publishing. ✍️");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      fd.append("postType", postType);
      fd.append("topics", JSON.stringify(topics));
      fd.append("isAnonymous", String(isAnonymous));
      for (const f of files) fd.append("images", f);
      const { data } = await api.post("/posts", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/post/${data.post.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not publish your story. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const selectedTypeObj = POST_TYPE_OPTIONS.find((t) => t.id === postType);
  const progress = Math.min(100, (step - 1) * 33 + (content.length > 10 ? 33 : content.length > 0 ? 16 : 0));

  return (
    <div style={styles.page}>
      {/* Decorative blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerBadge}>
            <span style={{ fontSize: 14 }}>✍️</span>
            <span>Share Your Story</span>
          </div>
          <h1 style={styles.title}>
            What's on{" "}
            <span style={styles.titleAccent}>your mind?</span>
          </h1>
          <p style={styles.subtitle}>
            Your words might be exactly what someone else needs to read today. This is your safe space — write freely. 🌟
          </p>

          {/* Progress bar */}
          <div style={styles.progressWrap}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${Math.max(5, progress)}%` }} />
            </div>
            <span style={styles.progressLabel}>Step {step} of 3</span>
          </div>
        </div>

        {/* Step 1 — Type */}
        <div style={styles.card}>
          <div style={styles.stepHeader}>
            <div style={styles.stepNum}>1</div>
            <div>
              <div style={styles.stepTitle}>What are you sharing?</div>
              <div style={styles.stepSub}>Choose the type of story you want to tell</div>
            </div>
          </div>
          <div style={styles.typeGrid}>
            {POST_TYPE_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setPostType(t.id); setStep((s) => Math.max(s, 2)); }}
                style={{
                  ...styles.typeCard,
                  ...(postType === t.id ? styles.typeCardActive : {}),
                }}
              >
                <span style={styles.typeEmoji}>{t.emoji}</span>
                <span style={styles.typeName}>{t.label}</span>
                <span style={styles.typeDesc}>{t.desc}</span>
                {postType === t.id && <div style={styles.typeCheck}>✓</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Story */}
        <div style={{ ...styles.card, ...(step < 2 ? styles.cardDimmed : {}) }}>
          <div style={styles.stepHeader}>
            <div style={{ ...styles.stepNum, ...(step >= 2 ? styles.stepNumActive : {}) }}>2</div>
            <div>
              <div style={styles.stepTitle}>Write your story</div>
              <div style={styles.stepSub}>Speak from the heart — no one here will judge you</div>
            </div>
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.fieldLabel}>
              Title <span style={styles.optional}>(optional)</span>
              <span style={styles.charCount}>{title.length}/120</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="A short headline… e.g. 'The day everything changed'"
              style={styles.input}
              disabled={step < 2}
            />
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.fieldLabel}>
              Teri story <span style={{ color: "#FF6B6B" }}>*</span>
              <span style={styles.charCount}>{content.length} chars</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setStep((s) => Math.max(s, content.length > 10 ? 3 : 2)); }}
              placeholder={`Write openly and honestly...\n\nPlease avoid names or details that could identify others without their consent.`}
              style={styles.textarea}
              disabled={step < 2}
              rows={7}
            />
          </div>
        </div>

        {/* Step 3 — Details */}
        <div style={{ ...styles.card, ...(step < 3 ? styles.cardDimmed : {}) }}>
          <div style={styles.stepHeader}>
            <div style={{ ...styles.stepNum, ...(step >= 3 ? styles.stepNumActive : {}) }}>3</div>
            <div>
              <div style={styles.stepTitle}>Final details</div>
              <div style={styles.stepSub}>Topics, photos and privacy settings</div>
            </div>
          </div>

          {/* Topics */}
          <div style={styles.fieldWrap}>
            <label style={styles.fieldLabel}>Choose topics</label>
            <div style={styles.topicsWrap}>
              {TOPIC_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTopic(t.id)}
                  disabled={step < 3}
                  style={{
                    ...styles.topicPill,
                    ...(topics.includes(t.id) ? {
                      background: t.color + "22",
                      borderColor: t.color,
                      color: t.color,
                    } : {}),
                  }}
                >
                  {topics.includes(t.id) && <span style={{ marginRight: 4 }}>✓</span>}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div style={styles.fieldWrap}>
            <label style={styles.fieldLabel}>
              Add photos <span style={styles.optional}>(optional · max 6)</span>
            </label>
            <div
              style={{ ...styles.uploadZone, ...(dragOver ? styles.uploadZoneActive : {}) }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)} />
              {files.length > 0 ? (
                <div style={styles.filesSelected}>
                  <span style={{ fontSize: 28 }}>🖼️</span>
                  <span style={styles.filesCount}>{files.length} photo{files.length > 1 ? "s" : ""} selected</span>
                  <span style={styles.filesChange}>Change</span>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: 32, marginBottom: 8, display: "block" }}>📸</span>
                  <div style={styles.uploadText}>Drop files here or click to browse</div>
                  <div style={styles.uploadSub}>JPG, PNG, GIF · Up to 6 photos</div>
                </>
              )}
            </div>
          </div>

          {/* Anonymous toggle */}
          <div
            style={{ ...styles.anonBox, ...(isAnonymous ? styles.anonBoxOn : {}) }}
            onClick={() => setIsAnonymous((v) => !v)}
          >
            <div style={{ ...styles.toggle, ...(isAnonymous ? styles.toggleOn : {}) }}>
              <div style={{ ...styles.toggleThumb, ...(isAnonymous ? styles.toggleThumbOn : {}) }} />
            </div>
            <div>
              <div style={styles.anonTitle}>
                {isAnonymous ? "🕵️ Posting anonymously" : "👤 Post under your name"}
              </div>
              <div style={styles.anonDesc}>
                {isAnonymous
                  ? "Your username stays hidden — only your display label will show"
                  : "Others will see this story belongs to you — toggle to hide your identity"}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Submit */}
        <div style={styles.footerRow}>
          <button onClick={() => navigate(-1)} style={styles.cancelBtn}>
            ← Go back
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || step < 2}
            style={{ ...styles.publishBtn, ...(saving || step < 2 ? styles.publishBtnDisabled : {}) }}
          >
            {saving ? (
              <><span style={styles.spinner} /> Publishing...</>
            ) : (
              <><span>🚀</span> Publish Story</>
            )}
          </button>
        </div>

        <p style={styles.footnote}>
          🔒 Your story is safe here. Please follow our community guidelines and respect others.
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blobFloat { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-20px) scale(1.05); } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FFF8F3",
    fontFamily: "'Nunito', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "0 0 4rem",
  },
  blob1: {
    position: "fixed", top: -120, right: -100, width: 400, height: 400,
    borderRadius: "50%", background: "radial-gradient(circle, #FFD5C2 0%, transparent 70%)",
    animation: "blobFloat 8s ease-in-out infinite", pointerEvents: "none", zIndex: 0,
  },
  blob2: {
    position: "fixed", bottom: -100, left: -80, width: 350, height: 350,
    borderRadius: "50%", background: "radial-gradient(circle, #FFE4D6 0%, transparent 70%)",
    animation: "blobFloat 10s ease-in-out infinite reverse", pointerEvents: "none", zIndex: 0,
  },
  container: {
    position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto",
    padding: "2rem 1.25rem",
  },
  header: { textAlign: "center", marginBottom: "2rem", animation: "fadeSlideUp 0.5s ease" },
  headerBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
    color: "white", borderRadius: 100, padding: "6px 16px", fontSize: 13,
    fontWeight: 700, marginBottom: "1rem",
  },
  title: {
    fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700,
    color: "#2D1B12", lineHeight: 1.25, marginBottom: "0.5rem",
  },
  titleAccent: {
    fontStyle: "italic",
    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { fontSize: 15, color: "#8B6355", lineHeight: 1.6, marginBottom: "1.5rem" },
  progressWrap: { display: "flex", alignItems: "center", gap: 12, maxWidth: 400, margin: "0 auto" },
  progressTrack: {
    flex: 1, height: 6, background: "#FFD5C2", borderRadius: 10, overflow: "hidden",
  },
  progressFill: {
    height: "100%", borderRadius: 10,
    background: "linear-gradient(to right, #FF6B6B, #FF8E53)",
    transition: "width 0.4s ease",
  },
  progressLabel: { fontSize: 12, color: "#8B6355", whiteSpace: "nowrap", fontWeight: 600 },

  card: {
    background: "white", borderRadius: 20, padding: "1.5rem",
    boxShadow: "0 4px 24px rgba(255,107,107,0.08)", marginBottom: "1.25rem",
    border: "1px solid #FFE4D6", transition: "opacity 0.3s, filter 0.3s",
    animation: "fadeSlideUp 0.4s ease",
  },
  cardDimmed: { opacity: 0.5, filter: "grayscale(0.3)", pointerEvents: "none" },

  stepHeader: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1.25rem" },
  stepNum: {
    width: 32, height: 32, borderRadius: "50%",
    background: "#FFE4D6", color: "#C96A4F", fontWeight: 800, fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  stepNumActive: { background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", color: "white" },
  stepTitle: { fontSize: 16, fontWeight: 800, color: "#2D1B12" },
  stepSub: { fontSize: 13, color: "#8B6355", marginTop: 2 },

  typeGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
  },
  typeCard: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    padding: "14px 8px", borderRadius: 14, border: "1.5px solid #FFE4D6",
    background: "#FFF8F3", cursor: "pointer", transition: "all 0.2s", position: "relative",
    fontFamily: "'Nunito', sans-serif",
  },
  typeCardActive: {
    border: "1.5px solid #FF6B6B", background: "#FFF0EC",
    boxShadow: "0 4px 16px rgba(255,107,107,0.2)",
    transform: "translateY(-2px)",
  },
  typeEmoji: { fontSize: 24, marginBottom: 2 },
  typeName: { fontSize: 12, fontWeight: 700, color: "#2D1B12", textAlign: "center" },
  typeDesc: { fontSize: 10, color: "#8B6355", textAlign: "center", lineHeight: 1.4 },
  typeCheck: {
    position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%",
    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", color: "white",
    fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800,
  },

  fieldWrap: { marginBottom: "1.25rem" },
  fieldLabel: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 13, fontWeight: 700, color: "#4A2E22", marginBottom: 8,
  },
  optional: { fontSize: 11, color: "#8B6355", fontWeight: 400 },
  charCount: { fontSize: 11, color: "#C0A090", fontWeight: 400 },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #FFE4D6",
    background: "#FFF8F3", fontSize: 14, fontFamily: "'Nunito', sans-serif",
    color: "#2D1B12", outline: "none", transition: "border 0.2s",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "14px", borderRadius: 12, border: "1.5px solid #FFE4D6",
    background: "#FFF8F3", fontSize: 14, fontFamily: "'Nunito', sans-serif",
    color: "#2D1B12", outline: "none", resize: "vertical", lineHeight: 1.7,
    transition: "border 0.2s", boxSizing: "border-box",
  },

  topicsWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  topicPill: {
    padding: "7px 14px", borderRadius: 100, border: "1.5px solid #FFE4D6",
    background: "#FFF8F3", color: "#8B6355", fontSize: 12, fontWeight: 600,
    cursor: "pointer", transition: "all 0.2s", fontFamily: "'Nunito', sans-serif",
  },

  uploadZone: {
    border: "2px dashed #FFD5C2", borderRadius: 16, padding: "1.5rem",
    textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#FFF8F3",
  },
  uploadZoneActive: { borderColor: "#FF6B6B", background: "#FFF0EC" },
  uploadText: { fontSize: 14, fontWeight: 600, color: "#4A2E22", marginBottom: 4 },
  uploadSub: { fontSize: 12, color: "#8B6355" },
  filesSelected: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  filesCount: { fontSize: 14, fontWeight: 700, color: "#4A2E22" },
  filesChange: { fontSize: 12, color: "#FF6B6B", fontWeight: 600, textDecoration: "underline" },

  anonBox: {
    display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
    borderRadius: 14, border: "1.5px solid #FFE4D6", cursor: "pointer", transition: "all 0.2s",
  },
  anonBoxOn: { border: "1.5px solid #FF6B6B", background: "#FFF0EC" },
  toggle: {
    width: 42, height: 24, borderRadius: 12, background: "#FFD5C2",
    position: "relative", flexShrink: 0, transition: "background 0.2s", marginTop: 2,
  },
  toggleOn: { background: "linear-gradient(135deg, #FF6B6B, #FF8E53)" },
  toggleThumb: {
    position: "absolute", top: 3, left: 3, width: 18, height: 18,
    borderRadius: "50%", background: "white", transition: "left 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
  },
  toggleThumbOn: { left: 21 },
  anonTitle: { fontSize: 14, fontWeight: 700, color: "#2D1B12", marginBottom: 2 },
  anonDesc: { fontSize: 12, color: "#8B6355", lineHeight: 1.4 },

  errorBox: {
    background: "#FFF0F0", border: "1.5px solid #FFCDD2", borderRadius: 12,
    padding: "12px 16px", fontSize: 14, color: "#C62828", fontWeight: 600,
    marginBottom: "1rem", display: "flex", gap: 8, alignItems: "center",
  },
  footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: "0.5rem" },
  cancelBtn: {
    padding: "12px 20px", borderRadius: 100, border: "1.5px solid #FFD5C2",
    background: "white", color: "#8B6355", fontSize: 14, fontWeight: 700,
    cursor: "pointer", fontFamily: "'Nunito', sans-serif", transition: "all 0.2s",
  },
  publishBtn: {
    display: "flex", alignItems: "center", gap: 8, padding: "13px 28px",
    borderRadius: 100, border: "none", fontFamily: "'Nunito', sans-serif",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
    color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer",
    boxShadow: "0 4px 20px rgba(255,107,107,0.4)", transition: "all 0.2s",
  },
  publishBtnDisabled: {
    opacity: 0.5, cursor: "not-allowed", boxShadow: "none",
  },
  spinner: {
    display: "inline-block", width: 14, height: 14,
    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
    borderRadius: "50%", animation: "spin 0.7s linear infinite",
  },
  footnote: {
    textAlign: "center", fontSize: 12, color: "#8B6355", marginTop: "1.5rem", lineHeight: 1.6,
  },
};
