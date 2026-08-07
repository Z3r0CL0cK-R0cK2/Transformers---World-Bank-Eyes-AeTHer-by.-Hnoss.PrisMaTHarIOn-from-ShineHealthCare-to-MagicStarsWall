import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { GitBranch, Loader2, Rocket, Server } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { linkRepository, runDeployment } from "@/lib/portal.functions";
import { PortalShell, SectionHeader } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/deploy")({
  head: () => ({
    meta: [
      { title: "Code & Deploy — Repositories & Rollouts" },
      {
        name: "description",
        content:
          "Repositories verknüpfen, CI/CD-Runner beobachten und Deployments für Preview, Staging und Produktion auslösen.",
      },
      { property: "og:title", content: "Code & Deploy — Repositories & Rollouts" },
      {
        property: "og:description",
        content: "Repository-Import, Runner-Status und One-Click Deployments.",
      },
    ],
  }),
  component: DeployPage,
});

const environments = ["preview", "staging", "production"] as const;

function DeployPage() {
  const qc = useQueryClient();
  const link = useServerFn(linkRepository);
  const deploy = useServerFn(runDeployment);
  const [url, setUrl] = useState("https://github.com/");
  const [provider, setProvider] = useState<"github" | "gitlab">("github");

  const repos = useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repositories")
        .select("id, full_name, provider, url, default_branch")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deployments = useQuery({
    queryKey: ["deployments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deployments")
        .select("id, environment, status, commit_sha, log, created_at, repository_id")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const linkMutation = useMutation({
    mutationFn: () => link({ data: { provider, url } }),
    onSuccess: () => {
      toast.success("Repository verknüpft.");
      setUrl("https://github.com/");
      qc.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deployMutation = useMutation({
    mutationFn: (input: { repository_id: string; environment: (typeof environments)[number] }) =>
      deploy({ data: input }),
    onSuccess: () => {
      toast.success("Deployment abgeschlossen.");
      qc.invalidateQueries({ queryKey: ["deployments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PortalShell>
      <div className="mx-auto max-w-4xl space-y-12">
        <SectionHeader
          id="repos"
          eyebrow="Code & Deploy"
          title="Repositories"
          description="GitHub- oder GitLab-Repository verknüpfen — der Runner erkennt Stack und Build-Befehl automatisch."
        />

        <div className="rounded-md border border-border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label className="font-mono text-[11px]">Provider</Label>
              <div className="flex gap-1.5">
                {(["github", "gitlab"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={
                      provider === p
                        ? "rounded-md border border-primary bg-primary/15 px-2.5 py-1.5 font-mono text-[11px] text-primary"
                        : "rounded-md border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground"
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="repo-url" className="font-mono text-[11px]">
                Repository-URL
              </Label>
              <Input
                id="repo-url"
                value={url}
                maxLength={200}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <Button
              size="sm"
              disabled={linkMutation.isPending}
              onClick={() => linkMutation.mutate()}
              className="gap-1.5 font-mono text-xs"
            >
              {linkMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <GitBranch className="h-3.5 w-3.5" />
              )}
              Verknüpfen
            </Button>
          </div>
        </div>

        <div id="deploy" className="scroll-mt-32 space-y-3">
          {(repos.data ?? []).length === 0 ? (
            <p className="rounded-md border border-border bg-card p-6 text-center font-mono text-xs text-muted-foreground">
              Noch kein Repository verknüpft.
            </p>
          ) : (
            (repos.data ?? []).map((repo) => (
              <div key={repo.id} className="rounded-md border border-border bg-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold">{repo.full_name}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                      {repo.provider} · {repo.default_branch}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {environments.map((env) => (
                      <Button
                        key={env}
                        size="sm"
                        variant={env === "production" ? "default" : "outline"}
                        disabled={deployMutation.isPending}
                        onClick={() =>
                          deployMutation.mutate({ repository_id: repo.id, environment: env })
                        }
                        className="gap-1 font-mono text-[11px]"
                      >
                        <Rocket className="h-3 w-3" /> {env}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div id="runner" className="scroll-mt-32 space-y-4">
          <SectionHeader
            eyebrow="CI/CD"
            title="Runner & Deployment-Historie"
            description="Build-Logs der letzten Rollouts inklusive Commit-SHA und Zielumgebung."
          />
          <div className="flex flex-wrap gap-2">
            {["runner-eu-1", "runner-eu-2", "runner-us-1"].map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground"
              >
                <Server className="h-3 w-3 text-success" /> {r} · idle
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {(deployments.data ?? []).length === 0 ? (
              <p className="rounded-md border border-border bg-card p-6 text-center font-mono text-xs text-muted-foreground">
                Noch keine Deployments.
              </p>
            ) : (
              (deployments.data ?? []).map((d) => (
                <details key={d.id} className="rounded-md border border-border bg-card p-4">
                  <summary className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span className="min-w-0 truncate font-mono text-xs">
                      {d.environment} · {d.commit_sha}
                    </span>
                    <Badge className="shrink-0 bg-success/15 font-mono text-[10px] text-success">
                      {d.status}
                    </Badge>
                  </summary>
                  <pre className="mt-3 overflow-x-auto rounded border border-border bg-background px-2.5 py-2 font-mono text-[11px] text-muted-foreground">
                    {d.log}
                  </pre>
                </details>
              ))
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
