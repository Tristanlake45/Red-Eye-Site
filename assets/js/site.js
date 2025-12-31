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
  