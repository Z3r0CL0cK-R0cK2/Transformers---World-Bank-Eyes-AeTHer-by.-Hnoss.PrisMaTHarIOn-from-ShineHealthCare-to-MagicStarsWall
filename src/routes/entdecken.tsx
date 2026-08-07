import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldCheck, Star } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, SectionHeader } from "@/components/portal/portal-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ q: z.string().max(80).optional() });

export const Route = createFileRoute("/entdecken")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Discover & Research — Ökosystem-Katalog" },
      {
        name: "description",
        content:
          "Durchsuche verifizierte SDKs, Docker-Templates und MCP-Server. Filter nach Kategorie, Stack und Verifizierungsstatus.",
      },
      { property: "og:title", content: "Discover & Research — Ökosystem-Katalog" },
      {
        property: "og:description",
        content: "Verifizierte SDKs, Docker-Templates und MCP-Server im Ökosystem-Verzeichnis.",
      },
    ],
  }),
  component: DiscoverPage,
});

const kindLabels: Record<string, string> = {
  sdk: "SDK",
  docker: "Docker",
  mcp: "MCP",
  framework: "Framework",
  service: "Service",
};

function DiscoverPage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [category, setCategory] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_items")
        .select(
          "id, slug, name, description, category, kind, tech_stack, verified, vendor, install_command",
        )
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(
    () => [...new Set((data ?? []).map((i) => i.category))].sort(),
    [data],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data ?? []).filter((item) => {
      if (verifiedOnly && !item.verified) return false;
      if (category && item.category !== category) return false;
      if (!needle) return true;
      return (
        item.name.toLowerCase().includes(needle) ||
        (item.description ?? "").toLowerCase().includes(needle) ||
        (item.tech_stack ?? []).some((s: string) => s.toLowerCase().includes(needle))
      );
    });
  }, [data, query, category, verifiedOnly]);

  return (
    <PortalShell>
      <div className="mx-auto max-w-5xl space-y-10">
        <SectionHeader
          id="suche"
          eyebrow="Discover & Research"
          title="Ökosystem-Verzeichnis"
          description="Verifizierte SDKs, Docker-Templates und MCP-Server. Suche nach Namen, Beschreibung oder Tech-Stack."
        />

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              maxLength={80}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="z. B. typescript, postgres, mcp …"
              className="pl-9 font-mono text-xs"
            />
          </div>

          <div id="kategorien" className="flex flex-wrap gap-1.5 scroll-mt-32">
            <FilterChip active={!category} onClick={() => setCategory(null)}>
              Alle
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </FilterChip>
            ))}
            <FilterChip active={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)}>
              nur verifiziert
            </FilterChip>
          </div>
        </div>

        <div id="verzeichnis" className="scroll-mt-32">
          {isLoading ? (
            <p className="font-mono text-xs text-muted-foreground">lade Katalog …</p>
          ) : filtered.length === 0 ? (
            <p className="rounded-md border border-border bg-card p-6 text-center font-mono text-xs text-muted-foreground">
              Keine Einträge für diese Filter.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="flex min-w-0 items-center gap-1.5 font-mono text-sm font-semibold">
                        <span className="truncate">{item.name}</span>
                        {item.verified ? (
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
                        ) : null}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                      {kindLabels[item.kind] ?? item.kind}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {(item.tech_stack ?? []).slice(0, 4).map((s: string) => (
                      <span
                        key={s}
                        className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Star className="h-3 w-3" /> {item.vendor ?? "community"}
                    </span>

                  </div>

                  {item.install_command ? (
                    <pre className="mt-3 overflow-x-auto rounded border border-border bg-background px-2.5 py-2 font-mono text-[11px] text-muted-foreground">
                      {item.install_command}
                    </pre>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-5">
          <p className="min-w-0 text-xs text-muted-foreground">
            Alles gefunden? Der Bootstrapper installiert Docker, MCP und SDKs in einem Schritt.
          </p>
          <Button asChild size="sm" className="font-mono text-xs">
            <Link to="/start">Zum One-Click-Setup</Link>
          </Button>
        </div>
      </div>
    </PortalShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
