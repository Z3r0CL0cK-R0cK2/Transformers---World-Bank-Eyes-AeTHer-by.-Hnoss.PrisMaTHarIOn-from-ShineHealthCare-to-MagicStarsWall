import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  ExternalLink,
  FileCode2,
  Network,
  Search,
  ShieldCheck,
} from "lucide-react";
import { PortalShell, SectionHeader } from "@/components/portal/portal-shell";
import { EuStars } from "@/components/portal/eu-stars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  validatedDirectory,
  validatedCategories,
  lookupValidated,
  similarTo,
  type ValidatedEntry,
} from "@/lib/validated-directory";

export const Route = createFileRoute("/verzeichnis")({
  head: () => ({
    meta: [
      { title: "Live validiertes Unternehmens-Verzeichnis — oneclick.platform" },
      {
        name: "description",
        content:
          "472 live geprüfte Unternehmens-Domains aus Compliance, Finance, Tokenization, Observability und Cloud — inklusive echter Partner-Portale und Developer-Docs.",
      },
      { property: "og:title", content: "Live validiertes Unternehmens-Verzeichnis" },
      {
        property: "og:description",
        content:
          "Jede Domain per HTTP live aufgelöst, Redirects gefolgt, Partner-Portale und Docs verifiziert. Keine Platzhalter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DirectoryPage,
});

function DirectoryPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [check, setCheck] = useState("");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const resolved = useMemo(() => (check ? lookupValidated(check) : null), [check]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return validatedDirectory.filter(
      (e) =>
        (!cat || e.category === cat) &&
        (!q || e.name.toLowerCase().includes(q) || e.url.toLowerCase().includes(q)),
    );
  }, [query, cat]);

  return (
    <PortalShell>
      <div className="relative mx-auto max-w-5xl space-y-8">
        <EuStars
          size={280}
          className="pointer-events-none absolute -top-8 right-0 opacity-[0.16] mix-blend-screen"
        />

        <SectionHeader
          eyebrow="Live Validation Registry"
          title="Live validiertes Unternehmens-Verzeichnis"
          description={`${validatedDirectory.length} Domains aus den eingereichten Listen wurden live per HTTP aufgelöst — Kurz-URLs und defekte Links wurden auf die echte Zieladresse umgeschrieben, tote Domains entfernt. Partner-Portale und Developer-Docs sind ebenfalls live geprüft.`}
        />

        <div className="titan-case specular-sweep space-y-3 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Name / URL-Abgleich
          </p>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Input
              value={check}
              placeholder="z. B. „complycube“, „tokeny.com“ oder „grafana“"
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
                ✓ Erreichbar (HTTP {resolved.status}):{" "}
                <span className="font-semibold">{resolved.name}</span> ·{" "}
                <a href={resolved.url} target="_blank" rel="noreferrer noopener" className="underline">
                  {resolved.url.replace(/^https?:\/\//, "")}
                </a>
              </p>
            ) : (
              <p className="font-mono text-xs text-warning">
                Kein validierter Treffer — Domain war beim Prüflauf nicht erreichbar.
              </p>
            )
          ) : null}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Verzeichnis durchsuchen…"
            className="pl-8 font-mono text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCat(null)}
            className={`rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
              cat === null
                ? "border-primary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Alle ({validatedDirectory.length})
          </button>
          {validatedCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                cat === c
                  ? "border-primary text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c} ({validatedDirectory.filter((e) => e.category === c).length})
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {list.map((entry) => (
            <DirectoryCard
              key={entry.slug}
              entry={entry}
              open={openSlug === entry.slug}
              onToggle={() => setOpenSlug((s) => (s === entry.slug ? null : entry.slug))}
            />
          ))}
        </div>

        {list.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">Keine Treffer.</p>
        ) : null}
      </div>
    </PortalShell>
  );
}

function DirectoryCard({
  entry,
  open,
  onToggle,
}: {
  entry: ValidatedEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const similar = useMemo(() => (open ? similarTo(entry.slug) : []), [open, entry.slug]);

  return (
    <div className="titan-case specular-sweep space-y-2.5 p-4">
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
        <Badge className="shrink-0 gap-1 bg-success/15 font-mono text-[10px] text-success">
          <BadgeCheck className="h-3 w-3" /> {entry.status}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="font-mono text-[10px]">
          {entry.category}
        </Badge>
        {entry.docs ? (
          <a
            href={entry.docs}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <FileCode2 className="h-3 w-3" /> Docs
          </a>
        ) : null}
        {entry.partnerPortal ? (
          <a
            href={entry.partnerPortal}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <ShieldCheck className="h-3 w-3" /> Partner-Portal
          </a>
        ) : null}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onToggle}
        className="gap-1.5 font-mono text-[11px]"
      >
        <Network className="h-3.5 w-3.5" />
        {open ? "Ähnliche ausblenden" : "Ähnliche Anbieter"}
      </Button>

      {open ? (
        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {similar.length} validierte Anbieter in „{entry.category}“
          </p>
          {similar.map((s) => (
            <a
              key={s.slug}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="block truncate font-mono text-[11px] text-muted-foreground hover:text-primary"
            >
              {s.name} · {s.url.replace(/^https?:\/\//, "")}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
