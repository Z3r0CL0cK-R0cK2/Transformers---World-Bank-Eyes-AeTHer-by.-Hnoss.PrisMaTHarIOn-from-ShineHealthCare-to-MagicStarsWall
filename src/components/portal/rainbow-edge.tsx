/**
 * Schmaler, wellenartiger Regenbogen-Rand um die gesamte Seite.
 * Rein dekorativ, liegt über allem, blockiert keine Klicks.
 */

const W = 1000;
const H = 1000;
const INSET = 5;
const AMP = 3.2;
const STEP = 12;

function wave(
  from: [number, number],
  to: [number, number],
  amp = AMP,
  phase = 0,
): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // Normale zur Richtung
  const nx = -uy;
  const ny = ux;
  const steps = Math.max(8, Math.round(len / STEP));
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const off = Math.sin(t * Math.PI * 10 + phase) * amp;
    const x = x1 + dx * t + nx * off;
    const y = y1 + dy * t + ny * off;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d.trim();
}

const EDGES = [
  wave([INSET, INSET], [W - INSET, INSET], AMP, 0),
  wave([W - INSET, INSET], [W - INSET, H - INSET], AMP, 1.1),
  wave([W - INSET, H - INSET], [INSET, H - INSET], AMP, 2.2),
  wave([INSET, H - INSET], [INSET, INSET], AMP, 3.3),
];

export function RainbowEdge() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 select-none"
      style={{ animation: "rainbow-hue 24s linear infinite" }}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="rainbow-edge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.19 20)" />
            <stop offset="18%" stopColor="oklch(0.8 0.17 75)" />
            <stop offset="36%" stopColor="oklch(0.84 0.18 140)" />
            <stop offset="54%" stopColor="oklch(0.8 0.16 195)" />
            <stop offset="72%" stopColor="oklch(0.72 0.17 265)" />
            <stop offset="88%" stopColor="oklch(0.68 0.24 330)" />
            <stop offset="100%" stopColor="oklch(0.72 0.19 20)" />
          </linearGradient>
          <filter id="rainbow-edge-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {EDGES.map((d, i) => (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke="url(#rainbow-edge-grad)"
              strokeWidth={2.4}
              strokeLinecap="round"
              opacity={0.35}
              filter="url(#rainbow-edge-glow)"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={d}
              fill="none"
              stroke="url(#rainbow-edge-grad)"
              strokeWidth={1}
              strokeLinecap="round"
              opacity={0.85}
              strokeDasharray="46 26"
              vectorEffect="non-scaling-stroke"
              style={{ animation: `rainbow-drift ${18 + i * 3}s linear infinite` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
