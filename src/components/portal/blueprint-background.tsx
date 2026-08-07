import { useEffect, useRef } from "react";

/**
 * Blueprint construction field: layered grid, radial alloy light, drifting
 * constellation dust. Everything is fixed behind the app content.
 * The particle canvas mounts client-side only and is skipped when motion
 * is reduced (the `.motion-heavy` class is hidden by the design system).
 */
export function BlueprintBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999 };

    type Particle = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: Particle[] = [];

    function resize() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.round((width * height) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.4 + 0.5,
      }));
    }

    function onPointer(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Quantum dust displacement around the cursor
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        let px = p.x;
        let py = p.y;
        if (dist < 130 && dist > 0.001) {
          const push = (130 - dist) / 5;
          px += (dx / dist) * push;
          py += (dy / dist) * push;
        }

        ctx!.beginPath();
        ctx!.arc(px, py, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `oklch(0.9 0.02 265 / ${dist < 130 ? 0.5 : 0.22})`;
        ctx!.fill();
      }
      frame = window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="blueprint-field absolute inset-0" />
      <div className="drift-slow motion-heavy absolute inset-[-10%] opacity-70">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bp-trace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--eu)" stopOpacity="0.55" />
              <stop offset="55%" stopColor="var(--vivid)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <g stroke="url(#bp-trace)" strokeWidth="1" fill="none">
            <path d="M -40 220 H 320 V 90 H 640 V 340 H 1040 V 160 H 1500" />
            <path d="M -40 620 H 240 V 780 H 700 V 520 H 1180 V 700 H 1500" />
            <path d="M 180 -40 V 140 H 460 V 460 H 300 V 900" />
            <path d="M 980 -40 V 260 H 1220 V 560 H 900 V 940" />
          </g>
          <g fill="var(--vivid)" opacity="0.5">
            <circle cx="320" cy="90" r="3" />
            <circle cx="640" cy="340" r="3" />
            <circle cx="1040" cy="160" r="3" />
            <circle cx="700" cy="520" r="3" />
            <circle cx="1180" cy="700" r="3" />
          </g>
        </svg>
      </div>
      <canvas ref={ref} className="motion-heavy absolute inset-0 h-full w-full" />
      <div className="blueprint-vignette absolute inset-0" />
    </div>
  );
}
