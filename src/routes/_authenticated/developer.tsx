import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BookOpen, Copy, KeyRound, Loader2, Server, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createApiKey, revokeApiKey } from "@/lib/portal.functions";
import { PortalShell, SectionHeader } from "@/components/portal/portal-shell";
import { CodeBlock } from "@/components/portal/code-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/developer")({
  head: () => ({
    meta: [
      { title: "Developer Hub — API-Keys, SDKs & MCP" },
      {
        name: "description",
        content:
          "Zero-Trust API-Schlüssel verwalten, SDKs einbinden, API-Referenz lesen und MCP-Server für KI-Agenten registrieren.",
      },
      { property: "og:title", content: "Developer Hub — API-Keys, SDKs & MCP" },
      {
        property: "og:description",
        content: "API-Schlüssel, SDK-Snippets, API-Referenz und MCP-Server an einem Ort.",
      },
    ],
  }),
  component: DeveloperHub,
});

const scopeOptions = ["read", "write", "deploy"] as const;

function DeveloperHub() {
  const qc = useQueryClient();
  const create = useServerFn(createApiKey);
  const revoke = useServerFn(revokeApiKey);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const [issued, setIssued] = useState<string | null>(null);

  const keys = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix, scopes, revoked, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const catalog = useQuery({
    queryKey: ["dev-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_items")
        .select("id, name, description, kind, install_command, mcp_config, docs_url, tech_stack")
        .in("kind", ["sdk", "mcp", "framework"])
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; scopes: string[] }) =>
      create({ data: { name: input.name, scopes: input.scopes as ("read" | "write" | "deploy")[] } }),
    onSuccess: (result) => {
      setIssued(result.token);
      setName("");
      toast.success("API-Key erstellt — Token nur jetzt sichtbar.");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: () => {
      toast.success("Key widerrufen.");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sdks = (catalog.data ?? []).filter((i) => i.kind !== "mcp");
  const mcps = (catalog.data ?? []).filter((i) => i.kind === "mcp");

  return (
    <PortalShell>
      <div className="mx-auto max-w-4xl space-y-12">
        <SectionHeader
          id="keys"
          eyebrow="Developer Hub"
          title="API-Schlüssel"
          description="Scoped Zero-Trust Token. Der Klartext wird nur einmal angezeigt — anschließend ist ausschließlich der Hash gespeichert."
        />

        <div className="rounded-md border border-border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="key-name" className="font-mono text-[11px]">
                Bezeichnung
              </Label>
              <Input
                id="key-name"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. ci-runner"
                className="font-mono text-xs"
              />
            </div>
            <Button
              size="sm"
              disabled={createMutation.isPending || name.trim().length === 0 || scopes.length === 0}
              onClick={() => createMutation.mutate({ name, scopes })}
              className="gap-1.5 font-mono text-xs"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <KeyRound className="h-3.5 w-3.5" />
              )}
              Key erzeugen
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {scopeOptions.map((scope) => {
              const active = scopes.includes(scope);
              return (
                <button
                  key={scope}
                  type="button"
                  onClick={() =>
                    setScopes((prev) =>
                      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
                    )
                  }
                  className={
                    active
                      ? "rounded-full border border-primary bg-primary/15 px-2.5 py-1 font-mono text-[11px] text-primary"
                      : "rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                  }
                >
                  {scope}
                </button>
              );
            })}
          </div>

          {issued ? (
            <div className="mt-4 rounded-md border border-warning/40 bg-warning/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-warning">
                Einmalig sichtbar
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate font-mono text-xs">{issued}</code>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5 font-mono text-[11px]"
                  onClick={() => {
                    void navigator.clipboard.writeText(issued);
                    toast.success("Kopiert.");
                  }}
                >
                  <Copy className="h-3 w-3" /> Kopieren
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          {keys.isLoading ? (
            <p className="font-mono text-xs text-muted-foreground">lade Keys …</p>
          ) : (keys.data ?? []).length === 0 ? (
            <p className="rounded-md border border-border bg-card p-6 text-center font-mono text-xs text-muted-foreground">
              Noch kein API-Key vorhanden.
            </p>
          ) : (
            (keys.data ?? []).map((key) => (
              <div
                key={key.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-semibold">{key.name}</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {key.key_prefix}… · {(key.scopes ?? []).join(", ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {key.revoked ? (
                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                      widerrufen
                    </Badge>
                  ) : (
                    <Badge className="bg-success/15 font-mono text-[10px] text-success">aktiv</Badge>
                  )}
                  {!key.revoked ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label="Key widerrufen"
                      onClick={() => revokeMutation.mutate(key.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <SectionHeader
            id="sdks"
            eyebrow="Integration"
            title="SDKs & Frameworks"
            description="Offizielle Clients für die Control-Plane-API."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {sdks.map((item) => (
              <div key={item.id} className="rounded-md border border-border bg-card p-4">
                <h3 className="font-mono text-xs font-semibold">{item.name}</h3>
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

        <div className="space-y-4">
          <SectionHeader
            id="api"
            eyebrow="Referenz"
            title="API-Referenz"
            description="Alle Endpunkte sind REST/JSON und erwarten den Bearer-Token aus dem Abschnitt oben."
          />
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="px-3 py-2">Methode</th>
                  <th className="px-3 py-2">Pfad</th>
                  <th className="px-3 py-2">Scope</th>
                  <th className="px-3 py-2">Beschreibung</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["GET", "/v1/catalog", "read", "Katalog-Einträge auflisten"],
                  ["GET", "/v1/repositories", "read", "Verknüpfte Repositories"],
                  ["POST", "/v1/deployments", "deploy", "Deployment auslösen"],
                  ["GET", "/v1/badges/:slug.svg", "public", "Badge als SVG"],
                  ["POST", "/v1/mcp/tools", "write", "MCP-Tool registrieren"],
                ].map((row) => (
                  <tr key={row[1]} className="border-t border-border">
                    <td className="px-3 py-2 text-primary">{row[0]}</td>
                    <td className="px-3 py-2">{row[1]}</td>
                    <td className="px-3 py-2">{row[2]}</td>
                    <td className="px-3 py-2">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CodeBlock
            label="curl"
            code={`curl https://api.your-platform.io/v1/catalog \\
  -H "Authorization: Bearer pk_live_…"`}
          />
        </div>

        <div className="space-y-4">
          <SectionHeader
            id="mcp"
            eyebrow="Model Context Protocol"
            title="MCP Tools"
            description="Kontext-Server, die KI-Agenten direkt an die Plattform anbinden."
          />
          <div className="space-y-3">
            {mcps.map((item) => (
              <div key={item.id} className="rounded-md border border-border bg-card p-4">
                <h3 className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                  <Server className="h-3.5 w-3.5 text-primary" /> {item.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                {item.mcp_config ? (
                  <pre className="mt-2.5 overflow-x-auto rounded border border-border bg-background px-2.5 py-2 font-mono text-[11px] text-muted-foreground">
                    {JSON.stringify(item.mcp_config, null, 2)}
                  </pre>
                ) : null}
                {item.docs_url ? (
                  <a
                    href={item.docs_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-primary hover:underline"
                  >
                    <BookOpen className="h-3 w-3" /> Dokumentation
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
