/*
  Lightweight animated background:
  - slow drifting field
  - “tech” nodes + links
  - subtle parallax on mouse
*/
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d', { alpha: true });

let w = 0, h = 0, dpr = 1;
let nodes = [];
let mouse = { x: 0, y: 0, has: false };

function resize() {
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  w = Math.floor(window.innerWidth);
  h = Math.floor(window.innerHeight);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.floor((w * h) / 22000);
  nodes = new Array(count).fill(0).map(() => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: 1.1 + Math.random() * 1.8,
    p: Math.random() * Math.PI * 2
  }));
}

function drawBackground() {
  // base gradient
  const g = ctx.createRadialGradient(w * 0.2, h * 0.2, 40, w * 0.5, h * 0.6, Math.max(w, h));
  g.addColorStop(0, 'rgba(80,120,255,0.10)');
  g.addColorStop(0.35, 'rgba(40,60,140,0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0.0)');
  ctx.fillStyle = 'rgba(7,10,18,1)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function step(t) {
  ctx.clearRect(0, 0, w, h);
  drawBackground();

  const mx = mouse.has ? mouse.x : w * 0.5;
  const my = mouse.has ? mouse.y : h * 0.5;
  const px = (mx / w - 0.5) * 18;
  const py = (my / h - 0.5) * 18;

  // links
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    a.x += a.vx;
    a.y += a.vy;
    a.p += 0.01;

    // wrap
    if (a.x < -30) a.x = w + 30;
    if (a.x > w + 30) a.x = -30;
    if (a.y < -30) a.y = h + 30;
    if (a.y > h + 30) a.y = -30;

    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist2 = dx*dx + dy*dy;
      const maxDist = 140;
      if (dist2 < maxDist*maxDist) {
        const alpha = 1 - Math.sqrt(dist2) / maxDist;
        ctx.strokeStyle = `rgba(160,190,255,${alpha * 0.18})`;
        ctx.beginPath();
        ctx.moveTo(a.x + px * 0.25, a.y + py * 0.25);
        ctx.lineTo(b.x + px * 0.25, b.y + py * 0.25);
        ctx.stroke();
      }
    }
  }

  // nodes
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const pulse = 0.7 + Math.sin(n.p) * 0.3;
    ctx.fillStyle = `rgba(220,235,255,${0.45 * pulse})`;
    ctx.beginPath();
    ctx.arc(n.x + px * 0.35, n.y + py * 0.35, n.r * pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  // subtle fog layer
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fillRect(0, 0, w, h);

  requestAnimationFrame(step);
}

window.addEventListener('resize', resize, { passive: true });
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.has = true;
}, { passive: true });

resize();
requestAnimationFrame(step);
