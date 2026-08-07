import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Crosshair,
  Link2,
  Minus,
  Plus,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Terminal,
  Container,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { logTimelineEvent } from "@/lib/timeline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NODE_W = 300;
const NODE_H = 188;
const GRID = 24;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.4;

type CanvasNode = {
  id: string;
  title: string;
  node_type: string;
  tier: string;
  status: string;
  note: string;
  pos_x: number;
  pos_y: number;
  links: string[];
  catalog_item_id: string | null;
};

type CatalogItem = {
  id: string;
  name: string;
  category: string;
  kind: string;
  description: string;
  install_command: string | null;
  docs_url: string | null;
  verified: boolean;
  tech_stack: string[];
};

const tierAlloy: Record<string, string> = {
  gold: "alloy-gold",
  silver: "alloy-silver",
  bronze: "alloy-bronze",
};

const statusGlow: Record<string, string> = {
  live: "glow-success",
  synced: "glow-eu",
  pending: "glow-cyber",
  critical: "glow-neon",
};

const kindIcon: Record<string, typeof Cpu> = {
  sdk: Terminal,
  docker: Container,
  mcp: Cpu,
};

function snap(value: number) {
  return Math.round(value / GRID) * GRID;
}

export function NodeCanvas() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [view, setView] = useState({ x: 120, y: 80, k: 0.9 });
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );
  const viewRef = useRef(view);
  viewRef.current = view;

  const { data: nodes } = useQuery({
    queryKey: ["canvas-nodes", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<CanvasNode[]> => {
      const { data, error } = await supabase
        .from("canvas_nodes")
        .select("id, title, node_type, tier, status, note, pos_x, pos_y, links, catalog_item_id")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as CanvasNode[];
    },
  });

  const { data: catalog } = useQuery({
    queryKey: ["canvas-catalog"],
    queryFn: async (): Promise<CatalogItem[]> => {
      const { data, error } = await supabase
        .from("catalog_items")
        .select(
          "id, name, category, kind, description, install_command, docs_url, verified, tech_stack",
        )
        .order("name");
      if (error) throw error;
      return (data ?? []) as CatalogItem[];
    },
  });

  const catalogById = useMemo(() => {
    const map = new Map<string, CatalogItem>();
    for (const item of catalog ?? []) map.set(item.id, item);
    return map;
  }, [catalog]);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["canvas-nodes", user?.id] });
    void queryClient.invalidateQueries({ queryKey: ["timeline-events", user?.id] });
  }, [queryClient, user?.id]);

  const addNode = useMutation({
    mutationFn: async (item: CatalogItem) => {
      if (!user) throw new Error("Nicht angemeldet");
      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();
      const centerX = ((rect?.width ?? 900) / 2 - view.x) / view.k - NODE_W / 2;
      const centerY = ((rect?.height ?? 600) / 2 - view.y) / view.k - NODE_H / 2;
      const tier = item.verified ? "gold" : item.kind === "mcp" ? "silver" : "bronze";
      const { error } = await supabase.from("canvas_nodes").insert({
        user_id: user.id,
        catalog_item_id: item.id,
        title: item.name,
        node_type: item.kind,
        tier,
        status: item.verified ? "live" : "pending",
        note: item.description,
        pos_x: snap(centerX + (Math.random() - 0.5) * 120),
        pos_y: snap(centerY + (Math.random() - 0.5) * 120),
      });
      if (error) throw error;
      await logTimelineEvent({
        userId: user.id,
        phase: "DISCOVER",
        label: `Node hinzugefügt: ${item.name}`,
        detail: `${item.category} · ${item.kind}`,
        severity: "info",
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Node auf der Canvas platziert");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const persistPosition = useMutation({
    mutationFn: async (input: { id: string; x: number; y: number }) => {
      const { error } = await supabase
        .from("canvas_nodes")
        .update({ pos_x: input.x, pos_y: input.y })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const syncNode = useMutation({
    mutationFn: async (node: CanvasNode) => {
      if (!user) throw new Error("Nicht angemeldet");
      const next = node.status === "live" ? "synced" : "live";
      const { error } = await supabase
        .from("canvas_nodes")
        .update({ status: next })
        .eq("id", node.id);
      if (error) throw error;
      await logTimelineEvent({
        userId: user.id,
        phase: next === "live" ? "SYNC_COMPLETE" : "VAULT_PUSH",
        label: `${node.title} → ${next}`,
        detail: "Connector-Status aktualisiert",
        severity: next === "live" ? "success" : "warning",
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Connector synchronisiert");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeNode = useMutation({
    mutationFn: async (node: CanvasNode) => {
      if (!user) throw new Error("Nicht angemeldet");
      const { error } = await supabase.from("canvas_nodes").delete().eq("id", node.id);
      if (error) throw error;
      await logTimelineEvent({
        userId: user.id,
        phase: "VALIDATE",
        label: `Node entfernt: ${node.title}`,
        severity: "critical",
      });
    },
    onSuccess: () => {
      invalidate();
      setSelected(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleLink = useMutation({
    mutationFn: async (input: { from: CanvasNode; toId: string }) => {
      const exists = input.from.links.includes(input.toId);
      const links = exists
        ? input.from.links.filter((id) => id !== input.toId)
        : [...input.from.links, input.toId];
      const { error } = await supabase
        .from("canvas_nodes")
        .update({ links })
        .eq("id", input.from.id);
      if (error) throw error;
      return exists;
    },
    onSuccess: (removed) => {
      invalidate();
      toast.success(removed ? "Verbindung getrennt" : "Verbindung hergestellt");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  /* ---------- Zoom (exponential, cursor-anchored) ---------- */
  const wheelRef = useRef<(event: WheelEvent) => void>(() => {});
  wheelRef.current = (event: WheelEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const dy = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
    const current = viewRef.current;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.k * Math.exp(-dy * 0.0015)));
    const ratio = next / current.k;
    setView({
      k: next,
      x: px - (px - current.x) * ratio,
      y: py - (py - current.y) * ratio,
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (event: WheelEvent) => {
      event.preventDefault();
      wheelRef.current(event);
    };
    container.addEventListener("wheel", handler, { passive: false });
    return () => container.removeEventListener("wheel", handler);
  }, []);

  function zoomAtCenter(factor: number) {
    const container = containerRef.current;
    const rect = container?.getBoundingClientRect();
    const px = (rect?.width ?? 900) / 2;
    const py = (rect?.height ?? 600) / 2;
    setView((current) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.k * factor));
      const ratio = next / current.k;
      return { k: next, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio };
    });
  }

  /* ---------- Pan & node drag ---------- */
  function onBackgroundPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const pan = panRef.current;
    if (pan) {
      setView((current) => ({
        ...current,
        x: pan.originX + (event.clientX - pan.startX),
        y: pan.originY + (event.clientY - pan.startY),
      }));
      return;
    }
    if (drag) {
      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();
      if (!rect) return;
      const worldX = (event.clientX - rect.left - view.x) / view.k - drag.dx;
      const worldY = (event.clientY - rect.top - view.y) / view.k - drag.dy;
      setLocalPositions((prev) => ({ ...prev, [drag.id]: { x: worldX, y: worldY } }));
    }
  }

  function onPointerUp() {
    panRef.current = null;
    if (drag) {
      const pos = localPositions[drag.id];
      if (pos) {
        const x = snap(pos.x);
        const y = snap(pos.y);
        setLocalPositions((prev) => ({ ...prev, [drag.id]: { x, y } }));
        persistPosition.mutate({ id: drag.id, x, y });
      }
      setDrag(null);
    }
  }

  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>({});

  function positionOf(node: CanvasNode) {
    return localPositions[node.id] ?? { x: node.pos_x, y: node.pos_y };
  }

  const edges = useMemo(() => {
    const byId = new Map((nodes ?? []).map((n) => [n.id, n] as const));
    const result: { id: string; d: string }[] = [];
    for (const node of nodes ?? []) {
      for (const targetId of node.links ?? []) {
        const target = byId.get(targetId);
        if (!target) continue;
        const a = positionOf(node);
        const b = positionOf(target);
        const sx = a.x + NODE_W;
        const sy = a.y + NODE_H / 2;
        const ex = b.x;
        const ey = b.y + NODE_H / 2;
        const dx = Math.max(60, Math.abs(ex - sx) * 0.5);
        result.push({
          id: `${node.id}-${targetId}`,
          d: `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}`,
        });
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, localPositions]);

  const selectedNode = (nodes ?? []).find((n) => n.id === selected) ?? null;

  return (
    <div className="relative h-[calc(100vh-8.5rem)] w-full overflow-hidden">
      <div
        ref={containerRef}
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      >
        <div
          className="absolute left-0 top-0"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <svg
            className="pointer-events-none absolute left-0 top-0"
            width={4000}
            height={4000}
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="edge-alloy" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--eu)" />
                <stop offset="50%" stopColor="var(--vivid)" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
            </defs>
            {edges.map((edge) => (
              <g key={edge.id}>
                <path
                  id={`path-${edge.id}`}
                  d={edge.d}
                  fill="none"
                  stroke="url(#edge-alloy)"
                  strokeWidth={2}
                  opacity={0.75}
                />
                <path
                  d={edge.d}
                  fill="none"
                  stroke="var(--vivid)"
                  strokeWidth={2}
                  className="flow-line motion-heavy"
                  opacity={0.9}
                />
                <circle r={3.5} fill="var(--gold)" className="motion-heavy">
                  <animateMotion dur="3.6s" repeatCount="indefinite" path={edge.d} />
                </circle>
              </g>
            ))}
          </svg>

          {(nodes ?? []).map((node) => {
            const pos = positionOf(node);
            const item = node.catalog_item_id ? catalogById.get(node.catalog_item_id) : undefined;
            const Icon = kindIcon[node.node_type] ?? Cpu;
            return (
              <article
                key={node.id}
                onPointerDown={(event) => event.stopPropagation()}
                className={cn(
                  "glass-panel prism-edge tilt-3d neon-trace absolute select-none",
                  statusGlow[node.status] ?? "glow-eu",
                  selected === node.id && "ring-2 ring-primary",
                )}
                style={{ left: pos.x, top: pos.y, width: NODE_W }}
              >
                <header
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setSelected(node.id);
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const worldX = (event.clientX - rect.left - view.x) / view.k;
                    const worldY = (event.clientY - rect.top - view.y) / view.k;
                    setDrag({ id: node.id, dx: worldX - pos.x, dy: worldY - pos.y });
                    (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
                  }}
                  className="flex cursor-grab items-center justify-between gap-2 border-b border-border px-3 py-2 active:cursor-grabbing"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate font-mono text-[11px] font-semibold uppercase tracking-wider">
                      {node.title}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase",
                      tierAlloy[node.tier] ?? "alloy-bronze",
                    )}
                  >
                    {node.tier}
                  </span>
                </header>

                <div className="space-y-2 px-3 py-2.5">
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {node.note || item?.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded border border-border bg-background/40 px-2 py-1">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        Status
                      </p>
                      <p className="font-mono text-[11px] text-foreground">{node.status}</p>
                    </div>
                    <div className="rounded border border-border bg-background/40 px-2 py-1">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        Stack
                      </p>
                      <p className="truncate font-mono text-[11px] text-foreground">
                        {item?.tech_stack?.[0] ?? node.node_type}
                      </p>
                    </div>
                  </div>
                  {item?.install_command ? (
                    <code className="block truncate rounded border border-border bg-background/60 px-2 py-1 font-mono text-[10px] text-primary">
                      {item.install_command}
                    </code>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="glass-click h-6 gap-1 font-mono text-[10px]"
                      onClick={() => syncNode.mutate(node)}
                    >
                      <RefreshCw className="h-3 w-3" /> Sync
                    </Button>
                    {selected && selected !== node.id ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="glass-click h-6 gap-1 font-mono text-[10px]"
                        onClick={() => {
                          const from = (nodes ?? []).find((n) => n.id === selected);
                          if (from) toggleLink.mutate({ from, toId: node.id });
                        }}
                      >
                        <Link2 className="h-3 w-3" /> Verbinden
                      </Button>
                    ) : null}
                    {item?.docs_url ? (
                      <a
                        href={item.docs_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[10px] text-primary underline-offset-2 hover:underline"
                      >
                        Docs
                      </a>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="glass-click ml-auto h-6 w-6 p-0"
                      aria-label="Node entfernen"
                      onClick={() => removeNode.mutate(node)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Blueprint overlay */}
      <div className="glass-panel pointer-events-none absolute left-4 top-4 max-w-xs px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Infinite Node Field
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          X {Math.round(-view.x / view.k)} · Y {Math.round(-view.y / view.k)} · ZOOM{" "}
          {Math.round(view.k * 100)}%
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          {(nodes ?? []).length} Nodes · {edges.length} Verbindungen
        </p>
        {selectedNode ? (
          <p className="mt-1 font-mono text-[10px] text-foreground">
            Aktiv: {selectedNode.title} — Ziel-Node anklicken zum Verbinden
          </p>
        ) : null}
      </div>

      {/* HUD */}
      <div className="glass-panel absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2">
        <span className="font-mono text-[11px] text-muted-foreground">
          {Math.round(view.k * 100)}%
        </span>
        <Button
          size="sm"
          variant="outline"
          className="glass-click h-7 w-7 p-0"
          aria-label="Verkleinern"
          onClick={() => zoomAtCenter(1 / 1.2)}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="glass-click h-7 w-7 p-0"
          aria-label="Vergrößern"
          onClick={() => zoomAtCenter(1.2)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="glass-click h-7 gap-1 font-mono text-[10px]"
          onClick={() => setView({ x: 120, y: 80, k: 0.9 })}
        >
          <Crosshair className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      {/* Node palette */}
      <div className="glass-panel absolute right-4 top-4 w-64 overflow-hidden">
        <p className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          Node hinzufügen
        </p>
        <div className="max-h-72 overflow-y-auto p-2">
          {(catalog ?? []).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addNode.mutate(item)}
              className="glass-click flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-accent"
            >
              {item.verified ? (
                <ShieldCheck className="h-3 w-3 shrink-0 text-success" />
              ) : (
                <span className="h-3 w-3 shrink-0 rounded-full border border-border" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[11px]">{item.name}</span>
                <span className="block truncate font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  {item.category}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
