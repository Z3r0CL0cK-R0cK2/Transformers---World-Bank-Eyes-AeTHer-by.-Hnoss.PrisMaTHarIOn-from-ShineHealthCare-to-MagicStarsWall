import { useState } from "react";
import { Check, Cloud, Container, Copy, RotateCw, ScrollText, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const LINES: { text: string; flags?: string[] }[] = [
  { text: "curl -fsSL https://get.oneclick.platform/install.sh | \\" },
  { text: "bash -s -- --with-mcp --with-docker", flags: ["--with-mcp", "--with-docker"] },
];

const RAW =
  "curl -fsSL https://get.oneclick.platform/install.sh | \\\n  bash -s -- --with-mcp --with-docker";

const BASE_LOG = [
  "[10:02:11] bootstrap  · resolving install manifest",
  "[10:02:12] docker     · engine 27.1.1 detected",
  "[10:02:14] mcp        · registry synced (18 tools)",
  "[10:02:15] workspace  · ~/.oneclick initialised",
  "[10:02:16] done       · control plane ready",
];

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
  const [running, setRunning] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [log, setLog] = useState<string[]>(BASE_LOG);

  async function copy() {
    try {
      await navigator.clipboard.writeText(RAW);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function rerun() {
    if (running) return;
    setRunning(true);
    setShowLogs(true);
    setLog([`[${new Date().toLocaleTimeString("de-DE")}] bootstrap  · re-running setup …`]);
    const steps = [
      "docker     · engine check ok",
      "mcp        · registry re-synced",
      "workspace  · config rewritten",
      "done       · control plane ready",
    ];
    steps.forEach((step, i) => {
      setTimeout(
        () => {
          setLog((prev) => [...prev, `[${new Date().toLocaleTimeString("de-DE")}] ${step}`]);
          if (i === steps.length - 1) setRunning(false);
        },
        (i + 1) * 550,
      );
    });
  }

  return (
    <div className={cn("glass-panel glass-lift prism-edge specular-sweep p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          One-Click Bootstrap
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <span className={cn("dot-live", running && "animate-pulse")} />
          {running ? "Running · setup" : "Ready · MCP synced"}
        </span>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-md border border-[color-mix(in_oklab,var(--silver)_20%,transparent)] bg-background/45">
        <pre className="overflow-x-auto py-3 pl-3 pr-16 font-mono text-[13px] leading-7 text-foreground">
          <code>
            {LINES.map((line, i) => (
              <div key={i} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
                <span className="select-none text-right text-muted-foreground/70">{i + 1}</span>
                <span className="whitespace-pre">{renderLine(line)}</span>
              </div>
            ))}
          </code>
        </pre>
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-1.5">
          <button
            type="button"
            onClick={copy}
            aria-label="Befehl kopieren"
            title="Befehl kopieren"
            className="glass-click grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground transition-transform hover:scale-105"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="glass-click inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "kopiert" : "Befehl kopieren"}
        </button>
        <button
          type="button"
          onClick={rerun}
          disabled={running}
          className="glass-click inline-flex items-center gap-1.5 rounded-md border border-primary/40 px-2.5 py-1.5 font-mono text-[11px] text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
        >
          <RotateCw className={cn("h-3.5 w-3.5", running && "animate-spin")} />
          {running ? "läuft …" : "Setup erneut starten"}
        </button>
        <button
          type="button"
          onClick={() => setShowLogs((v) => !v)}
          aria-expanded={showLogs}
          className="glass-click inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ScrollText className="h-3.5 w-3.5" />
          {showLogs ? "Logs ausblenden" : "Logs ansehen"}
        </button>
      </div>

      {showLogs ? (
        <pre className="mt-3 max-h-44 overflow-auto rounded-md border border-border bg-background/55 p-3 text-left font-mono text-[11px] leading-6 text-muted-foreground">
          {log.join("\n")}
        </pre>
      ) : null}

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
