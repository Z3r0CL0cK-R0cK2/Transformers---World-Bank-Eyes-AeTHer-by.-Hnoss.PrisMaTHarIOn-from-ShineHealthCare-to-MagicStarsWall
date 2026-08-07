import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Container, KeyRound, Server } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { PortalShell, SectionHeader } from "@/components/portal/portal-shell";
import { CodeBlock } from "@/components/portal/code-block";
import { Button } from "@/components/ui/button";
import { bootstrapperScript } from "@/components/portal/nav-config";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Get Started — One-Click Setup" },
      {
        name: "description",
        content:
          "Registrierung, Install-Skripte, Docker-Compose und MCP-Konfiguration: die komplette lokale Umgebung in einem Befehl.",
      },
      { property: "og:title", content: "Get Started — One-Click Setup" },
      {
        property: "og:description",
        content: "Install-Skripte, Docker-Compose und MCP-Konfiguration in einem Befehl.",
      },
    ],
  }),
  component: StartPage,
});

const mcpConfig = `{
  "mcpServers": {
    "oneclick": {
      "command": "npx",
      "args": ["-y", "@oneclick/mcp-server"],
      "env": { "ONECLICK_API_KEY": "pk_live_…" }
    }
  }
}`;

const compose = `services:
  gateway:
    image: ghcr.io/oneclick/gateway:latest
    ports: ["8080:8080"]
    environment:
      ONECLICK_API_KEY: \${ONECLICK_API_KEY}
  mcp:
    image: ghcr.io/oneclick/mcp-server:latest
    depends_on: [gateway]
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes: ["pgdata:/var/lib/postgresql/data"]

volumes:
  pgdata:`;

function StartPage() {
  const { user } = useSession();

  const { data: dockerItems } = useQuery({
    queryKey: ["docker-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_items")
        .select("id, name, description, docker_compose, install_command")
        .eq("kind", "docker")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <PortalShell>
      <div className="mx-auto max-w-4xl space-y-12">
        <SectionHeader
          id="registrierung"
          eyebrow="Get Started"
          title="One-Click Registrierung & Identity Gateway"
          description="Login über Google oder E-Mail. Beim ersten Login wird ein Zero-Trust API-Token mit minimalen Scopes erzeugt — nichts muss manuell konfiguriert werden."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Step n={1} title="Identität verknüpfen" done={Boolean(user)}>
            OAuth oder E-Mail — kein Formular-Marathon.
          </Step>
          <Step n={2} title="Token erzeugen" done={false}>
            Scoped API-Key im Developer Hub anlegen.
          </Step>
          <Step n={3} title="Stack starten" done={false}>
            Installer ausführen, Services laufen lokal.
          </Step>
        </div>

        {user ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-success/40 bg-success/10 p-4">
            <p className="min-w-0 font-mono text-xs text-success">
              Angemeldet als {user.email} — bereit für den API-Key.
            </p>
            <Button asChild size="sm" className="font-mono text-xs">
              <Link to="/developer">API-Key erzeugen</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4">
            <p className="min-w-0 text-xs text-muted-foreground">
              Noch nicht angemeldet — Registrierung dauert unter 30 Sekunden.
            </p>
            <Button asChild size="sm" className="gap-1.5 font-mono text-xs">
              <Link to="/auth">
                <KeyRound className="h-3.5 w-3.5" /> Jetzt registrieren
              </Link>
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <SectionHeader
            id="skripte"
            eyebrow="Quick Install"
            title="Multi-Service Auto-Installer"
            description="Prüft Docker, legt den Workspace an, schreibt die MCP-Konfiguration und startet alle Services."
          />
          <CodeBlock label="bash" code={bootstrapperScript} />
          <div className="grid gap-3 sm:grid-cols-2">
            <CodeBlock
              label="nur MCP"
              code={`curl -fsSL https://get.your-platform.io/install.sh | bash -s -- --with-mcp`}
            />
            <CodeBlock
              label="nur Docker"
              code={`curl -fsSL https://get.your-platform.io/install.sh | bash -s -- --with-docker`}
            />
          </div>
          <CodeBlock label="mcp.json" code={mcpConfig} />
        </div>

        <div className="space-y-4">
          <SectionHeader
            id="docker"
            eyebrow="Container"
            title="Docker Templates"
            description="Produktionsnahe Compose-Dateien für Gateway, MCP-Server und Datenbank."
          />
          <CodeBlock label="docker-compose.yml" code={compose} />

          <div className="grid gap-3 md:grid-cols-2">
            {(dockerItems ?? []).map((item) => (
              <div key={item.id} className="rounded-md border border-border bg-card p-4">
                <h3 className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                  <Container className="h-3.5 w-3.5 text-primary" /> {item.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                {item.install_command ? (
                  <pre className="mt-2.5 overflow-x-auto rounded border border-border bg-background px-2.5 py-2 font-mono text-[11px] text-muted-foreground">
                    {item.install_command}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-5">
          <p className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <Server className="h-3.5 w-3.5 shrink-0 text-primary" />
            MCP-Server-Katalog für KI-Agenten findest du im Developer Hub.
          </p>
          <Button asChild size="sm" variant="outline" className="font-mono text-xs">
            <Link to="/developer">MCP Tools ansehen</Link>
          </Button>
        </div>
      </div>
    </PortalShell>
  );
}

function Step({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span
          className={
            done
              ? "grid h-5 w-5 place-items-center rounded-full bg-success text-background"
              : "grid h-5 w-5 place-items-center rounded-full border border-border font-mono text-[10px] text-muted-foreground"
          }
        >
          {done ? <Check className="h-3 w-3" /> : n}
        </span>
        <h3 className="font-mono text-xs font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
