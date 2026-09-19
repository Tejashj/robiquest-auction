/**
 * ============================================================================
 * ZERO-DEPENDENCY HARDWARE-ACCELERATED CANVAS CONFETTI CANNON
 * High-Density 60fps Particle Physics for Stadium Celebration Overlays
 * ============================================================================
 */

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
}

export function triggerConfettiCannon(options: ConfettiOptions = {}) {
  if (typeof window === 'undefined') return;

  const count = options.particleCount || 160;
  const spread = options.spread || 80;
  const originX = options.origin?.x ?? 0.5;
  const originY = options.origin?.y ?? 0.6;
  const colors = options.colors || [
    '#16A085', // Theme Primary Emerald
    '#D8CFB4', // Theme Foreground Gold
    '#1abc9c', // Primary Light
    '#ffffff', // Clean White
    '#16A085',
    '#D8CFB4',
  ];

  let canvas = document.getElementById('broadcast-confetti-canvas') as HTMLCanvasElement;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'broadcast-confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
  }

  const particles: Particle[] = [];
  const radSpread = (spread * Math.PI) / 180;

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * radSpread;
    const speed = 12 + Math.random() * 22;

    particles.push({
      x: canvas.width * originX,
      y: canvas.height * originY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 6,
      vy: Math.sin(angle) * speed,
      size: 7 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
    });
  }

  let animationFrameId: number;

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.42; // Gravity
      p.vx *= 0.985; // Drag
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008; // Fade out

      if (p.opacity > 0 && p.y < canvas.height + 50) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrameId);
    }
  }

  render();
}
