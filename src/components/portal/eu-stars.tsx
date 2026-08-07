import { cn } from "@/lib/utils";

/**
 * EU-Sternenkranz: 12 goldene Sterne im Kreis, transparenter Hintergrund,
 * damit er sich nahtlos in die Seitenfläche einschmiegt (keine Kante).
 */
export function EuStars({
  className,
  size = 200,
  label,
}: {
  className?: string;
  size?: number;
  label?: string;
}) {
  const cx = 100;
  const cy = 100;
  const r = 68;

  return (
    <div className={cn("pointer-events-none select-none", className)} aria-hidden>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <defs>
          <radialGradient id="eu-star-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.72 0.15 265 / 0.22)" />
            <stop offset="70%" stopColor="oklch(0.72 0.15 265 / 0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="eu-star-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={92} fill="url(#eu-star-halo)" />
        <circle
          cx={cx}
          cy={cy}
          r={r + 14}
          fill="none"
          stroke="oklch(0.85 0.14 90 / 0.16)"
          strokeWidth={0.6}
        />

        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          return (
            <g
              key={i}
              transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}
              filter="url(#eu-star-glow)"
              style={{
                animation: `breathe ${5 + (i % 4)}s ease-in-out ${i * 0.18}s infinite`,
                transformOrigin: "center",
              }}
            >
              <Star />
            </g>
          );
        })}

        {label ? (
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            className="font-mono"
            fontSize="9"
            letterSpacing="2.4"
            fill="oklch(0.85 0.14 90 / 0.75)"
          >
            {label}
          </text>
        ) : null}
      </svg>
    </div>
  );
}

function Star() {
  const pts: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? 6.4 : 2.6;
    const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(Math.cos(ang) * rad).toFixed(2)},${(Math.sin(ang) * rad).toFixed(2)}`);
  }
  return <polygon points={pts.join(" ")} fill="oklch(0.88 0.16 92)" opacity={0.9} />;
}
