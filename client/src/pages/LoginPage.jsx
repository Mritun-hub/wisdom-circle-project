import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/* ─── tiny floating circle decoration ─── */
function Bubble({ size, top, left, delay, opacity }) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `rgba(216, 90, 48, ${opacity})`,
        top,
        left,
        animation: `floatUp 6s ease-in-out ${delay} infinite alternate`,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── animated quote strip ─── */
const QUOTES = [
  "Your story matters.",
  "Someone needs to hear what you've been through.",
  "Every scar holds a lesson worth sharing.",
  "You are not alone in this.",
];

export function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  if (!loading && isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Email ya password galat hai. Dobara try karo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes floatUp {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-18px) scale(1.08); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(216,90,48,0.25); }
          70%  { box-shadow: 0 0 0 8px rgba(216,90,48,0); }
          100% { box-shadow: 0 0 0 0 rgba(216,90,48,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .lp-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #FFF8F2;
        }

        /* ── LEFT PANEL ── */
        .lp-left {
          flex: 1;
          position: relative;
          background: linear-gradient(160deg, #D85A30 0%, #B84020 40%, #8B2A10 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          overflow: hidden;
          min-height: 100vh;
        }

        .lp-left-logo {
          font-family: 'Lora', serif;
          font-size: 22px;
          color: rgba(255,255,255,0.95);
          letter-spacing: -0.3px;
          z-index: 2;
          position: relative;
        }

        .lp-left-content {
          z-index: 2;
          position: relative;
        }

        .lp-big-quote {
          font-family: 'Lora', serif;
          font-size: clamp(28px, 3.5vw, 42px);
          color: #fff;
          line-height: 1.3;
          font-style: italic;
          margin: 0 0 1.5rem;
          text-shadow: 0 2px 24px rgba(0,0,0,0.15);
        }

        .lp-features {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .lp-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.85);
          font-size: 14px;
          font-weight: 300;
        }

        .lp-feature-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          flex-shrink: 0;
        }

        .lp-pattern {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0,0,0,0.12) 0%, transparent 50%);
          z-index: 1;
        }

        /* ── RIGHT PANEL ── */
        .lp-right {
          width: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #FFF8F2;
          position: relative;
        }

        .lp-form-wrap {
          width: 100%;
          max-width: 380px;
          animation: fadeSlideIn 0.5s ease both;
        }

        .lp-form-header {
          margin-bottom: 2rem;
        }

        .lp-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #D85A30;
          margin: 0 0 10px;
        }

        .lp-heading {
          font-family: 'Lora', serif;
          font-size: 30px;
          font-weight: 500;
          color: #1A0A00;
          margin: 0 0 6px;
          line-height: 1.2;
        }

        .lp-sub {
          font-size: 14px;
          color: #8A6A5A;
          margin: 0;
          font-weight: 300;
        }

        /* error banner */
        .lp-error {
          background: #FAECE7;
          border: 1px solid #F5C4B3;
          border-left: 3px solid #D85A30;
          color: #993C1D;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 1.25rem;
          animation: fadeSlideIn 0.25s ease;
        }

        /* fields */
        .lp-field {
          margin-bottom: 1.1rem;
        }

        .lp-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #5A3A2A;
          margin-bottom: 6px;
          letter-spacing: 0.2px;
        }

        .lp-input-wrap {
          position: relative;
        }

        .lp-input {
          width: 100%;
          padding: 12px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
          border: 1.5px solid #E8D5C8;
          border-radius: 10px;
          color: #1A0A00;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .lp-input:focus {
          border-color: #D85A30;
          box-shadow: 0 0 0 3px rgba(216,90,48,0.12);
        }

        .lp-input::placeholder {
          color: #C4A898;
        }

        .lp-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #B08878;
          font-size: 16px;
          padding: 2px;
          line-height: 1;
          display: flex;
          align-items: center;
        }

        .lp-eye-btn:hover { color: #D85A30; }

        /* submit button */
        .lp-submit {
          width: 100%;
          padding: 13px;
          background: #D85A30;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.2px;
        }

        .lp-submit:hover:not(:disabled) {
          background: #B84020;
        }

        .lp-submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .lp-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .lp-submit.loading {
          background: linear-gradient(90deg, #D85A30, #E87A50, #D85A30);
          background-size: 200% auto;
          animation: shimmer 1.2s linear infinite;
        }

        /* divider */
        .lp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.25rem 0;
        }

        .lp-divider-line {
          flex: 1;
          height: 1px;
          background: #EDD9CC;
        }

        .lp-divider-text {
          font-size: 12px;
          color: #B08878;
          font-weight: 400;
        }

        /* footer links */
        .lp-footer {
          text-align: center;
          font-size: 13px;
          color: #8A6A5A;
          margin-top: 1.25rem;
        }

        .lp-footer a {
          color: #D85A30;
          text-decoration: none;
          font-weight: 500;
        }

        .lp-footer a:hover {
          text-decoration: underline;
        }

        /* ── responsive: hide left panel on small screens ── */
        @media (max-width: 768px) {
          .lp-left { display: none; }
          .lp-right {
            width: 100%;
            background: linear-gradient(180deg, #FFF8F2 0%, #FFF0E6 100%);
          }
        }
      `}</style>

      <div className="lp-root">

        {/* ── LEFT decorative panel ── */}
        <div className="lp-left">
          <div className="lp-pattern" />

          {/* floating bubbles */}
          <Bubble size="120px" top="10%"  left="70%" delay="0s"    opacity={0.08} />
          <Bubble size="60px"  top="55%"  left="10%" delay="1.5s"  opacity={0.1}  />
          <Bubble size="200px" top="65%"  left="55%" delay="0.8s"  opacity={0.05} />
          <Bubble size="40px"  top="30%"  left="5%"  delay="2.5s"  opacity={0.12} />

          <div className="lp-left-logo">LifeThreads</div>

          <div className="lp-left-content">
            <p className="lp-big-quote">"{QUOTES[quoteIdx]}"</p>
            <div className="lp-features">
              {[
                "Share anonymously — your safety first",
                "Real stories from real people like you",
                "Get advice from those who've been there",
                "Every experience is valid here",
              ].map((f) => (
                <div className="lp-feature" key={f}>
                  <div className="lp-feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT form panel ── */}
        <div className="lp-right">
          <div className="lp-form-wrap">

            <div className="lp-form-header">
              <p className="lp-eyebrow">Welcome back</p>
              <h1 className="lp-heading">Log in to your account</h1>
              <p className="lp-sub">Pick up where you left off.</p>
            </div>

            {error && <div className="lp-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-email">Email address</label>
                <input
                  id="lp-email"
                  className="lp-input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-password">Password</label>
                <div className="lp-input-wrap">
                  <input
                    id="lp-password"
                    className="lp-input"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: "42px" }}
                    required
                  />
                  <button
                    type="button"
                    className="lp-eye-btn"
                    onClick={() => setShowPass((s) => !s)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`lp-submit ${submitting ? "loading" : ""}`}
                disabled={submitting}
              >
                {submitting ? "Logging in…" : "Log in"}
              </button>
            </form>

            <div className="lp-divider">
              <div className="lp-divider-line" />
              <span className="lp-divider-text">new here?</span>
              <div className="lp-divider-line" />
            </div>

            <div className="lp-footer">
              Don't have an account?{" "}
              <Link to="/register">Create one — it's free</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
