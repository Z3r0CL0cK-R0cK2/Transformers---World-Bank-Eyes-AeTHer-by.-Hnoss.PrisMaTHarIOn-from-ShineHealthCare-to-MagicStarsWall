import { Bot, Cpu, Database, Network, ShieldCheck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Node = {
  label: string;
  status: string;
  icon: LucideIcon;
  tone: "vivid" | "eu" | "success" | "cyber";
  className: string;
};

const NODES: Node[] = [
  { label: "API Gateway", status: "online", icon: Network, tone: "eu", className: "left-[2%] top-[18%]" },
  { label: "K8S Cluster", status: "3 nodes", icon: Cpu, tone: "vivid", className: "right-[3%] top-[12%]" },
  { label: "AI Agent", status: "mcp linked", icon: Bot, tone: "vivid", className: "left-[5%] bottom-[16%]" },
  { label: "Vector DB", status: "synced", icon: Database, tone: "cyber", className: "right-[5%] bottom-[22%]" },
  { label: "ISV Badge", status: "verified", icon: ShieldCheck, tone: "success", className: "right-[14%] top-[46%]" },
  { label: "Deploy Runner", status: "idle", icon: Zap, tone: "eu", className: "left-[11%] top-[50%]" },
];

const toneRing: Record<Node["tone"], string> = {
  vivid: "text-primary shadow-[0_0_28px_-8px_var(--vivid)]",
  eu: "text-[var(--eu-foreground)] shadow-[0_0_28px_-8px_var(--eu)]",
  success: "text-success shadow-[0_0_28px_-8px_var(--success)]",
  cyber: "text-[var(--cyber)] shadow-[0_0_28px_-8px_var(--cyber)]",
};

export function StatusNodes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="nodeLink" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--eu)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="var(--vivid)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--cyber)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path d="M 140 150 H 380 V 320" fill="none" stroke="url(#nodeLink)" strokeWidth="1" />
        <path d="M 1300 120 H 1040 V 300" fill="none" stroke="url(#nodeLink)" strokeWidth="1" />
        <path d="M 180 420 H 420 V 520" fill="none" stroke="url(#nodeLink)" strokeWidth="1" />
        <path d="M 1260 470 H 1020 V 540" fill="none" stroke="url(#nodeLink)" strokeWidth="1" />
      </svg>

      {NODES.map((node) => (
        <div
          key={node.label}
          className={cn(
            "glass-panel drift-slow absolute flex items-center gap-2.5 px-3 py-2",
            node.className,
            toneRing[node.tone],
          )}
        >
          <node.icon className="h-4 w-4" />
          <div className="leading-tight">
            <p className="font-mono text-[11px] font-semibold text-foreground">{node.label}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {node.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
