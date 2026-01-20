(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Copy email (keep it simple; not a "disclosure" — just utility)
  const copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = "hi@icort.pro";
      try {
        await navigator.clipboard.writeText(email);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy email"), 1200);
      } catch {
        // Fallback: prompt
        window.prompt("Copy email:", email);
      }
    });
  }

  const revealNodes = document.querySelectorAll("[data-reveal]");
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealNodes.length) {
    revealNodes.forEach((node) => node.classList.add("reveal"));

    if (prefersReducedMotion) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      revealNodes.forEach((node) => observer.observe(node));
    }
  }

  // --- Animated background: "space drift" particles + connections ---
  const canvas = document.getElementById("bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0,
    h = 0,
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  // Particles
  const COUNT = prefersReducedMotion
    ? 0
    : Math.floor(Math.min(90, Math.max(40, (w * h) / 35000)));

  const particles = [];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.12, 0.12),
      vy: rand(-0.08, 0.08),
      r: rand(0.8, 1.8),
      a: rand(0.1, 0.28),
    });
  }

  // --- Scroll parallax (subtle Apple-glass drift) ---
  // We don't redraw on scroll directly; we only update offsets and use them in the animation loop.
  let scrollY = window.scrollY || 0;
  let targetOffsetX = 0;
  let targetOffsetY = 0;
  let offsetX = 0;
  let offsetY = 0;

  // Tuning knobs (keep tiny)
  const PARALLAX_X = 10; // px max
  const PARALLAX_Y = 18; // px max
  const SMOOTH = 0.06; // smoothing per frame

  function onScroll() {
    scrollY = window.scrollY || 0;
    // Clamp factor so very long pages don't exaggerate motion
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const t = Math.min(1, scrollY / maxScroll);

    // Move slightly as you scroll (feels like depth)
    targetOffsetY = t * PARALLAX_Y;

    // A tiny side drift so it feels alive (not tied to cursor)
    targetOffsetX = (t - 0.5) * PARALLAX_X;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function step() {
    // Smooth offsets (avoid jitter)
    offsetX += (targetOffsetX - offsetX) * SMOOTH;
    offsetY += (targetOffsetY - offsetY) * SMOOTH;

    ctx.clearRect(0, 0, w, h);

    // Very subtle vignette for Apple-glass depth
    const g = ctx.createRadialGradient(
      w * 0.5 + offsetX * 0.2,
      h * 0.45 + offsetY * 0.2,
      50,
      w * 0.5 + offsetX * 0.2,
      h * 0.45 + offsetY * 0.2,
      Math.max(w, h) * 0.7
    );
    g.addColorStop(0, "rgba(255,255,255,0.035)");
    g.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      // Apply parallax offset in draw only (not in physics), so motion stays stable
      const px = p.x + offsetX;
      const py = p.y + offsetY;

      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    }

    // Soft connections
    const maxDist = 140;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i],
          b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.1;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x + offsetX, a.y + offsetY);
          ctx.lineTo(b.x + offsetX, b.y + offsetY);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  if (!prefersReducedMotion) requestAnimationFrame(step);
})();
