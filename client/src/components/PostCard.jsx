import { Link } from "react-router-dom";
import { mediaUrl } from "../api.js";
import { postTypeLabel, topicLabel } from "../constants.js";

export function PostCard({ post, compact }) {
  const name = post.author?.displayName || "Member";
  const excerpt = compact && post.content.length > 220 ? `${post.content.slice(0, 220)}…` : post.content;

  return (
    <article className="post-card card">
      <div className="post-card-head">
        <div className="avatar" aria-hidden>
          {post.author?.isAnonymous ? "?" : (name[0] || "?").toUpperCase()}
        </div>
        <div>
          <div className="post-author-line">
            <span className="post-author-name">{name}</span>
            {post.author?.isAnonymous && <span className="anon-badge">Anonymous</span>}
          </div>
          <div className="muted post-meta">
            <span className="pill pill-warm">{postTypeLabel(post.postType)}</span>
            <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time>
          </div>
        </div>
      </div>
      {post.title && <h2 className="post-title">{post.title}</h2>}
      <p className="post-body">{excerpt}</p>
      {post.images?.length > 0 && (
        <div className={`post-images ${post.images.length > 1 ? "grid" : ""}`}>
          {post.images.slice(0, compact ? 1 : 6).map((src) => (
            <img key={src} src={mediaUrl(src)} alt="" className="post-img" loading="lazy" />
          ))}
        </div>
      )}
      {post.topics?.length > 0 && (
        <div className="pill-row" style={{ marginTop: "0.75rem" }}>
          {post.topics.map((t) => (
            <span key={t} className="pill">
              {topicLabel(t)}
            </span>
          ))}
        </div>
      )}
      <div className="post-card-foot">
        <span className="muted">{post.likeCount ?? 0} likes</span>
        <span className="muted">{post.commentCount ?? 0} comments</span>
        <Link to={`/post/${post.id}`} className="read-more">
          Open →
        </Link>
      </div>
      <style>{`
        .post-card {
          padding: 1.1rem 1.15rem;
          margin-bottom: 1rem;
        }
        .post-card-head {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(145deg, rgba(110, 201, 196, 0.35), rgba(34, 44, 56, 1));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }
        .post-author-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .post-author-name {
          font-weight: 700;
        }
        .anon-badge {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.15rem 0.45rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
        }
        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.2rem;
        }
        .post-title {
          margin: 0 0 0.35rem;
          font-size: 1.15rem;
        }
        .post-body {
          margin: 0;
          white-space: pre-wrap;
          color: #d5dee8;
        }
        .post-images {
          margin-top: 0.85rem;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .post-images.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 4px;
        }
        .post-img {
          width: 100%;
          max-height: 280px;
          object-fit: cover;
        }
        .post-card-foot {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border);
          font-size: 0.88rem;
        }
        .read-more {
          margin-left: auto;
          font-weight: 600;
          color: var(--accent);
        }
        .read-more:hover {
          text-decoration: underline;
        }
      `}</style>
    </article>
  );
}
