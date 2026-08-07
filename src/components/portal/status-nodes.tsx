import { Boxes, Bot, Cpu, Database, Network, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Node = {
  label: string;
  status: string;
  icon: LucideIcon;
  dot: string;
  className: string;
};

const NODES: Node[] = [
  {
    label: "API Gateway",
    status: "v2.4.1",
    icon: Network,
    dot: "bg-muted-foreground",
    className: "left-[6%] top-[16%]",
  },
  {
    label: "MCP Server",
    status: "Online",
    icon: Cpu,
    dot: "bg-success",
    className: "left-[2%] top-[42%]",
  },
  {
    label: "Vector DB",
    status: "Ready",
    icon: Database,
    dot: "bg-success",
    className: "left-[5%] bottom-[16%]",
  },
  {
    label: "K8S Cluster",
    status: "Healthy",
    icon: Boxes,
    dot: "bg-success",
    className: "right-[5%] top-[14%]",
  },
  {
    label: "AI Agent",
    status: "Active",
    icon: Bot,
    dot: "bg-success",
    className: "right-[3%] top-[42%]",
  },
  {
    label: "Deployment",
    status: "Live",
    icon: Rocket,
    dot: "bg-primary",
    className: "right-[5%] bottom-[16%]",
  },
];

export function StatusNodes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      <svg className="absolute inset-0 h-full w-full opacity-50" preserveAspectRatio="none">
        <defs>
          <linearGradient id="nodeLinkCool" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--eu)" stopOpacity="0.05" />
            <stop offset="60%" stopColor="var(--eu)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--eu)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="nodeLinkWarm" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--vivid)" stopOpacity="0.1" />
            <stop offset="55%" stopColor="var(--cyber)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--vivid)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d="M 60 250 H 200 L 260 190 H 400 L 460 250 H 560"
          fill="none"
          stroke="url(#nodeLinkCool)"
          strokeWidth="1"
        />
        <path d="M 230 455 H 380 L 430 505 H 560" fill="none" stroke="url(#nodeLinkWarm)" strokeWidth="1" />
        <path
          d="M 1380 250 H 1240 L 1180 190 H 1040 L 980 250 H 880"
          fill="none"
          stroke="url(#nodeLinkCool)"
          strokeWidth="1"
        />
        <path
          d="M 1330 455 H 1180 L 1130 505 H 980"
          fill="none"
          stroke="url(#nodeLinkWarm)"
          strokeWidth="1"
        />
      </svg>

      {NODES.map((node) => (
        <div
          key={node.label}
          className={cn(
            "drift-slow absolute rounded-lg border border-border/80 bg-card/70 px-3 py-2 backdrop-blur-md",
            node.className,
          )}
        >
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground/90">
            <node.icon className="h-3 w-3 text-primary" />
            {node.label}
          </p>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", node.dot)} />
            {node.status}
          </p>
        </div>
      ))}
    </div>
  );
}
