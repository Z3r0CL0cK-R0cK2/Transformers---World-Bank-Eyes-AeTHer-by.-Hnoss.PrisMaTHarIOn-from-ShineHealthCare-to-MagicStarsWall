import { useState } from "react";
import { Check, Cloud, Container, Copy, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const LINES: { text: string; flags?: string[] }[] = [
  { text: "curl -fsSL https://get.oneclick.platform/install.sh | \\" },
  { text: "bash -s -- --with-mcp --with-docker", flags: ["--with-mcp", "--with-docker"] },
];

const RAW = "curl -fsSL https://get.oneclick.platform/install.sh | \\\n  bash -s -- --with-mcp --with-docker";

function renderLine(line: { text: string; flags?: string[] }) {
  if (!line.flags) return line.text;
  const pattern = new RegExp(`(${line.flags.join("|")})`, "g");
  return line.text.split(pattern).map((part, i) =>
    line.flags?.includes(part) ? (
      <span key={i} className="text-primary">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function BootstrapTerminal({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(RAW);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("glass-panel prism-edge specular-sweep p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          One-Click Bootstrap
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <span className="dot-live" />
          Ready · MCP synced
        </span>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-md border border-border bg-background/70">
        <pre className="overflow-x-auto py-3 pl-3 pr-14 font-mono text-[13px] leading-7 text-foreground">
          <code>
            {LINES.map((line, i) => (
              <div key={i} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
                <span className="select-none text-right text-muted-foreground/70">{i + 1}</span>
                <span className="whitespace-pre">{renderLine(line)}</span>
              </div>
            ))}
          </code>
        </pre>
        <button
          type="button"
          onClick={copy}
          aria-label="Befehl kopieren"
          className="glass-click absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md bg-primary text-primary-foreground transition-transform hover:scale-105"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Cloud className="h-3.5 w-3.5" /> Self-hosted
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Server className="h-3.5 w-3.5 text-success" /> MCP ready
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Container className="h-3.5 w-3.5" /> Docker ready
        </span>
      </div>
    </div>
  );
}
