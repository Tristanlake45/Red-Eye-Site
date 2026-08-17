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
{
  key: "featured",
  label: "Featured Productions",
  items: [
    { title: "Featured Production #1", youtube: "https://youtu.be/rTKRercgzJA" },
    { title: "Featured Production #2", youtube: "https://youtu.be/4Scnlhzq_I4" },
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
        <img src="${ytThumb(id)}" alt="${v.title}" loading="lazy" decoding="async">
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

/* ===== RED EYE 2.0 INTERACTION LAYER ===== */
(function () {
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function buildPixelWipe() {
  if (reduceMotion || document.querySelector(".pixel-wipe")) return;
  const wipe = document.createElement("div");
  wipe.className = "pixel-wipe is-entering";
  wipe.setAttribute("aria-hidden", "true");
  wipe.innerHTML = Array.from({ length: 12 }, (_, i) => `<span style="--i:${i}"></span>`).join("") +
    `<div class="pixel-wipe-mark"><div class="pixel-wipe-logo"><img src="/assets/img/redEyeCircleLogo.png" alt=""></div></div>`;
  document.body.appendChild(wipe);
  window.setTimeout(() => wipe.classList.remove("is-entering"), 620);
}

function initPageLinks() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || reduceMotion || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || link.target === "_blank" || url.hash || link.href.startsWith("mailto:")) return;
    event.preventDefault();
    const wipe = document.querySelector(".pixel-wipe");
    if (!wipe) { window.location.href = url.href; return; }
    wipe.className = "pixel-wipe is-leaving";
    window.setTimeout(() => { window.location.href = url.href; }, 720);
  });
}

function initReveals() {
  const items = document.querySelectorAll(".section, .website-card, .gallery-item");
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  items.forEach((item) => item.classList.add("reveal-ready"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: .08 });
  items.forEach((item) => observer.observe(item));
}

function initDragScroll() {
  document.querySelectorAll(".scroller").forEach((scroller) => {
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    scroller.addEventListener("pointerdown", (event) => {
      if (event.target.closest("iframe, a, button")) return;
      dragging = true;
      startX = event.clientX;
      startScroll = scroller.scrollLeft;
      scroller.classList.add("is-dragging");
      scroller.setPointerCapture(event.pointerId);
    });
    scroller.addEventListener("pointermove", (event) => {
      if (dragging) scroller.scrollLeft = startScroll - (event.clientX - startX);
    });
    const stop = () => { dragging = false; scroller.classList.remove("is-dragging"); };
    scroller.addEventListener("pointerup", stop);
    scroller.addEventListener("pointercancel", stop);
  });
}

async function initFloatingGraphics() {
  const gallery = document.getElementById("gallery");
  if (!gallery || !gallery.classList.contains("gallery--floating")) return;

  const elements = Array.from(gallery.querySelectorAll(".gallery-item"));
  if (!elements.length) return;

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const images = elements.map((element) => element.querySelector("img")).filter(Boolean);
  const states = elements.map((element, index) => ({
    element,
    index,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    scale: 1,
    targetScale: 1,
    hovered: false,
    focused: false,
    dragging: false,
    suppressClick: false,
    pointerId: null,
    pointerStartX: 0,
    pointerStartY: 0,
    itemStartX: 0,
    itemStartY: 0
  }));

  let active = false;
  let animationFrame = 0;
  let previousTime = 0;
  let resizeFrame = 0;
  const edgePadding = () => gallery.clientWidth < 620 ? 16 : 38;

  function boundsFor(state) {
    const padding = edgePadding();
    return {
      maxX: Math.max(padding, gallery.clientWidth - state.element.offsetWidth - padding),
      maxY: Math.max(padding, gallery.clientHeight - state.element.offsetHeight - padding)
    };
  }

  function clampState(state) {
    const bounds = boundsFor(state);
    const padding = edgePadding();
    state.x = Math.min(bounds.maxX, Math.max(padding, state.x));
    state.y = Math.min(bounds.maxY, Math.max(padding, state.y));
  }

  function render(state) {
    state.element.style.setProperty("transform", `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) scale(${state.scale.toFixed(4)})`, "important");
  }

  function layoutItems() {
    gallery.classList.add("is-floating");
    const arenaWidth = gallery.clientWidth;
    const padding = edgePadding();
    const columns = arenaWidth >= 1240 ? 5 : arenaWidth >= 900 ? 4 : arenaWidth >= 620 ? 3 : 2;
    const cellWidth = (arenaWidth - padding * 2) / columns;
    const widthFactors = [.78, .9, .84, .94, .82];
    const minimumWidth = arenaWidth < 620 ? 118 : 170;

    states.forEach((state) => {
      const width = Math.min(310, Math.max(minimumWidth, cellWidth * widthFactors[state.index % widthFactors.length]));
      state.element.style.setProperty("width", `${width}px`, "important");
    });

    const rows = Math.ceil(states.length / columns);
    const rowHeights = Array.from({ length: rows }, () => 0);
    states.forEach((state) => {
      const row = Math.floor(state.index / columns);
      rowHeights[row] = Math.max(rowHeights[row], state.element.offsetHeight);
    });

    const rowGap = Math.max(arenaWidth < 620 ? 54 : 86, cellWidth * .34);
    const rowTops = [];
    let nextTop = padding;
    rowHeights.forEach((height, row) => {
      rowTops[row] = nextTop;
      nextTop += height + rowGap;
    });
    gallery.style.height = `${Math.max(1500, Math.ceil(nextTop + padding))}px`;

    states.forEach((state) => {
      const column = state.index % columns;
      const row = Math.floor(state.index / columns);
      const horizontalRoom = Math.max(0, cellWidth - state.element.offsetWidth);
      const jitterX = Math.sin((state.index + 1) * 2.17) * Math.min(14, horizontalRoom * .25);
      const jitterY = Math.cos((state.index + 1) * 1.73) * Math.min(20, rowGap * .18);
      state.x = padding + column * cellWidth + horizontalRoom / 2 + jitterX;
      state.y = rowTops[row] + jitterY;

      const angle = (state.index * 2.399963) + .55;
      const speed = 7 + (state.index % 6) * 1.35;
      state.vx = Math.cos(angle) * speed;
      state.vy = Math.sin(angle) * speed;
      state.scale = 1;
      state.targetScale = 1;
      clampState(state);
      render(state);
    });
  }

  function animate(time) {
    if (!active) return;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
    previousTime = time;
    const lightboxOpen = document.getElementById("lightbox")?.classList.contains("open");

    states.forEach((state) => {
      state.scale += (state.targetScale - state.scale) * Math.min(1, delta * 12);

      if (!lightboxOpen && !state.hovered && !state.focused && !state.dragging) {
        state.x += state.vx * delta;
        state.y += state.vy * delta;
        const bounds = boundsFor(state);
        const padding = edgePadding();
        if (state.x <= padding || state.x >= bounds.maxX) state.vx *= -1;
        if (state.y <= padding || state.y >= bounds.maxY) state.vy *= -1;
        clampState(state);
      }

      render(state);
    });

    animationFrame = requestAnimationFrame(animate);
  }

  function activate() {
    if (active || reduceMotion) return;
    active = true;
    layoutItems();
    previousTime = 0;
    animationFrame = requestAnimationFrame(animate);
  }

  function deactivate() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(animationFrame);
    gallery.classList.remove("is-floating");
    gallery.style.height = "";
    states.forEach((state) => {
      state.element.classList.remove("is-dragging");
      state.element.style.width = "";
      state.element.style.transform = "";
      state.element.style.zIndex = "";
    });
  }

  states.forEach((state) => {
    const element = state.element;
    element.addEventListener("dragstart", (event) => event.preventDefault());
    element.addEventListener("pointerenter", () => {
      if (!active || !canHover.matches) return;
      state.hovered = true;
      state.targetScale = 1.12;
      element.style.zIndex = "20";
    });
    element.addEventListener("pointerleave", () => {
      if (!canHover.matches) return;
      state.hovered = false;
      if (!state.dragging && !state.focused) {
        state.targetScale = 1;
        element.style.zIndex = "";
      }
    });
    element.addEventListener("focus", () => {
      if (!active) return;
      state.focused = true;
      state.targetScale = 1.12;
      element.style.zIndex = "20";
    });
    element.addEventListener("blur", () => {
      state.focused = false;
      if (!state.hovered && !state.dragging) {
        state.targetScale = 1;
        element.style.zIndex = "";
      }
    });
    element.addEventListener("pointerdown", (event) => {
      if (!active || (event.pointerType === "mouse" && event.button !== 0)) return;
      state.pointerId = event.pointerId;
      state.pointerStartX = event.clientX;
      state.pointerStartY = event.clientY;
      state.itemStartX = state.x;
      state.itemStartY = state.y;
      state.suppressClick = false;
      if (!canHover.matches) {
        state.targetScale = 1.075;
        element.style.zIndex = "30";
      }
      element.setPointerCapture(event.pointerId);
    });
    element.addEventListener("pointermove", (event) => {
      if (!active || state.pointerId !== event.pointerId) return;
      const dx = event.clientX - state.pointerStartX;
      const dy = event.clientY - state.pointerStartY;
      if (!state.dragging && Math.hypot(dx, dy) > 6) {
        state.dragging = true;
        state.suppressClick = true;
        state.targetScale = 1.075;
        element.classList.add("is-dragging");
        element.style.zIndex = "30";
      }
      if (!state.dragging) return;
      event.preventDefault();
      state.x = state.itemStartX + dx;
      state.y = state.itemStartY + dy;
      clampState(state);
    });

    const finishDrag = (event) => {
      if (state.pointerId !== event.pointerId) return;
      state.pointerId = null;
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      state.dragging = false;
      element.classList.remove("is-dragging");
      const remainsActive = (canHover.matches && state.hovered) || state.focused;
      state.targetScale = remainsActive ? 1.12 : 1;
      element.style.zIndex = remainsActive ? "20" : "";
    };
    element.addEventListener("pointerup", finishDrag);
    element.addEventListener("pointercancel", finishDrag);
    element.addEventListener("lostpointercapture", finishDrag);
    element.addEventListener("click", (event) => {
      if (!state.suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      state.suppressClick = false;
    }, true);
  });

  const respondToViewport = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (!reduceMotion) {
        if (!active) activate();
        else layoutItems();
      } else {
        deactivate();
      }
    });
  };

  window.addEventListener("resize", respondToViewport, { passive: true });
  images.forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", respondToViewport, { once: true });
    img.addEventListener("error", respondToViewport, { once: true });
  });
  activate();
}

function initGalleryTilt() {
  if (reduceMotion || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
  document.querySelectorAll(".gallery-item").forEach((item) => {
    if (item.closest("#graphics")) return;
    let frame = 0;
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        item.style.zIndex = "5";
        item.style.transform = `perspective(900px) translate(${x * 14}px, ${y * 14 - 10}px) scale(1.045) rotateX(${-y * 2.4}deg) rotateY(${x * 2.4}deg)`;
      });
    });
    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
      item.style.zIndex = "";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildPixelWipe();
  initPageLinks();
  initReveals();
  initDragScroll();
  initFloatingGraphics();
  initGalleryTilt();
});
})();
