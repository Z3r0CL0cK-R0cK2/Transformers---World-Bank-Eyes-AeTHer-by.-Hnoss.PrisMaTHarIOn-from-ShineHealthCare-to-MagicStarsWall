import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Boxes,
  Container,
  ExternalLink,
  FileCode2,
  Github,
  Mail,
  Network,
  Package,
  Search,
  ShieldCheck,
} from "lucide-react";
import { PortalShell, SectionHeader } from "@/components/portal/portal-shell";
import { CodeBlock } from "@/components/portal/code-block";
import { EuStars } from "@/components/portal/eu-stars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ecosystem,
  partnerLabels,
  resolveEntry,
  allContacts,
  type EcosystemEntry,
} from "@/lib/ecosystem-network";

export const Route = createFileRoute("/netzwerk")({
  head: () => ({
    meta: [
      { title: "Validiertes Ecosystem-Netzwerk — oneclick.platform" },
      {
        name: "description",
        content:
          "Geprüfte Unternehmens-URLs, Partner-Portale, SDKs, APIs, MCP-Server, Docker- und AppImage-Skripte plus One-Click-Kontakt zu allen Ansprechpartnern.",
      },
      { property: "og:title", content: "Validiertes Ecosystem-Netzwerk" },
      {
        property: "og:description",
        content:
          "Live-Abgleich von Firmennamen und URLs, Zertifizierungs-Badges, Install-Skripte und One-Click-Kontakt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NetworkPage,
});

function NetworkPage() {
  const [query, setQuery] = useState("");
  const [check, setCheck] = useState("");

  const resolved = useMemo(() => (check ? resolveEntry(check) : null), [check]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ecosystem;
    return ecosystem.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.aliases.some((a) => a.includes(q)),
    );
  }, [query]);

  const mailAll = `mailto:${allContacts.join(",")}?subject=${encodeURIComponent(
    "Partner-Anfrage · oneclick.platform",
  )}&body=${encodeURIComponent(
    "Guten Tag,\n\nwir möchten unsere Plattform an Ihr Partner-/ISV-Portal anbinden (SDK, API, MCP, Docker).\n\nBeste Grüße",
  )}`;

  return (
    <PortalShell>
      <div className="relative mx-auto max-w-5xl space-y-10">
        <EuStars
          size={300}
          className="pointer-events-none absolute -top-10 right-0 opacity-[0.18] mix-blend-screen"
        />

        <SectionHeader
          eyebrow="Ecosystem Validation Grid"
          title="Validiertes Partner- & Technologie-Netzwerk"
          description="Firmennamen und URLs werden gegen die kanonische Domain abgeglichen. Jeder Eintrag liefert Partner-Portal, Docs, SDK/API, GitHub, MCP, Docker- bzw. AppImage-Skript und eine echte Kontaktadresse."
        />

        <div className="titan-case specular-sweep space-y-3 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Name / URL-Abgleich
          </p>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Input
              value={check}
              placeholder="z. B. „hugging face“, „gitlab.com“ oder „otel“"
              onChange={(e) => setCheck(e.target.value)}
              className="font-mono text-xs"
            />
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5 font-mono text-xs">
              <ShieldCheck className="h-3.5 w-3.5" /> Validieren
            </Button>
          </div>
          {check ? (
            resolved ? (
              <p className="font-mono text-xs text-success">
                ✓ Kanonisch: <span className="font-semibold">{resolved.name}</span> ·{" "}
                <a
                  href={resolved.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  {resolved.url.replace(/^https?:\/\//, "")}
                </a>
              </p>
            ) : (
              <p className="font-mono text-xs text-warning">
                Kein kanonischer Treffer im validierten Netzwerk — Eintrag bitte über das
                Partner-Programm einreichen.
              </p>
            )
          ) : null}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="relative min-w-0">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Netzwerk durchsuchen…"
              className="pl-8 font-mono text-xs"
            />
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1.5 font-mono text-xs">
            <a href={mailAll}>
              <Mail className="h-3.5 w-3.5" /> One-Click an alle
            </a>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {list.map((entry) => (
            <EntryCard key={entry.slug} entry={entry} />
          ))}
        </div>

        <div className="titan-case specular-sweep space-y-3 p-4">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-primary">
            <Network className="h-3 w-3" /> Master Sync
          </p>
          <CodeBlock
            label="bash"
            code={`#!/usr/bin/env bash
# Ecosystem-Netzwerk validieren und synchronisieren
for host in ${ecosystem
              .slice(0, 6)
              .map((e) => e.url.replace(/^https?:\/\//, ""))
              .join(" ")}; do
  curl -sSfI "https://$host" >/dev/null && echo "ok   $host" || echo "fail $host"
done`}
          />
        </div>
      </div>
    </PortalShell>
  );
}

function EntryCard({ entry }: { entry: EcosystemEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="titan-case specular-sweep space-y-3 p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-glow-soft truncate text-sm font-semibold">{entry.name}</h3>
          <a
            href={entry.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
          >
            {entry.url.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {entry.certified ? (
          <Badge className="shrink-0 gap-1 bg-success/15 font-mono text-[10px] text-success">
            <BadgeCheck className="h-3 w-3" /> certified
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="font-mono text-[10px]">
          {entry.category}
        </Badge>
        {entry.partner.map((p) => (
          <Badge key={p} variant="outline" className="font-mono text-[10px] text-muted-foreground">
            {partnerLabels[p]}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <LinkChip href={entry.docs} icon={FileCode2} label="Docs" />
        <LinkChip href={entry.api} icon={Boxes} label="API" />
        <LinkChip href={entry.sdk} icon={Package} label="SDK" />
        <LinkChip href={entry.github} icon={Github} label="Repo" />
        <LinkChip href={entry.mcp} icon={Network} label="MCP" />
        <LinkChip href={entry.partnerPortal} icon={ShieldCheck} label="Partner-Portal" />
        {entry.contact ? (
          <a
            href={`mailto:${entry.contact}?subject=${encodeURIComponent("Partner-Anfrage · oneclick.platform")}`}
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <Mail className="h-3 w-3" /> Kontakt
          </a>
        ) : null}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5 font-mono text-[11px]"
      >
        <Container className="h-3.5 w-3.5" />
        {open ? "Skripte ausblenden" : "Install- & Docker-Skripte"}
      </Button>

      {open ? (
        <div className="space-y-2">
          {entry.docker ? <CodeBlock label="docker" code={entry.docker} /> : null}
          {entry.appimage ? <CodeBlock label="appimage" code={entry.appimage} /> : null}
          {entry.install ? <CodeBlock label="install" code={entry.install} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function LinkChip({
  href,
  icon: Icon,
  label,
}: {
  href?: string;
  icon: typeof Mail;
  label: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
    >
      <Icon className="h-3 w-3" /> {label}
    </a>
  );
}
