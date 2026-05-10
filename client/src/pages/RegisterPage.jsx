import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/* ── password strength checker ── */
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "#EF4444" };
  if (score <= 2) return { score, label: "Okay",   color: "#F59E0B" };
  if (score <= 3) return { score, label: "Good",   color: "#10B981" };
  return            { score, label: "Strong", color: "#059669" };
}

/* ── step indicator ── */
function StepDots({ step }) {
  return (
    <div className="rp-steps">
      {[1, 2, 3].map((s) => (
        <div key={s} className={`rp-step-dot ${s === step ? "rp-step-dot--active" : s < step ? "rp-step-dot--done" : ""}`}>
          {s < step ? "✓" : s}
        </div>
      ))}
      <div className="rp-step-line">
        <div className="rp-step-line-fill" style={{ width: `${((step - 1) / 2) * 100}%` }} />
      </div>
    </div>
  );
}

/* ── why join card ── */
function WhyCard({ icon, title, desc }) {
  return (
    <div className="rp-why-card">
      <span className="rp-why-icon">{icon}</span>
      <div>
        <p className="rp-why-title">{title}</p>
        <p className="rp-why-desc">{desc}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export function RegisterPage() {
  const navigate  = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();

  const [step,     setStep]     = useState(1);
  const [email,    setEmail]    = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) return <Navigate to="/" replace />;

  const strength = getPasswordStrength(password);

  const stepTitles = [
    { eyebrow: "Step 1 of 3", heading: "Apna email batao", sub: "Sirf tere liye — publicly nahi dikhega." },
    { eyebrow: "Step 2 of 3", heading: "Ek username chuno", sub: "Yeh publicly dikhega. Baad mein change ho sakta hai." },
    { eyebrow: "Step 3 of 3", heading: "Password set karo", sub: "8+ characters. Jitna strong, utna better." },
  ];
  const meta = stepTitles[step - 1];

  function nextStep(e) {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (!email.includes("@")) { setError("Valid email address daalo."); return; }
      setStep(2);
    } else if (step === 2) {
      if (username.trim().length < 2) { setError("Username kam se kam 2 characters ka hona chahiye."); return; }
      setStep(3);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (strength.score < 2) { setError("Thoda strong password rakho — mix karo letters aur numbers."); return; }
    setSubmitting(true);
    try {
      await register({ email, username, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Account nahi ban saka. Dobara try karo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideRight {
          from { opacity:0; transform:translateX(-16px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position:200% center; }
        }
        @keyframes floatUp {
          from { transform:translateY(0); }
          to   { transform:translateY(-14px); }
        }
        @keyframes strengthGrow {
          from { width:0; }
        }

        .rp-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #FFF8F2;
        }

        /* ── LEFT panel ── */
        .rp-left {
          flex: 1;
          position: relative;
          background: linear-gradient(160deg, #1A0A00 0%, #3D1A0A 45%, #6B2E14 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          overflow: hidden;
          min-height: 100vh;
        }
        .rp-left-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 70% 20%, rgba(216,90,48,0.3) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%);
          pointer-events: none;
        }
        .rp-bubble {
          position: absolute; border-radius: 50%;
          background: rgba(216,90,48,0.08);
          pointer-events: none;
          animation: floatUp 5s ease-in-out infinite alternate;
        }
        .rp-logo {
          font-family: 'Lora', serif;
          font-size: 22px; color: rgba(255,255,255,0.95);
          position: relative; z-index: 2;
        }
        .rp-left-content { position: relative; z-index: 2; }
        .rp-left-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(216,90,48,0.2);
          border: 1px solid rgba(216,90,48,0.3);
          color: #F0997B; font-size: 10px; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 4px 12px; border-radius: 20px; margin-bottom: 1rem;
        }
        .rp-left-heading {
          font-family: 'Lora', serif;
          font-size: clamp(24px, 2.8vw, 34px);
          font-weight: 500; color: #fff; line-height: 1.3;
          margin: 0 0 1.75rem; font-style: italic;
        }
        .rp-why-cards { display: flex; flex-direction: column; gap: 14px; }
        .rp-why-card {
          display: flex; gap: 12px; align-items: flex-start;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 12px 14px;
        }
        .rp-why-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .rp-why-title { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.9); margin: 0 0 3px; }
        .rp-why-desc  { font-size: 12px; color: rgba(255,255,255,0.5); margin: 0; font-weight: 300; line-height: 1.5; }

        .rp-left-footer {
          font-size: 12px; color: rgba(255,255,255,0.35);
          position: relative; z-index: 2; font-weight: 300;
        }

        /* ── RIGHT panel ── */
        .rp-right {
          width: 480px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem; background: #FFF8F2;
          position: relative;
        }
        .rp-form-wrap {
          width: 100%; max-width: 380px;
          animation: fadeUp 0.45s ease both;
        }

        /* ── step dots ── */
        .rp-steps {
          display: flex; align-items: center; gap: 0;
          margin-bottom: 2rem; position: relative;
        }
        .rp-step-dot {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; flex-shrink: 0;
          background: #F5EDE6; color: #C4A898;
          z-index: 1; transition: all 0.3s;
        }
        .rp-step-dot--active {
          background: #D85A30; color: #fff;
          box-shadow: 0 0 0 4px rgba(216,90,48,0.15);
        }
        .rp-step-dot--done {
          background: #EAF3DE; color: #3B6D11;
          font-size: 14px;
        }
        .rp-step-line {
          flex: 1; height: 3px;
          background: #F5EDE6; border-radius: 2px;
          margin: 0 6px; position: relative; overflow: hidden;
        }
        .rp-step-line-fill {
          position: absolute; top: 0; left: 0; height: 100%;
          background: #D85A30; border-radius: 2px;
          transition: width 0.4s ease;
        }

        /* ── form header ── */
        .rp-eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 1.5px;
          text-transform: uppercase; color: #D85A30; margin: 0 0 8px;
        }
        .rp-heading {
          font-family: 'Lora', serif; font-size: 26px; font-weight: 500;
          color: #1A0A00; margin: 0 0 5px; line-height: 1.2;
        }
        .rp-sub {
          font-size: 13.5px; color: #8A6A5A; margin: 0 0 1.75rem;
          font-weight: 300; line-height: 1.55;
          animation: slideRight 0.35s ease both;
        }

        /* ── error ── */
        .rp-error {
          background: #FAECE7; border: 1px solid #F5C4B3;
          border-left: 3px solid #D85A30; color: #993C1D;
          font-size: 13px; padding: 10px 14px; border-radius: 10px;
          margin-bottom: 1.1rem; animation: fadeUp 0.25s ease;
        }

        /* ── field ── */
        .rp-field { margin-bottom: 1.1rem; }
        .rp-label {
          display: block; font-size: 11px; font-weight: 500;
          color: #5A3A2A; margin-bottom: 5px;
          letter-spacing: 0.2px; text-transform: uppercase;
        }
        .rp-input-wrap { position: relative; }
        .rp-input {
          width: 100%; padding: 12px 14px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          background: #fff; border: 1.5px solid #E8D5C8;
          border-radius: 10px; color: #1A0A00; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .rp-input::placeholder { color: #C4A898; }
        .rp-input:focus {
          border-color: #D85A30;
          box-shadow: 0 0 0 3px rgba(216,90,48,0.1);
        }
        .rp-input--pass { padding-right: 44px; }
        .rp-eye-btn {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #B08878; font-size: 16px; line-height: 1;
          padding: 2px;
        }
        .rp-eye-btn:hover { color: #D85A30; }

        /* username availability hint */
        .rp-username-hint {
          font-size: 11.5px; color: #B08878;
          margin-top: 5px; font-weight: 300;
        }

        /* ── password strength ── */
        .rp-strength-wrap { margin-top: 8px; }
        .rp-strength-bar-bg {
          height: 4px; background: #F5EDE6; border-radius: 2px;
          overflow: hidden; margin-bottom: 5px;
        }
        .rp-strength-bar-fill {
          height: 100%; border-radius: 2px;
          transition: width 0.4s ease, background 0.3s;
          animation: strengthGrow 0.4s ease;
        }
        .rp-strength-label {
          font-size: 11.5px; font-weight: 500;
        }
        .rp-strength-tips {
          display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px;
        }
        .rp-strength-tip {
          font-size: 10.5px; padding: 3px 9px; border-radius: 10px;
          font-weight: 400;
        }
        .rp-strength-tip--done { background: #EAF3DE; color: #3B6D11; }
        .rp-strength-tip--todo { background: #F5EDE6; color: #C4A898; }

        /* ── submit button ── */
        .rp-btn {
          width: 100%; padding: 13px;
          background: #D85A30; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 15px;
          font-weight: 500; border: none; border-radius: 10px;
          cursor: pointer; margin-top: 0.25rem;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.2px;
        }
        .rp-btn:hover:not(:disabled) { background: #B84020; }
        .rp-btn:active:not(:disabled) { transform: scale(0.98); }
        .rp-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .rp-btn--loading {
          background: linear-gradient(90deg,#D85A30,#E87A50,#D85A30) !important;
          background-size: 200% auto !important;
          animation: shimmer 1.2s linear infinite;
        }

        /* back button for multi-step */
        .rp-back-step {
          background: none; border: none; cursor: pointer;
          font-size: 13px; color: #B08878; font-family: 'DM Sans', sans-serif;
          padding: 0; margin-bottom: 1rem; display: inline-flex;
          align-items: center; gap: 4px; transition: color 0.15s;
        }
        .rp-back-step:hover { color: #D85A30; }

        /* ── divider ── */
        .rp-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 1.25rem 0;
        }
        .rp-divider-line { flex: 1; height: 1px; background: #EDD9CC; }
        .rp-divider-text { font-size: 12px; color: #B08878; }

        .rp-footer {
          text-align: center; font-size: 13px; color: #8A6A5A;
        }
        .rp-footer a { color: #D85A30; font-weight: 500; text-decoration: none; }
        .rp-footer a:hover { text-decoration: underline; }

        /* ── anon note ── */
        .rp-anon-note {
          background: #F0F9F6; border: 0.5px solid #B5E0D0;
          border-radius: 10px; padding: 10px 13px;
          font-size: 12px; color: #0F6E56; margin-bottom: 1.1rem;
          display: flex; gap: 8px; align-items: flex-start;
          font-weight: 300; line-height: 1.55;
        }
        .rp-anon-note-icon { flex-shrink: 0; font-size: 14px; margin-top: 1px; }

        /* ── responsive ── */
        @media (max-width: 768px) {
          .rp-left { display: none; }
          .rp-right { width: 100%; }
        }
      `}</style>

      <div className="rp-root">

        {/* ── LEFT panel ── */}
        <div className="rp-left">
          <div className="rp-left-glow" />
          <div className="rp-bubble" style={{ width:160, height:160, top:"8%",  right:"-30px", animationDelay:"0s"   }} />
          <div className="rp-bubble" style={{ width:80,  height:80,  top:"50%", left:"5%",    animationDelay:"1.5s" }} />
          <div className="rp-bubble" style={{ width:220, height:220, bottom:"-60px", right:"20%", animationDelay:"0.8s", opacity:0.5 }} />

          <div className="rp-logo">LifeThreads</div>

          <div className="rp-left-content">
            <div className="rp-left-tag">✨ Free forever</div>
            <h2 className="rp-left-heading">
              "Join karo woh community<br />jo actually sunti hai."
            </h2>
            <div className="rp-why-cards">
              <WhyCard
                icon="🔒"
                title="Poori privacy"
                desc="Anonymous post kar sakte ho kabhi bhi — tera choice, teri story."
              />
              <WhyCard
                icon="🤝"
                title="Real help, real log"
                desc="Sirf algorithm nahi — actual humans jo same se guzre hain."
              />
              <WhyCard
                icon="💛"
                title="Non-judgmental space"
                desc="Yahan koi judge nahi karta. Khul ke share karo, safe ho."
              />
              <WhyCard
                icon="📖"
                title="Seekho dusron se"
                desc="Hazaron life stories — lessons, struggles, victories sab ek jagah."
              />
            </div>
          </div>

          <div className="rp-left-footer">
            © 2025 LifeThreads · Made with ♥ for real stories
          </div>
        </div>

        {/* ── RIGHT panel ── */}
        <div className="rp-right">
          <div className="rp-form-wrap">

            {/* step dots */}
            <StepDots step={step} />

            {/* back button for steps 2 & 3 */}
            {step > 1 && (
              <button
                type="button"
                className="rp-back-step"
                onClick={() => { setStep((s) => s - 1); setError(""); }}
              >
                ← Wapas
              </button>
            )}

            {/* header */}
            <p className="rp-eyebrow" key={`eyebrow-${step}`}>{meta.eyebrow}</p>
            <h1 className="rp-heading" key={`heading-${step}`}>{meta.heading}</h1>
            <p className="rp-sub"     key={`sub-${step}`}>{meta.sub}</p>

            {error && <div className="rp-error">{error}</div>}

            {/* ── STEP 1: email ── */}
            {step === 1 && (
              <form onSubmit={nextStep}>
                <div className="rp-anon-note">
                  <span className="rp-anon-note-icon">🛡</span>
                  Tera email sirf login ke liye hai. Kabhi publicly nahi dikhega.
                </div>
                <div className="rp-field">
                  <label className="rp-label" htmlFor="rp-email">Email address</label>
                  <input
                    id="rp-email"
                    className="rp-input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="rp-btn">Aage badho →</button>
              </form>
            )}

            {/* ── STEP 2: username ── */}
            {step === 2 && (
              <form onSubmit={nextStep}>
                <div className="rp-field">
                  <label className="rp-label" htmlFor="rp-username">Username</label>
                  <input
                    id="rp-username"
                    className="rp-input"
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. quiet_observer, rahul_k"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                    minLength={2}
                    maxLength={32}
                    required
                    autoFocus
                  />
                  {username && (
                    <p className="rp-username-hint">
                      Tera profile dikhega: <strong>lifethreads.app/@{username}</strong>
                    </p>
                  )}
                </div>
                <button type="submit" className="rp-btn">Aage badho →</button>
              </form>
            )}

            {/* ── STEP 3: password + submit ── */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <div className="rp-field">
                  <label className="rp-label" htmlFor="rp-password">Password</label>
                  <div className="rp-input-wrap">
                    <input
                      id="rp-password"
                      className="rp-input rp-input--pass"
                      type={showPass ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Kam se kam 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="rp-eye-btn"
                      onClick={() => setShowPass((s) => !s)}
                      aria-label={showPass ? "Hide" : "Show"}
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>

                  {/* strength meter */}
                  {password && (
                    <div className="rp-strength-wrap">
                      <div className="rp-strength-bar-bg">
                        <div
                          className="rp-strength-bar-fill"
                          style={{
                            width:  `${(strength.score / 5) * 100}%`,
                            background: strength.color,
                          }}
                        />
                      </div>
                      <span className="rp-strength-label" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                      <div className="rp-strength-tips">
                        {[
                          { label:"8+ chars",    done: password.length >= 8  },
                          { label:"Uppercase",   done: /[A-Z]/.test(password) },
                          { label:"Number",      done: /[0-9]/.test(password) },
                          { label:"Symbol",      done: /[^A-Za-z0-9]/.test(password) },
                        ].map((tip) => (
                          <span
                            key={tip.label}
                            className={`rp-strength-tip ${tip.done ? "rp-strength-tip--done" : "rp-strength-tip--todo"}`}
                          >
                            {tip.done ? "✓ " : ""}{tip.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`rp-btn ${submitting ? "rp-btn--loading" : ""}`}
                  disabled={submitting}
                >
                  {submitting ? "Account ban raha hai…" : "Account banao ✨"}
                </button>
              </form>
            )}

            <div className="rp-divider">
              <div className="rp-divider-line" />
              <span className="rp-divider-text">already joined?</span>
              <div className="rp-divider-line" />
            </div>

            <div className="rp-footer">
              Pehle se account hai? <Link to="/login">Login karo</Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
