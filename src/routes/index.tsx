import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Container, LayoutGrid, ShieldCheck, Terminal, Zap } from "lucide-react";
import { TopBar } from "@/components/portal/top-bar";
import { BlueprintBackground } from "@/components/portal/blueprint-background";
import { BootstrapTerminal } from "@/components/portal/bootstrap-terminal";
import { SectionDock } from "@/components/portal/section-dock";
import { StatusNodes } from "@/components/portal/status-nodes";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "oneclick.platform — Titanium Control Plane" },
      {
        name: "description",
        content:
          "Zentrale Control Plane für Entwickler, ISVs und Enterprise-Partner: One-Click-Setup, SDKs, MCP-Katalog, Zertifizierung und Deployments.",
      },
      { property: "og:title", content: "oneclick.platform — Titanium Control Plane" },
      {
        property: "og:description",
        content:
          "One-Click-Registrierung, Install-Skripte, MCP-Katalog, ISV-Zertifizierung und Deployments in einer Oberfläche.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen font-sans text-foreground">
      <BlueprintBackground />
      <TopBar />
      <main>
        <section className="relative overflow-hidden border-b border-border px-4 pb-10 pt-16 lg:px-8">
          <StatusNodes />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="glass-panel prism-edge inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              <Zap className="h-3 w-3" /> Titanium One-Click Control Plane
            </span>

            <h1 className="mt-6 text-balance text-[2.85rem] font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.15rem]">
              Der gesamte Lifecycle.
              <br />
              In einer Oberfläche.
            </h1>

            <p className="mt-3 text-[1.6rem] font-bold tracking-tight sm:text-[2.05rem]">
              <span className="text-foreground">Von der </span>
              <span className="text-[oklch(0.74_0.17_265)]">Recherche</span>
              <span className="text-foreground"> bis zum </span>
              <span className="text-primary">Deployment.</span>
            </p>

            <span className="mt-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            </span>

            <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-foreground/75 sm:text-base">
              Entdecke APIs, SDKs, Docker-Images und MCP-Server. Baue deine Infrastruktur, verbinde
              Services und deploye direkt aus einer Oberfläche.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="glass-click gap-1.5 font-mono text-[13px]">
                <Link to="/auth">
                  In 30 Sekunden starten <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="glass-click gap-2 font-mono text-[13px]"
              >
                <Link to="/entdecken">
                  Ökosystem entdecken <LayoutGrid className="h-4 w-4 text-primary" />
                </Link>
              </Button>
            </div>


            <BootstrapTerminal className="mt-10 w-full text-left" />
          </div>
        </section>

        <section className="px-4 py-10 lg:px-8">
          <SectionDock />
        </section>



        <section className="border-t border-border px-4 py-12 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <Feature
              icon={Terminal}
              title="Zero-Trust Token beim ersten Login"
              body="Nach der Registrierung über OAuth oder Passkey wird automatisch ein API-Token mit minimalen Scopes erzeugt — kein manuelles Setup."
            />
            <Feature
              icon={Container}
              title="Docker & MCP in einem Durchlauf"
              body="Ein Installer prüft Docker, legt den Workspace an, schreibt die MCP-Konfiguration und startet die lokalen Services."
            />
            <Feature
              icon={ShieldCheck}
              title="Zertifizierung mit einbettbarem Badge"
              body="Compliance-Check, Statusvergabe und dynamisches SVG-Badge für GitHub-Readmes oder die eigene Website."
            />
          </div>
        </section>

        <section className="border-t border-border px-4 py-12 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-md border border-border bg-card p-6">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Boxes className="h-4 w-4 text-primary" /> Bereit für den ersten Deploy?
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Registrierung, API-Key und Repository-Import in unter zwei Minuten.
              </p>
            </div>
            <Button asChild size="sm" className="font-mono text-xs">
              <Link to="/auth">Konto anlegen</Link>
            </Button>
          </div>
        </section>

        <footer className="border-t border-border px-4 py-6 lg:px-8">
          <p className="mx-auto max-w-5xl font-mono text-[11px] text-muted-foreground">
            oneclick.platform — Developer & Partner Control Plane
          </p>
        </footer>
      </main>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Terminal;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="grid h-8 w-8 place-items-center rounded border border-border bg-card">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
