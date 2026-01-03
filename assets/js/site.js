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
  
  
  