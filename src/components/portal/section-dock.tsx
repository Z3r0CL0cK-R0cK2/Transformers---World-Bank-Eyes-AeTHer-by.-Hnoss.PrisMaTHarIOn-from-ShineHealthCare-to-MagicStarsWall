import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { navSections } from "./nav-config";
import { cn } from "@/lib/utils";

const DOCK = [
  ...navSections.slice(0, 3).map((s) => ({ to: s.to, label: s.label, icon: s.icon })),
  { to: "/blueprints", label: "Blueprints", icon: LayoutGrid },
  ...navSections.slice(3).map((s) => ({ to: s.to, label: s.label, icon: s.icon })),
];

export function SectionDock({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div
      className={cn(
        "glass-panel prism-edge mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-1 p-1.5",
        className,
      )}
    >
      {DOCK.map((item) => {
        const active = pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "group flex min-w-[6.5rem] flex-1 flex-col items-center gap-2 rounded-md px-3 py-3 text-center transition-colors",
              active
                ? "bg-[color-mix(in_oklab,var(--eu)_28%,transparent)] text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <item.icon
              className={cn("h-5 w-5", active ? "text-[oklch(0.72_0.15_265)]" : "text-primary")}
            />
            <span className="text-[11px] font-medium leading-tight">{item.label}</span>
            <span
              className={cn(
                "h-1 w-1 rounded-full",
                active ? "bg-[oklch(0.72_0.15_265)]" : "bg-primary/70",
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
