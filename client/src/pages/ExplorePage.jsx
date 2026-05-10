import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#FF6B6B,#FF8E53)",
  "linear-gradient(135deg,#A78BFA,#7C3AED)",
  "linear-gradient(135deg,#7EC8A0,#34D399)",
  "linear-gradient(135deg,#6BB8FF,#3B82F6)",
  "linear-gradient(135deg,#F59E0B,#D97706)",
  "linear-gradient(135deg,#F472B6,#EC4899)",
];
function getGradient(str=""){let h=0;for(const c of str)h=(h*31+c.charCodeAt(0))%AVATAR_GRADIENTS.length;return AVATAR_GRADIENTS[h];}
function initials(name=""){return name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?";}

const TOPICS = [
  {id:"all",label:"All Stories",count:1247},
  {id:"growth",label:"Personal Growth",count:384},
  {id:"mental",label:"Mental Health",count:291},
  {id:"love",label:"Love & Relationships",count:256},
  {id:"grief",label:"Grief & Loss",count:198},
  {id:"career",label:"Career & Work",count:174},
  {id:"family",label:"Family",count:163},
  {id:"recovery",label:"Recovery",count:142},
];

const MOODS = [
  {id:"inspiring",label:"Inspiring",emoji:"✨",count:423,bg:"#FFF0EC",color:"#FF6B6B"},
  {id:"healing",label:"Healing",emoji:"🌱",count:318,bg:"#F0FDF9",color:"#059669"},
  {id:"uplifting",label:"Uplifting",emoji:"😄",count:197,bg:"#FFF8E1",color:"#D97706"},
  {id:"deep",label:"Deep & Raw",emoji:"🌊",count:309,bg:"#F5F3FF",color:"#7C3AED"},
];

const TYPE_STYLES = {
  lesson:{label:"💡 Life Lesson",bg:"#FFF0EC",color:"#FF6B6B",bar:"linear-gradient(to right,#FF6B6B,#FF8E53)"},
  reflection:{label:"🪞 Reflection",bg:"#F5F3FF",color:"#7C3AED",bar:"linear-gradient(to right,#A78BFA,#7C3AED)"},
  experience:{label:"💝 Experience",bg:"#FDF2F8",color:"#BE185D",bar:"linear-gradient(to right,#F472B6,#EC4899)"},
  greatest:{label:"🌟 Greatest Moment",bg:"#FFFBEB",color:"#D97706",bar:"linear-gradient(to right,#F59E0B,#D97706)"},
  mental:{label:"🧠 Mental Health",bg:"#EFF6FF",color:"#1D4ED8",bar:"linear-gradient(to right,#6BB8FF,#3B82F6)"},
  recovery:{label:"🌿 Recovery",bg:"#F0FDF9",color:"#059669",bar:"linear-gradient(to right,#34D399,#059669)"},
};

function StoryCard({ story }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const typeStyle = TYPE_STYLES[story.postType] || TYPE_STYLES.lesson;
  const readTime = Math.max(1, Math.ceil(story.content?.length / 800));

  return (
    <div
      onClick={() => navigate(`/post/${story.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.storyCard,
        ...(hovered ? styles.storyCardHover : {}),
      }}
    >
      <div style={{ height: 4, background: typeStyle.bar, width: "100%" }} />
      <div style={styles.scBody}>
        <div style={styles.scTypeRow}>
          <span style={{ ...styles.scType, background: typeStyle.bg, color: typeStyle.color }}>
            {typeStyle.label}
          </span>
          <span style={styles.scReading}>{readTime} min read</span>
        </div>
        <div style={styles.scTitle}>{story.title || "Untitled"}</div>
        <div style={styles.scPreview}>{story.content}</div>
        <div style={styles.scFooter}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: story.isAnonymous ? "#FFD5C2" : getGradient(story.authorName),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8, fontWeight: 800, color: story.isAnonymous ? "#C96A4F" : "white", flexShrink: 0,
          }}>
            {story.isAnonymous ? "?" : initials(story.authorName)}
          </div>
          <span style={styles.scAuthor}>{story.isAnonymous ? "Anonymous" : story.authorName}</span>
          <span style={styles.scLikes}>❤️ {story.likes}</span>
        </div>
      </div>
    </div>
  );
}

const FEATURED = [
  { id: "f1", title: "The day I finally stopped apologizing for taking up space", author: "Sarah M.", type: "Greatest Moment", likes: 847, replies: 124, bg: "linear-gradient(160deg,#1a0a05 0%,#3d1810 40%,#7a3020 100%)", badgeBg: "rgba(255,107,107,0.25)", badgeColor: "#FF9999", badgeBorder: "rgba(255,107,107,0.3)", badgeLabel: "✨ Greatest Moment", tall: true },
  { id: "f2", title: "Two years sober — what I lost and what I found", author: "Anonymous", type: "Recovery", likes: 612, replies: 89, bg: "linear-gradient(160deg,#0d2b1a 0%,#1a5c34 100%)", badgeBg: "rgba(52,211,153,0.25)", badgeColor: "#6EE7B7", badgeBorder: "rgba(52,211,153,0.3)", badgeLabel: "🌿 Recovery", tall: false },
  { id: "f3", title: "Grief taught me things happiness never could", author: "Clara L.", type: "Reflection", likes: 1200, replies: 203, bg: "linear-gradient(160deg,#1a0d2b 0%,#4a1d7a 100%)", badgeBg: "rgba(167,139,250,0.25)", badgeColor: "#C4B5FD", badgeBorder: "rgba(167,139,250,0.3)", badgeLabel: "🪞 Reflection", tall: false },
];

export function ExplorePage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("all");
  const [activeMood, setActiveMood] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => { loadStories(true); }, [activeTopic, activeMood]);

  async function loadStories(reset = false) {
    setLoading(true);
    try {
      const p = reset ? 1 : page;
      const res = await api.get(`/posts/explore?topic=${activeTopic}&mood=${activeMood || ""}&page=${p}&q=${search}`);
      setStories(reset ? res.data.stories : prev => [...prev, ...res.data.stories]);
      setHasMore(res.data.hasMore);
      if (reset) setPage(1);
    } finally { setLoading(false); }
  }

  async function loadMore() {
    const next = page + 1; setPage(next);
    const res = await api.get(`/posts/explore?topic=${activeTopic}&mood=${activeMood || ""}&page=${next}&q=${search}`);
    setStories(prev => [...prev, ...(res.data.stories || [])]);
    setHasMore(res.data.hasMore);
  }

  return (
    <div style={styles.page}>
      <div style={styles.blob1} /><div style={styles.blob2} /><div style={styles.blob3} />

      {/* Ticker */}
      <div style={styles.tickerWrap}>
        <div style={styles.tickerInner}>
          {["LIFETHREADS","SHARE YOUR STORY","1,247 STORIES","JOIN THE COMMUNITY","YOU ARE NOT ALONE",
            "LIFETHREADS","SHARE YOUR STORY","1,247 STORIES","JOIN THE COMMUNITY","YOU ARE NOT ALONE"].map((t,i) => (
            <span key={i} style={styles.tickerItem}>
              <span style={styles.tickerDot} />{t}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.wrap}>
        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.heroEyebrow}>🔭 Explore</div>
          <h1 style={styles.heroTitle}>Discover <em style={styles.titleEm}>stories</em> that move you</h1>
          <p style={styles.heroSub}>Browse thousands of real experiences — lessons, reflections, and moments of courage.</p>
        </div>

        {/* Search */}
        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && loadStories(true)}
            placeholder="Search stories, topics, feelings…"
            style={styles.searchInp}
          />
          {search && (
            <button onClick={() => { setSearch(""); loadStories(true); }} style={styles.clearBtn}>✕</button>
          )}
        </div>

        {/* Featured */}
        <div style={styles.sectionHdr}>
          <span style={styles.sectionLabel}>Featured Stories</span>
          <button style={styles.seeAll}>See all →</button>
        </div>
        <div style={styles.featuredGrid}>
          {FEATURED.map((f) => (
            <div
              key={f.id}
              onClick={() => navigate(`/post/${f.id}`)}
              style={{ ...styles.featCard, ...(f.tall ? styles.featCardTall : {}), background: f.bg }}
            >
              <div style={styles.featOverlay} />
              <div style={styles.featContent}>
                <div style={{ ...styles.featBadge, background: f.badgeBg, color: f.badgeColor, border: `1px solid ${f.badgeBorder}` }}>
                  {f.badgeLabel}
                </div>
                <div style={{ ...styles.featTitle, ...(f.tall ? styles.featTitleTall : {}) }}>{f.title}</div>
                <div style={styles.featMeta}>
                  <span style={styles.featAuthor}>{f.author}</span>
                  <span style={styles.featStats}>❤️ {f.likes.toLocaleString()} · 💬 {f.replies}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Topics */}
        <div style={styles.sectionHdr}>
          <span style={styles.sectionLabel}>Trending Topics</span>
        </div>
        <div style={styles.trendingRow}>
          {TOPICS.map(t => (
            <div
              key={t.id}
              onClick={() => setActiveTopic(t.id)}
              style={{ ...styles.trendPill, ...(activeTopic === t.id ? styles.trendPillActive : {}) }}
            >
              <span style={{ ...styles.trendName, ...(activeTopic === t.id ? { color: "white" } : {}) }}>{t.label}</span>
              <span style={{ ...styles.trendCount, ...(activeTopic === t.id ? { color: "rgba(255,255,255,0.8)" } : {}) }}>{t.count.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Mood Mosaic */}
        <div style={styles.sectionHdr}>
          <span style={styles.sectionLabel}>Browse by Mood</span>
        </div>
        <div style={styles.catMosaic}>
          {MOODS.map(m => (
            <div
              key={m.id}
              onClick={() => setActiveMood(activeMood === m.id ? null : m.id)}
              style={{ ...styles.catTile, background: m.bg, color: m.color, ...(activeMood === m.id ? { border: `1.5px solid ${m.color}`, boxShadow: `0 0 0 3px ${m.color}22` } : {}) }}
            >
              <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>{m.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 800, display: "block", marginBottom: 2 }}>{m.label}</span>
              <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>{m.count} stories</span>
            </div>
          ))}
        </div>

        {/* Stories Grid */}
        <div style={styles.sectionHdr}>
          <span style={styles.sectionLabel}>{activeTopic === "all" ? "Recent Stories" : `${TOPICS.find(t=>t.id===activeTopic)?.label} Stories`}</span>
          <button style={styles.seeAll}>View all →</button>
        </div>

        {loading && stories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#8B6355" }}>Loading stories…</div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <span style={{ fontSize: 36, display: "block", marginBottom: 10 }}>🔍</span>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "#2D1B12", marginBottom: 6 }}>No stories found</div>
            <div style={{ fontSize: 13, color: "#8B6355" }}>Try different keywords or browse all topics</div>
          </div>
        ) : (
          <div style={styles.storiesGrid}>
            {stories.map(s => <StoryCard key={s.id} story={s} />)}
          </div>
        )}

        {hasMore && (
          <button onClick={loadMore} style={styles.loadMore}>Load more stories ↓</button>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700&display=swap');
        @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(14px,-14px) scale(1.04);}}
        @keyframes tickerMove{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
      `}</style>
    </div>
  );
}

const styles = {
  page:{minHeight:"100vh",background:"#FFF8F3",fontFamily:"'Nunito',sans-serif",position:"relative",overflow:"hidden",paddingBottom:"4rem"},
  blob1:{position:"fixed",top:-100,right:-80,width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,#FFD0BC 0%,transparent 68%)",animation:"blobFloat 10s ease-in-out infinite",pointerEvents:"none",zIndex:0},
  blob2:{position:"fixed",bottom:-80,left:-60,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,#FFE8D6 0%,transparent 68%)",animation:"blobFloat 13s ease-in-out infinite reverse",pointerEvents:"none",zIndex:0},
  blob3:{position:"fixed",top:"40%",left:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,#FFF0E0 0%,transparent 68%)",animation:"blobFloat 8s ease-in-out infinite 2s",pointerEvents:"none",zIndex:0},
  tickerWrap:{background:"linear-gradient(135deg,#FF6B6B,#FF8E53)",overflow:"hidden",padding:"8px 0"},
  tickerInner:{display:"flex",whiteSpace:"nowrap",animation:"tickerMove 22s linear infinite"},
  tickerItem:{display:"inline-flex",alignItems:"center",gap:8,padding:"0 2rem",fontSize:12,fontWeight:800,color:"white",letterSpacing:"0.04em"},
  tickerDot:{width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.5)",flexShrink:0},
  wrap:{position:"relative",zIndex:1,maxWidth:800,margin:"0 auto",padding:"1.75rem 1.25rem"},
  hero:{textAlign:"center",paddingBottom:"1rem"},
  heroEyebrow:{display:"inline-flex",alignItems:"center",gap:6,background:"white",border:"1.5px solid #FFE4D6",borderRadius:100,padding:"5px 16px",fontSize:12,fontWeight:800,color:"#C96A4F",marginBottom:"1rem",boxShadow:"0 2px 12px rgba(255,107,107,0.08)"},
  heroTitle:{fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:"#2D1B12",lineHeight:1.2,marginBottom:"0.6rem"},
  titleEm:{fontStyle:"italic",background:"linear-gradient(135deg,#FF6B6B,#FF8E53)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  heroSub:{fontSize:14,color:"#8B6355",maxWidth:480,margin:"0 auto 1.5rem",lineHeight:1.65},
  searchBar:{position:"relative",maxWidth:520,margin:"0 auto 2rem"},
  searchIcon:{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:16},
  searchInp:{width:"100%",padding:"14px 44px",borderRadius:100,border:"2px solid #FFE4D6",background:"white",fontSize:14,fontFamily:"'Nunito',sans-serif",color:"#2D1B12",outline:"none",transition:"all 0.2s",boxShadow:"0 4px 20px rgba(255,107,107,0.08)"},
  clearBtn:{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#C0A090"},
  sectionHdr:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.85rem",marginTop:"1.5rem"},
  sectionLabel:{fontSize:11,fontWeight:800,color:"#B0907E",textTransform:"uppercase",letterSpacing:"0.1em"},
  seeAll:{fontSize:12,color:"#FF6B6B",fontWeight:800,cursor:"pointer",background:"none",border:"none",fontFamily:"'Nunito',sans-serif",textDecoration:"underline",textUnderlineOffset:3},
  featuredGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"auto auto",gap:12,marginBottom:"2rem"},
  featCard:{borderRadius:20,overflow:"hidden",cursor:"pointer",transition:"all 0.25s",position:"relative",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"1.25rem",minHeight:180},
  featCardTall:{gridRow:"span 2",minHeight:380},
  featOverlay:{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.05) 60%)"},
  featContent:{position:"relative",zIndex:1},
  featBadge:{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:100,fontSize:10,fontWeight:800,marginBottom:8,backdropFilter:"blur(4px)"},
  featTitle:{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"white",lineHeight:1.3,marginBottom:6,textShadow:"0 1px 8px rgba(0,0,0,0.3)"},
  featTitleTall:{fontSize:21},
  featMeta:{display:"flex",alignItems:"center",gap:8},
  featAuthor:{fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:700},
  featStats:{fontSize:11,color:"rgba(255,255,255,0.7)",fontWeight:600,marginLeft:"auto"},
  trendingRow:{display:"flex",flexWrap:"wrap",gap:8,marginBottom:"1rem"},
  trendPill:{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:100,background:"white",border:"1.5px solid #FFE4D6",cursor:"pointer",transition:"all 0.2s",fontFamily:"'Nunito',sans-serif"},
  trendPillActive:{background:"linear-gradient(135deg,#FF6B6B,#FF8E53)",borderColor:"transparent"},
  trendName:{fontSize:12,fontWeight:800,color:"#4A2E22"},
  trendCount:{fontSize:10,color:"#B0907E",fontWeight:700},
  catMosaic:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:"1rem"},
  catTile:{borderRadius:16,padding:"1.1rem",cursor:"pointer",transition:"all 0.2s",border:"1.5px solid transparent",textAlign:"center"},
  storiesGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1.5rem"},
  storyCard:{background:"white",borderRadius:18,border:"1px solid #FFE4D6",overflow:"hidden",cursor:"pointer",transition:"all 0.22s"},
  storyCardHover:{transform:"translateY(-2px)",boxShadow:"0 8px 28px rgba(255,107,107,0.13)",borderColor:"#FFD5C2"},
  scBody:{padding:"1rem 1.1rem"},
  scTypeRow:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6},
  scType:{fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:100},
  scReading:{fontSize:10,color:"#C0A090",fontWeight:700},
  scTitle:{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"#2D1B12",lineHeight:1.35,marginBottom:6},
  scPreview:{fontSize:12,color:"#8B6355",lineHeight:1.55,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"},
  scFooter:{display:"flex",alignItems:"center",gap:7,paddingTop:8,borderTop:"1px solid #FFF0E8"},
  scAuthor:{fontSize:11,color:"#8B6355",fontWeight:700,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},
  scLikes:{fontSize:11,color:"#C0A090",fontWeight:700,flexShrink:0},
  loadMore:{width:"100%",padding:13,borderRadius:14,border:"2px dashed #FFD5C2",background:"transparent",color:"#C96A4F",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",transition:"all 0.2s"},
};
