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
  }
  
  function setYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }
  
  