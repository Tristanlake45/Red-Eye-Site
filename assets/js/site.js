/* assets/js/site.js (UPDATED) */

async function loadPartial(selector, partialPath) {
    const el = document.querySelector(selector);
    if (!el) return;
  
    const res = await fetch(partialPath, { cache: "no-store" });
    if (!res.ok) {
      el.innerHTML = `<!-- Failed to load partial: ${partialPath} (${res.status}) -->`;
      return;
    }
  
    el.innerHTML = await res.text();
  
    // Active nav link
    const path = window.location.pathname.replace(/\/$/, "");
    const links = el.querySelectorAll("a[data-nav]");
    links.forEach((a) => {
      const target = a.getAttribute("href").replace(/\/$/, "");
      if (target === path || (target === "" && path === "")) {
        a.classList.add("active");
      }
    });
  
    // IMPORTANT: nav exists now, so wire up mobile toggle now
    initMobileNav();
  
    // If nav is fixed, keep body padding in sync with actual nav height
    syncNavHeight();
    window.addEventListener("resize", syncNavHeight, { passive: true });
  }
  
  function syncNavHeight() {
    const nav = document.getElementById("site-nav");
    if (!nav) return;
  
    const h = Math.ceil(nav.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--nav-h", `${h}px`);
  }
  
  function initMobileNav() {
    const btn = document.querySelector(".nav-toggle");
    const nav = document.querySelector("#primary-nav");
    if (!btn || !nav) return;
  
    // prevent double-binding if loadPartial runs more than once
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
  
    function setOpen(open) {
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
  
    btn.addEventListener("click", () => {
      const isOpen = nav.classList.contains("open");
      setOpen(!isOpen);
    });
  
    // Close on link click (mobile)
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setOpen(false);
    });
  
    // Close on Escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }
  
  function setYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }
  
  /* =========================
     INTRO SPLASH (white fade + logo)
     ========================= */
  (function () {
    const intro = document.getElementById("intro");
    if (!intro) return;
  
    requestAnimationFrame(() => {
      intro.classList.add("is-on");
    });
  
    const SHOW_MS = 700;
    const FADE_MS = 550;
  
    setTimeout(() => {
      intro.classList.add("is-off");
      setTimeout(() => intro.remove(), FADE_MS + 50);
    }, SHOW_MS);
  })();
  
  /* =========================
     LOGO BANNER: mouse track (no layout change)
     Requires markup:
     <section class="logo-banner">
       <div class="logo-banner__track">
         <img class="logo-banner__img" ...>
       </div>
     </section>
     ========================= */
  function initLogoBannerMouseTrack() {
    const banner = document.querySelector(".logo-banner");
    const track = document.querySelector(".logo-banner__track");
    if (!banner || !track) return;
  
    if (banner.dataset.trackBound === "1") return;
    banner.dataset.trackBound = "1";
  
    const maxMove = 8; // px (subtle)
  
    banner.addEventListener("mousemove", (e) => {
      const r = banner.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const y = (e.clientY - r.top) / r.height - 0.5;
      track.style.transform = `translate3d(${x * maxMove}px, ${y * maxMove}px, 0)`;
    });
  
    banner.addEventListener("mouseleave", () => {
      track.style.transform = "";
    });
  }
  
  /* =========================
   
  
  /* =========================
     Boot
     ========================= */
  document.addEventListener("DOMContentLoaded", () => {
    // If nav is inline on some pages (not partial-loaded), still sync it
    syncNavHeight();
    window.addEventListener("resize", syncNavHeight, { passive: true });
  
    initLogoBannerMouseTrack();
    initLogoBannerTwitch();
  });
  
  
// ===== VIDEO DATA =====
const VIDEO_GROUPS = [
  {
    key: "rentals",
    label: "Rentals Ads",
    items: [
      { title: "Rentals Ad #1", youtube: "https://www.youtube.com/watch?v=TsWX3cik8O8" },
      { title: "Rentals Ad #2", youtube: "https://www.youtube.com/watch?v=JFzchfM8PM0" },
      { title: "Rentals Ad #3", youtube: "https://www.youtube.com/watch?v=kO7Lf7Sw0Mk" },
      { title: "Rentals Ad #4", youtube: "https://www.youtube.com/watch?v=z_5mhu1QB00" },
      { title: "Rentals Ad #5", youtube: "https://www.youtube.com/watch?v=PgeLJ0oa3ak" },
    ],
  },
  {
    key: "marine",
    label: "Vern Eide Marine",
    items: [
      { title: "Marine Video #1", youtube: "https://www.youtube.com/watch?v=vvMvvOePGto" },
      { title: "Marine Video #2", youtube: "https://www.youtube.com/watch?v=r2ZREE-C2S4" },
      { title: "Marine Video #3", youtube: "https://www.youtube.com/watch?v=1OHVtiJ_7tw" },
    ],
  },
];

// Extract YouTube ID from common URL formats
function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/").filter(Boolean);
    const shortsIndex = parts.indexOf("shorts");
    if (shortsIndex >= 0 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
  } catch {}
  return null;
}

function ytThumb(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function videoTileHTML(v, indexKey) {
  const id = getYouTubeId(v.youtube);
  if (!id) return "";
  return `
    <a class="video-tile" href="${v.youtube}" data-yt="${id}" data-key="${indexKey}">
      <div class="video-thumb">
        <img src="${ytThumb(id)}" alt="${v.title}">
        <div class="video-play" aria-hidden="true">▶</div>
      </div>
      <div class="video-title">${v.title}</div>
    </a>
  `;
}

// Home scroller: mix all videos into one row
function renderHomeVideoScroller() {
  const scroller = document.getElementById("video-scroller");
  if (!scroller) return;

  const all = VIDEO_GROUPS.flatMap(g => g.items.map(v => ({...v, group: g.key})));
  scroller.innerHTML = all.map((v, i) => videoTileHTML(v, `${v.group}-${i}`)).join("");
}

// Work video tab: grouped sections
function renderWorkVideoSections() {
  const root = document.getElementById("video-sections");
  if (!root) return;

  root.innerHTML = VIDEO_GROUPS.map((g) => {
    const tiles = g.items.map((v, i) => videoTileHTML(v, `${g.key}-${i}`)).join("");
    return `
      <div class="video-group">
        <div class="video-group__head">
          <div class="video-group__title">${g.label}</div>
        </div>
        <div class="video-grid">
          ${tiles}
        </div>
      </div>
    `;
  }).join("");
}

// Lightbox for YouTube embeds
function initVideoLightbox() {
  const links = document.querySelectorAll("a.video-tile[data-yt]");
  if (!links.length) return;

  let lb = document.getElementById("video-lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.id = "video-lightbox";
    lb.className = "video-lightbox";
    lb.innerHTML = `
      <div class="video-lightbox__card" role="dialog" aria-modal="true" aria-label="Video player">
        <div class="video-lightbox__top">
          <button class="video-lightbox__close" type="button">Close</button>
        </div>
        <div class="video-lightbox__frame">
          <iframe title="YouTube video" allowfullscreen allow="autoplay; encrypted-media"></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(lb);
  }

  const iframe = lb.querySelector("iframe");
  const closeBtn = lb.querySelector(".video-lightbox__close");

  function open(id) {
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    closeBtn.focus();
  }

  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    iframe.src = "";
  }

  links.forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(a.dataset.yt);
    });
  });

  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  window.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
  });
}

// Tabs on Work page
function initWorkTabs() {
  const tabs = document.querySelectorAll(".work-tab");
  const panels = document.querySelectorAll(".work-panel");
  if (!tabs.length || !panels.length) return;

  function setActive(name) {
    tabs.forEach(t => {
      const on = t.dataset.tab === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(p => p.classList.toggle("active", p.dataset.panel === name));
  }

  tabs.forEach(t => t.addEventListener("click", () => setActive(t.dataset.tab)));

  // default to video
  setActive("video");
}

document.addEventListener("DOMContentLoaded", () => {
  renderHomeVideoScroller();
  renderWorkVideoSections();

  // lightbox must run after tiles exist
  initVideoLightbox();

  // tabs only on work page
  initWorkTabs();
});
