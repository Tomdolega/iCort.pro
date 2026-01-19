// app.js
(function () {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu
  const menuBtn = document.querySelector(".menu-btn");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
      const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.hidden = isOpen;
    });

    // Close menu after clicking a link
    mobileNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menuBtn.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  // Copy 2-line summary (grant-safe)
  const copyBtn = document.getElementById("copy-summary");
  const copied = document.getElementById("copied");

  const summary =
    "iCort Pro is an early-stage applied R&D initiative focused on fixed-geometry hardware for spatial capture.\n" +
    "The approach improves repeatability and metrical consistency by reducing reliance on continuous runtime estimation.";

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(summary);
        if (copied) {
          copied.hidden = false;
          setTimeout(() => (copied.hidden = true), 1200);
        }
      } catch (e) {
        // Fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = summary;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);

        if (copied) {
          copied.hidden = false;
          setTimeout(() => (copied.hidden = true), 1200);
        }
      }
    });
  }
})();
