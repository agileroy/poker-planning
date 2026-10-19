// Pluie de confettis sans bibliothèque, aux couleurs du thème.
// Ne bloque aucun clic, invisible pour les lecteurs d'écran, désactivée si l'utilisateur réduit les animations.

const DURATION_MS = 2500;
const COUNT = 150;
let running = false;

function themeColors() {
  const style = getComputedStyle(document.documentElement);
  return ['--accent', '--success-text', '--warning-text', '--card-back-b', '--error']
    .map((name) => style.getPropertyValue(name).trim())
    .filter(Boolean);
}

/** Lance les confettis ; renvoie false si les animations sont réduites ou déjà en cours. */
export function launchConfetti() {
  if (running || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  running = true;

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '1000' });
  document.body.append(canvas);

  const ratio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);

  const colors = themeColors();
  const pieces = Array.from({ length: COUNT }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.5,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 4,
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)] || '#2f5d50',
  }));

  const start = performance.now();
  const frame = (now) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, elapsed - DURATION_MS * 0.7) / (DURATION_MS * 0.3));
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (elapsed < DURATION_MS) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
      running = false;
    }
  };
  requestAnimationFrame(frame);
  return true;
}
