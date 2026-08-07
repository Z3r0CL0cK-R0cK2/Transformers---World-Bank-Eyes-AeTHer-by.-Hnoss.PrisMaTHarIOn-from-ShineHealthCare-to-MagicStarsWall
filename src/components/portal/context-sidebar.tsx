import { Link, useRouterState } from "@tanstack/react-router";
import { navSections } from "./nav-config";
import { cn } from "@/lib/utils";

export function ContextSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const section = navSections.find((s) => pathname.startsWith(s.to)) ?? navSections[0]!;


  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar/70 backdrop-blur-xl lg:block">
      <div className="sticky top-[104px] p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Kontext
        </p>
        <h2 className="iris-in mt-1 text-sm font-semibold text-sidebar-foreground">
          {section.label}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{section.focus}</p>

        <nav className="mt-5 space-y-1">
          {section.sub.map((item) => (
            <a
              key={item.label}
              href={`#${item.hash}`}
              className="glass-click flex items-start gap-2.5 rounded-md px-2 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              <item.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium">{item.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </a>
          ))}
        </nav>

        <div className="glass-panel prism-edge mt-6 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Weitere Bereiche
          </p>
          <div className="mt-2 space-y-1">
            {navSections
              .filter((s) => s.to !== section.to)
              .map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className={cn(
                    "flex items-center gap-2 rounded px-1.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground",
                  )}
                >
                  <s.icon className="h-3 w-3" />
                  {s.label}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
