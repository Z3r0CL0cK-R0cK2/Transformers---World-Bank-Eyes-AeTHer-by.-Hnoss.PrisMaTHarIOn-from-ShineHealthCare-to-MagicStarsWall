import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Activity,
  Sparkles,
  Network,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { navSections } from "./nav-config";
import { useMotionLevel, motionLabels } from "@/hooks/use-motion-level";
import { cn } from "@/lib/utils";

export function TopBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSession();
  const { level, cycle } = useMotionLevel();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data: catalog } = useQuery({
    queryKey: ["catalog-search"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_items")
        .select("slug, name, category, kind")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, { slug: string; name: string }[]>();
    for (const item of catalog ?? []) {
      const list = map.get(item.category) ?? [];
      list.push({ slug: item.slug, name: item.name });
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, [catalog]);

  const { data: badge } = useQuery({
    queryKey: ["own-badge", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("badges")
        .select("label")
        .eq("badge_type", "verified_isv")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="glass-bar sticky top-0 z-40 border-b border-border">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-primary/60 bg-primary/10 font-mono text-sm font-bold text-primary shadow-[0_0_22px_-6px_var(--vivid)]">
              1C
            </div>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-bold tracking-[0.06em]">ONECLICK</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Titanium Control Plane
              </span>
            </span>
          </Link>

          <span className="hidden items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground 2xl:inline-flex">
            <span className="dot-live" />
            Alle Systeme betriebsbereit
          </span>

        </div>

        <div className="hidden justify-center lg:flex">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="glass-panel prism-edge flex w-full max-w-md items-center gap-2 px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate">SDKs, APIs, MCP-Server, Docker-Images …</span>
            <kbd className="shrink-0 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground lg:hidden"
            aria-label="Suche öffnen"
          >
            <Search className="h-4 w-4" />
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={cycle}
            title="Animationsstufe umschalten"
            className="glass-click hidden gap-1.5 font-mono text-[10px] md:inline-flex"
          >
            <Sparkles className="h-3 w-3 text-primary" /> {motionLabels[level]}
          </Button>
          {badge ? (
            <span className="stamp-in hidden items-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-2 py-1 font-mono text-[10px] text-success sm:inline-flex">
              <ShieldCheck className="h-3 w-3" /> {badge.label}
            </span>
          ) : null}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="glass-click gap-1.5 font-mono text-xs">
                  <span className="grid h-4 w-4 place-items-center rounded-sm bg-primary/20 text-[9px] text-primary">
                    {(user.email ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-28 truncate sm:inline">{user.email}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-mono text-xs">
                  Workspace: default
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/canvas" className="gap-2">
                    <Network className="h-3.5 w-3.5" /> Infinite Canvas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/developer" className="gap-2">
                    <UserIcon className="h-3.5 w-3.5" /> Developer Hub
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/deploy" className="gap-2">
                    <Activity className="h-3.5 w-3.5" /> Deployments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="gap-2">
                  <LogOut className="h-3.5 w-3.5" /> Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="glass-click font-mono text-xs">
              <Link to="/auth">Anmelden</Link>
            </Button>
          )}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-1">
        {navSections.map((section) => {
          const active = pathname.startsWith(section.to);
          return (
            <Link
              key={section.to}
              to={section.to}
              className={cn(
                "glass-click flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-xs transition-colors",
                active
                  ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--vivid)_45%,transparent)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <section.icon className="h-3.5 w-3.5" />
              {section.label}
            </Link>
          );
        })}
      </nav>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Suche nach SDKs, MCP-Servern, Docker-Images …" />
        <CommandList>
          <CommandEmpty>Keine Treffer.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navSections.map((s) => (
              <CommandItem
                key={s.to}
                value={s.label}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: s.to });
                }}
              >
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {grouped.map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.slug}
                  value={`${item.name} ${category}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate({ to: "/entdecken", search: { q: item.name } });
                  }}
                >
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
