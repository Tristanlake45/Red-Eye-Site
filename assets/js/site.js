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
    links.forEach(a => {
      const target = a.getAttribute("href").replace(/\/$/, "");
      if (target === path || (target === "" && path === "")) {
        a.classList.add("active");
      }
    });
  
    // IMPORTANT: nav exists now, so wire up mobile toggle now
    initMobileNav();
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
  
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setOpen(false);
    });
  
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }
  
  function setYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }
  
  // Intro splash (white fade + logo)
(function () {
    const intro = document.getElementById("intro");
    if (!intro) return;
  
    // Fade logo in
    requestAnimationFrame(() => {
      intro.classList.add("is-on");
    });
  
    const SHOW_MS = 700;
    const FADE_MS = 550;
  
    // Fade out + remove
    setTimeout(() => {
      intro.classList.add("is-off");
      setTimeout(() => intro.remove(), FADE_MS + 50);
    }, SHOW_MS);
  })();
  
  function initLogoBanner() {
    const banner = document.querySelector(".logo-banner");
    const img = document.querySelector(".logo-banner__img");
    if (!banner || !img) return;
  
    const whiteLogo = img.getAttribute("src");       // white logo (default)
    const redLogo   = img.dataset.hover;             // red logo
  
    if (banner.dataset.bound === "1") return;
    banner.dataset.bound = "1";
  
    banner.addEventListener("mouseenter", () => {
      img.src = redLogo;
    });
  
    banner.addEventListener("mouseleave", () => {
      img.src = whiteLogo;
      img.style.transform = "";
    });
  
    banner.addEventListener("mousemove", (e) => {
      const r = banner.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
  
      const maxMove = 10;
      img.style.transform = `translate(${x * maxMove}px, ${y * maxMove}px)`;
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    initLogoBanner();
  });
  