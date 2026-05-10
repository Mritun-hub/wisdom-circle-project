import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark" aria-hidden />
            <span className="brand-text">Wisdom Circle</span>
          </NavLink>
          <nav className="site-nav" aria-label="Main">
            <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} end>
              Feed
            </NavLink>
            <NavLink to="/explore" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Explore
            </NavLink>
            <NavLink
              to="/discussions"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Advice
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/create" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Share
              </NavLink>
            )}
          </nav>
          <div className="site-actions">
            {isAuthenticated ? (
              <>
                <NavLink to={`/u/${user.username}`} className="nav-link subtle">
                  @{user.username}
                </NavLink>
                <NavLink to="/settings" className="nav-link subtle">
                  Settings
                </NavLink>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link">
                  Log in
                </NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm">
                  Join
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p className="muted">
          A supportive space to share life lessons and learn from others. Be kind. This is not a substitute for
          professional care.
        </p>
      </footer>
      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 40;
          backdrop-filter: blur(12px);
          background: rgba(15, 20, 25, 0.85);
          border-bottom: 1px solid var(--border);
        }
        .site-header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.1rem;
        }
        .brand-mark {
          width: 28px;
          height: 28px;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--accent), #3d8a85);
          box-shadow: 0 4px 16px rgba(110, 201, 196, 0.35);
        }
        .site-nav {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex: 1;
          flex-wrap: wrap;
        }
        .nav-link {
          padding: 0.45rem 0.75rem;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .nav-link:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.06);
        }
        .nav-link.active {
          color: var(--text);
          background: rgba(110, 201, 196, 0.12);
        }
        .nav-link.subtle {
          font-weight: 500;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .site-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .btn-sm {
          padding: 0.45rem 0.85rem;
          font-size: 0.85rem;
        }
        .site-footer {
          max-width: 720px;
          margin: 0 auto;
          padding: 1rem 1rem 2rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
