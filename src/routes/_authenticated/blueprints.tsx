import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, LayoutGrid, Search, X } from "lucide-react";
import { PortalShell, SectionHeader } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type GraphNode = { id: string; label: string; x: number; y: number };
type Graph = { nodes: GraphNode[]; edges: [string, string][] };

type Blueprint = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  category: string;
  tags: string[];
  accent: string;
  node_count: number;
  edge_count: number;
  graph: Graph;
  is_public: boolean;
};

export const Route = createFileRoute("/_authenticated/blueprints")({
  head: () => ({
    meta: [
      { title: "Blueprint Gallery — oneclick.platform" },
      {
        name: "description",
        content:
          "Gespeicherte Blueprints durchsuchen, in der Vorschau ansehen und direkt auf der Infinite Canvas öffnen.",
      },
      { property: "og:title", content: "Blueprint Gallery — oneclick.platform" },
      {
        property: "og:description",
        content: "Blueprints browsen, Preview öffnen und auf der Canvas weiterbauen.",
      },
    ],
  }),
  component: BlueprintGallery,
});

const accentDot: Record<string, string> = {
  vivid: "bg-primary",
  cyber: "bg-[var(--cyber)]",
  success: "bg-success",
  eu: "bg-[oklch(0.6_0.2_265)]",
};

function GraphPreview({ graph, className }: { graph: Graph; className?: string }) {
  const pos = new Map(graph.nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("h-full w-full", className)}>
      {graph.edges.map(([a, b], i) => {
        const na = pos.get(a);
        const nb = pos.get(b);
        if (!na || !nb) return null;
        return (
          <line
            key={i}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/40"
          />
        );
      })}
      {graph.nodes.map((n) => (
        <circle key={n.id} cx={n.x} cy={n.y} r="2.2" className="fill-primary" />
      ))}
    </svg>
  );
}

function BlueprintGallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("alle");
  const [preview, setPreview] = useState<Blueprint | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["blueprints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blueprints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Blueprint[];
    },
  });

  const categories = useMemo(
    () => ["alle", ...Array.from(new Set((data ?? []).map((b) => b.category)))],
    [data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((b) => {
      const matchesCategory = category === "alle" || b.category === category;
      const matchesQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [data, query, category]);

  return (
    <PortalShell>
      <SectionHeader
        eyebrow="Blueprint Gallery"
        title="Gespeicherte Blueprints"
        description="Fertige Architektur-Graphen durchsuchen, in der Vorschau prüfen und auf der Infinite Canvas öffnen."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="glass-panel flex min-w-56 flex-1 items-center gap-2 px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Blueprints, Tags oder Stacks suchen …"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
                cat === category
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="mt-8 font-mono text-xs text-muted-foreground">Blueprints werden geladen …</p>
      ) : error ? (
        <p className="mt-8 font-mono text-xs text-destructive">
          Blueprints konnten nicht geladen werden.
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 font-mono text-xs text-muted-foreground">
          Keine Blueprints für diese Filter.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((bp) => (
            <article key={bp.id} className="glass-panel prism-edge tilt-3d flex flex-col p-4">
              <div className="relative h-32 overflow-hidden rounded-md border border-border bg-background/70">
                <GraphPreview graph={bp.graph} />
                <span className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded border border-border bg-card/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  <span className={cn("h-1.5 w-1.5 rounded-full", accentDot[bp.accent] ?? "bg-primary")} />
                  {bp.node_count} Nodes · {bp.edge_count} Links
                </span>
              </div>

              <h3 className="mt-3 font-mono text-sm font-semibold">{bp.name}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                {bp.summary}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {bp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="glass-click flex-1 font-mono text-[11px]"
                  onClick={() => setPreview(bp)}
                >
                  Vorschau
                </Button>
                <Button asChild size="sm" className="glass-click flex-1 gap-1.5 font-mono text-[11px]">
                  <a href={`/canvas?blueprint=${bp.slug}`}>
                    Öffnen <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {preview ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
        >
          <div
            className="glass-panel prism-edge iris-in w-full max-w-3xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {preview.category}
                </p>
                <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold">
                  <LayoutGrid className="h-4 w-4 text-primary" /> {preview.name}
                </h2>
                <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground">
                  {preview.summary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Vorschau schließen"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-4 h-72 overflow-hidden rounded-md border border-border bg-background/70">
              <GraphPreview graph={preview.graph} />
              {preview.graph.nodes.map((n) => (
                <span
                  key={n.id}
                  className="absolute -translate-x-1/2 translate-y-2 whitespace-nowrap font-mono text-[10px] text-muted-foreground"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  {n.label}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">
                {preview.node_count} Nodes · {preview.edge_count} Verbindungen ·{" "}
                {preview.is_public ? "öffentlich" : "privat"}
              </span>
              <Button asChild size="sm" className="glass-click gap-1.5 font-mono text-[11px]">
                <a href={`/canvas?blueprint=${preview.slug}`}>
                  Auf Canvas öffnen <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PortalShell>
  );
}
