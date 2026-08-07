import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Container, ShieldCheck, Terminal, Zap } from "lucide-react";
import { TopBar } from "@/components/portal/top-bar";
import { BlueprintBackground } from "@/components/portal/blueprint-background";
import { CodeBlock } from "@/components/portal/code-block";
import { Button } from "@/components/ui/button";
import { bootstrapperScript, navSections } from "@/components/portal/nav-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "oneclick.platform — Developer & Partner Control Plane" },
      {
        name: "description",
        content:
          "Zentrale Control Plane für Entwickler, ISVs und Enterprise-Partner: One-Click-Setup, SDKs, MCP-Katalog, Zertifizierung und Deployments.",
      },
      { property: "og:title", content: "oneclick.platform — Developer & Partner Control Plane" },
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
        <section className="border-b border-border px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <span className="glass-panel prism-edge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
              <Zap className="h-3 w-3" /> Titanium One-Click Control Plane
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Eine Oberfläche für den ganzen Lifecycle — von der Recherche bis zum
              <span className="text-alloy"> Live-Deployment</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Verifizierte SDKs, fertige Docker-Templates, ein nativer MCP-Katalog für KI-Agenten,
              automatisierte ISV-Zertifizierung mit einbettbaren Badges und Deployments in einem
              Klick — verdrahtet auf einer unendlichen Node-Canvas.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="glass-click gap-1.5 font-mono text-xs">
                <Link to="/auth">
                  In 30 Sekunden starten <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="glass-click font-mono text-xs">
                <Link to="/entdecken">Ökosystem durchsuchen</Link>
              </Button>
            </div>

            <div className="mt-10 max-w-3xl">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Universal Bootstrapper
              </p>
              <div className="glass-panel prism-edge specular-sweep overflow-hidden">
                <CodeBlock label="bash" code={bootstrapperScript} />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {navSections.map((section) => (
              <Link
                key={section.to}
                to={section.to}
                className="glass-panel prism-edge tilt-3d neon-trace group p-4"
              >
                <section.icon className="h-4 w-4 text-primary" />
                <h3 className="mt-3 font-mono text-xs font-semibold">{section.label}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {section.focus}
                </p>
              </Link>
            ))}
          </div>
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
