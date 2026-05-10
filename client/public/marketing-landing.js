// ── CURSOR ──
const cur = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  cur.style.left = mx + "px";
  cur.style.top = my + "px";
});
(function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + "px";
  ring.style.top = ry + "px";
  requestAnimationFrame(animRing);
})();

function bindCursorTargets() {
  document
    .querySelectorAll(
      "button:not([data-cursor-bound]), a:not([data-cursor-bound]), .story-card:not([data-cursor-bound]), .bento-tile:not([data-cursor-bound]), .story-peek:not([data-cursor-bound]), .testi-card:not([data-cursor-bound])"
    )
    .forEach((el) => {
      el.dataset.cursorBound = "1";
      el.addEventListener("mouseenter", () => {
        cur.style.width = "18px";
        cur.style.height = "18px";
        ring.style.width = "52px";
        ring.style.height = "52px";
      });
      el.addEventListener("mouseleave", () => {
        cur.style.width = "10px";
        cur.style.height = "10px";
        ring.style.width = "36px";
        ring.style.height = "36px";
      });
    });
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(window._tt);
  window._tt = setTimeout(() => (t.style.transform = "translateX(-50%) translateY(80px)"), 2200);
}

// ── STORY DATA ──
const stories = [
  {
    type: "Greatest Moment",
    typeColor: "#C94F1E",
    typeBg: "#FEF3EC",
    bar: "linear-gradient(to right,#C94F1E,#D4952A)",
    title: "The day I stopped apologising for taking up space",
    excerpt:
      "For years I kept shrinking myself. Then one Tuesday morning it clicked — nobody was giving me permission.",
    author: "Sarah R.",
    av: "SR",
    avBg: "linear-gradient(135deg,#C94F1E,#D4952A)",
    time: "2h ago",
    likes: 847,
    replies: 124,
  },
  {
    type: "Recovery",
    typeColor: "#3A6B4C",
    typeBg: "#EEF5F1",
    bar: "linear-gradient(to right,#3A6B4C,#5A9E72)",
    title: "Two years sober — what I lost, and what I found",
    excerpt:
      "Everyone talks about what you give up. Nobody talks about what you find. Here's my honest account of both.",
    author: "Anonymous",
    av: "?",
    avBg: "#E8DFD0",
    avColor: "var(--mist)",
    time: "5h ago",
    likes: 612,
    replies: 89,
  },
  {
    type: "Reflection",
    typeColor: "#6B4EC9",
    typeBg: "#F3F0FA",
    bar: "linear-gradient(to right,#6B4EC9,#9B7EE0)",
    title: "Grief taught me things happiness never could",
    excerpt:
      "Lost my dad four years ago. Most days I'm okay. Then a song hits and suddenly it's like it just happened.",
    author: "Clara L.",
    av: "CL",
    avBg: "linear-gradient(135deg,#6B4EC9,#9B7EE0)",
    time: "Yesterday",
    likes: 1200,
    replies: 203,
  },
  {
    type: "Life Lesson",
    typeColor: "#8B6320",
    typeBg: "#FBF5E6",
    bar: "linear-gradient(to right,#D4952A,#E8B84B)",
    title: "I quit with no backup plan. Six months on — zero regrets.",
    excerpt:
      "Every practical person said don't do it. But staying was slowly draining something I couldn't name.",
    author: "Tom K.",
    av: "TK",
    avBg: "linear-gradient(135deg,#D4952A,#E8B84B)",
    time: "2d ago",
    likes: 489,
    replies: 67,
  },
  {
    type: "Experience",
    typeColor: "#A4244E",
    typeBg: "#FAEDF2",
    bar: "linear-gradient(to right,#C94F7A,#E07EAA)",
    title: "Long distance for 3 years — what actually made it work",
    excerpt:
      "Not the advice columns. Real rituals, real fights over text, and moments that made us closer than couples nearby.",
    author: "Riya S.",
    av: "RS",
    avBg: "linear-gradient(135deg,#C94F7A,#E07EAA)",
    time: "3d ago",
    likes: 534,
    replies: 78,
  },
  {
    type: "Tough Time",
    typeColor: "#1E5C8B",
    typeBg: "#E8F3FB",
    bar: "linear-gradient(to right,#1E5C8B,#3A8EC9)",
    title: "What actually helped my anxiety — not just deep breathing",
    excerpt:
      "I'd heard the advice a thousand times. This is what moved the needle after years of trying everything.",
    author: "Jamie M.",
    av: "JM",
    avBg: "linear-gradient(135deg,#1E5C8B,#3A8EC9)",
    time: "4d ago",
    likes: 723,
    replies: 141,
  },
];

function formatLikeCount(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

function storyCardHtml(s, i, hiddenClass = "") {
  return `
          <div class="story-card ${hiddenClass}" style="animation-delay:${i * 0.07}s" onclick="showToast('Opening story…')">
            <div class="sc-bar" style="background:${s.bar}"></div>
            <div class="sc-body">
              <div class="sc-type" style="background:${s.typeBg};color:${s.typeColor};">${s.type}</div>
              <div class="sc-title">${s.title}</div>
              <div class="sc-excerpt">${s.excerpt}</div>
              <div class="sc-footer">
                <div class="sc-av" style="background:${s.avBg};color:${s.avColor || "white"}">${s.av}</div>
                <div class="sc-meta">
                  <div class="sc-author">${s.author}</div>
                  <div class="sc-time">${s.time}</div>
                </div>
                <button type="button" class="sc-likes-btn" data-base-likes="${s.likes}" onclick="event.stopPropagation(); likeCard(this)">
                  ♥ ${formatLikeCount(s.likes)}
                </button>
              </div>
            </div>
          </div>
        `;
}

function renderStories(filter = "all") {
  const grid = document.getElementById("storiesGrid");
  grid.innerHTML = stories
    .map((s, i) => {
      const matches = filter === "all" || s.type.toLowerCase().includes(filter.toLowerCase());
      return storyCardHtml(s, i, !matches ? "hidden" : "");
    })
    .join("");
  bindCursorTargets();
  observeRevealTargets();
}

function likeCard(btn) {
  const base = parseInt(btn.dataset.baseLikes, 10);
  if (Number.isNaN(base)) return;
  btn.classList.toggle("liked");
  const liked = btn.classList.contains("liked");
  btn.classList.add("pop");
  setTimeout(() => btn.classList.remove("pop"), 400);
  const count = liked ? base + 1 : base;
  btn.textContent = "♥ " + formatLikeCount(count);
  showToast(liked ? "♥ Added to helpful stories" : "Removed like");
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.animation = "fadeInUp 0.7s ease forwards";
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);

function observeRevealTargets() {
  document
    .querySelectorAll(
      ".story-card:not([data-reveal-observed]), .bento-tile:not([data-reveal-observed]), .testi-card:not([data-reveal-observed]), .step:not([data-reveal-observed])"
    )
    .forEach((el) => {
      el.dataset.revealObserved = "1";
      el.style.opacity = "0";
      revealObserver.observe(el);
    });
}

// ── CATEGORIES BENTO ──
const categories = [
  { emoji: "🌱", name: "Personal Growth", count: "384 stories", bg: "#EEF7F1", color: "#2D5A3D" },
  { emoji: "🧠", name: "Mental Health", count: "291 stories", bg: "#F0EEF7", color: "#3D2D5A" },
  { emoji: "💛", name: "Love & Relationships", count: "256 stories", bg: "#FEF7E8", color: "#5A3D1A" },
  { emoji: "🌊", name: "Grief & Loss", count: "198 stories", bg: "#EEF2F7", color: "#1A2D5A" },
  { emoji: "💼", name: "Career & Work", count: "174 stories", bg: "#F7F2EE", color: "#5A3A1A" },
  { emoji: "👨‍👩‍👧", name: "Family", count: "163 stories", bg: "#F7EEF2", color: "#5A1A2D" },
  { emoji: "🕊️", name: "Recovery", count: "142 stories", bg: "#EEF7F5", color: "#1A5A4D" },
  { emoji: "✨", name: "Identity", count: "117 stories", bg: "#F7EEEE", color: "#5A1A1A" },
];

function renderBento() {
  document.getElementById("bentoGrid").innerHTML = categories
    .map(
      (c) => `
          <div class="bento-tile" style="background:${c.bg};border-color:transparent;" onclick="showToast('Browsing ${c.name}…')"
            onmouseenter="this.style.borderColor='${c.color}22'"
            onmouseleave="this.style.borderColor='transparent'">
            <div class="bento-emoji">${c.emoji}</div>
            <div class="bento-name" style="color:${c.color}">${c.name}</div>
            <div class="bento-count" style="color:${c.color};opacity:0.6">${c.count}</div>
          </div>
        `
    )
    .join("");
  bindCursorTargets();
  observeRevealTargets();
}

// ── TESTIMONIALS ──
const testimonials = [
  {
    quote:
      "I posted anonymously about my divorce, expecting nothing. Within a day I had 40 people sharing their own stories. I didn't feel alone for the first time in months.",
    name: "Member",
    sub: "Shared 3 stories",
    av: "M",
    bg: "linear-gradient(135deg,#C94F1E,#D4952A)",
  },
  {
    quote:
      "Reading other people's career failures made me brave enough to quit my job and start something new. The wisdom here is worth more than any business course.",
    name: "Tom K.",
    sub: "Writer & reader",
    av: "TK",
    bg: "linear-gradient(135deg,#D4952A,#E8B84B)",
  },
  {
    quote:
      "My grief story got a reply from someone who lost their parent the same way. We've been emailing for three months. This platform gave me a friend I didn't know I needed.",
    name: "Clara L.",
    sub: "Active contributor",
    av: "CL",
    bg: "linear-gradient(135deg,#6B4EC9,#9B7EE0)",
  },
  {
    quote:
      "Finally a space that takes real experience seriously. Not advice columns, not influencers — just honest humans sharing what they've actually lived through.",
    name: "Riya S.",
    sub: "Community member",
    av: "RS",
    bg: "linear-gradient(135deg,#C94F7A,#E07EAA)",
  },
];

function renderTestimonials() {
  document.getElementById("testimonialsGrid").innerHTML = testimonials
    .map(
      (t) => `
          <div class="testi-card">
            <div class="testi-mark">"</div>
            <div class="testi-quote">"${t.quote}"</div>
            <div class="testi-author">
              <div class="testi-av" style="background:${t.bg}">${t.av}</div>
              <div>
                <div class="testi-name">${t.name}</div>
                <div class="testi-sub">${t.sub}</div>
              </div>
            </div>
          </div>
        `
    )
    .join("");
  bindCursorTargets();
  observeRevealTargets();
}

// ── HERO CARD ROTATION ──
let cardRotation = 0;
function rotateCards() {
  cardRotation = (cardRotation + 1) % 3;
  const cards = document.querySelectorAll(".story-peek");
  cards.forEach((c, i) => {
    const pos = (i - cardRotation + 3) % 3;
    if (pos === 0) {
      c.style.cssText = "top:0;z-index:30;opacity:1;transform:scale(1)";
    } else if (pos === 1) {
      c.style.cssText = "top:48px;z-index:20;opacity:0.75;transform:scale(0.96) translateY(8px)";
    } else {
      c.style.cssText = "top:88px;z-index:10;opacity:0.45;transform:scale(0.92) translateY(16px)";
    }
  });
}

// ── INIT ──
renderStories();
renderBento();
renderTestimonials();
bindCursorTargets();
observeRevealTargets();
