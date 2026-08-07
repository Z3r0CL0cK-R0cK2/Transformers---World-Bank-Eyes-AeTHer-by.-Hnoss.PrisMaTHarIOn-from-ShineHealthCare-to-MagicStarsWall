import type { ReactNode } from "react";
import { TopBar } from "./top-bar";
import { ContextSidebar } from "./context-sidebar";
import { BlueprintBackground } from "./blueprint-background";
import { TimelineEngine } from "./timeline-engine";

export function PortalShell({
  children,
  withSidebar = true,
  fullBleed = false,
}: {
  children: ReactNode;
  withSidebar?: boolean;
  fullBleed?: boolean;
}) {
  return (
    <div className="min-h-screen font-sans text-foreground">
      <BlueprintBackground />
      <TopBar />
      <div className="flex w-full">
        {withSidebar ? <ContextSidebar /> : null}
        <main
          className={
            fullBleed ? "min-w-0 flex-1 pb-11" : "min-w-0 flex-1 px-4 py-6 pb-16 lg:px-8"
          }
        >
          {children}
        </main>
      </div>
      <TimelineEngine />
    </div>
  );
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div id={id} className="scroll-mt-32">
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-alloy">{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
