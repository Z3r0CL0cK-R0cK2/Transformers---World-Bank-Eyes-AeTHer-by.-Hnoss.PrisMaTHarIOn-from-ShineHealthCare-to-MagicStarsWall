import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Award, Check, Loader2, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { submitPartnerApplication } from "@/lib/portal.functions";
import { PortalShell, SectionHeader } from "@/components/portal/portal-shell";
import { CodeBlock } from "@/components/portal/code-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/partner")({
  head: () => ({
    meta: [
      { title: "ISV & Partner Network — Zertifizierung & Badges" },
      {
        name: "description",
        content:
          "Partner-Antrag stellen, automatisierte Compliance-Checks durchlaufen und verifizierte Badges als SVG einbetten.",
      },
      { property: "og:title", content: "ISV & Partner Network — Zertifizierung & Badges" },
      {
        property: "og:description",
        content: "Compliance-Checks, Zertifizierung und einbettbare Verified-Badges für ISVs.",
      },
    ],
  }),
  component: PartnerPage,
});

type Check = { id: string; label: string; passed: boolean };

function PartnerPage() {
  const qc = useQueryClient();
  const submit = useServerFn(submitPartnerApplication);
  const [form, setForm] = useState({
    company_name: "",
    website: "https://",
    solution_name: "",
    solution_description: "",
    repo_url: "",
    contact_email: "",
  });

  const application = useQuery({
    queryKey: ["partner-application"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_applications")
        .select("id, company_name, solution_name, status, score, checks, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const badges = useQuery({
    queryKey: ["partner-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("id, slug, label, badge_type, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: () => submit({ data: form }),
    onSuccess: () => {
      toast.success("Antrag geprüft und eingereicht.");
      qc.invalidateQueries({ queryKey: ["partner-application"] });
      qc.invalidateQueries({ queryKey: ["partner-badges"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checks = (application.data?.checks as Check[] | null) ?? [];

  return (
    <PortalShell>
      <div className="mx-auto max-w-3xl space-y-12">
        <SectionHeader
          id="programm"
          eyebrow="ISV & Partner Network"
          title="Partner Program"
          description="Reiche deine Lösung ein. Der Compliance-Check läuft automatisiert und vergibt bei Erfolg direkt die Badges."
        />

        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Firma" value={form.company_name} max={120}
              onChange={(v) => setForm((f) => ({ ...f, company_name: v }))} />
            <Field label="Website" value={form.website} max={200}
              onChange={(v) => setForm((f) => ({ ...f, website: v }))} />
            <Field label="Lösung" value={form.solution_name} max={120}
              onChange={(v) => setForm((f) => ({ ...f, solution_name: v }))} />
            <Field label="Repository (optional)" value={form.repo_url} max={200}
              onChange={(v) => setForm((f) => ({ ...f, repo_url: v }))} />
            <Field label="Kontakt-E-Mail" value={form.contact_email} max={200}
              onChange={(v) => setForm((f) => ({ ...f, contact_email: v }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc" className="font-mono text-[11px]">
              Beschreibung (min. 120 Zeichen für volle Punktzahl)
            </Label>
            <Textarea
              id="desc"
              rows={4}
              maxLength={1200}
              value={form.solution_description}
              onChange={(e) => setForm((f) => ({ ...f, solution_description: e.target.value }))}
              className="font-mono text-xs"
            />
          </div>
          <Button
            size="sm"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="gap-1.5 font-mono text-xs"
          >
            {mutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            Antrag einreichen
          </Button>
        </div>

        <div id="verification" className="scroll-mt-32 space-y-4">
          <SectionHeader
            eyebrow="Verification Suite"
            title="Compliance-Status"
            description="Automatisierte Prüfungen mit Score. Ab 75 Punkten erfolgt die Zertifizierung."
          />
          {application.data ? (
            <div className="rounded-md border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 font-mono text-xs">
                  {application.data.company_name} · {application.data.solution_name}
                </p>
                <Badge
                  className={
                    application.data.status === "certified"
                      ? "bg-success/15 font-mono text-[10px] text-success"
                      : "bg-warning/15 font-mono text-[10px] text-warning"
                  }
                >
                  {application.data.status} · {application.data.score}/100
                </Badge>
              </div>
              <ul className="mt-3 space-y-1.5">
                {checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-2 text-xs">
                    {c.passed ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    ) : (
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                    )}
                    <span className="min-w-0 text-muted-foreground">{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="rounded-md border border-border bg-card p-6 text-center font-mono text-xs text-muted-foreground">
              Noch kein Antrag eingereicht.
            </p>
          )}
        </div>

        <div id="badges" className="scroll-mt-32 space-y-4">
          <SectionHeader
            eyebrow="Badge Center"
            title="Badges einbetten"
            description="Dynamische SVG-Badges für Readme oder Website. Der Status wird live aus der Control Plane gelesen."
          />
          {(badges.data ?? []).length === 0 ? (
            <p className="rounded-md border border-border bg-card p-6 text-center font-mono text-xs text-muted-foreground">
              Badges erscheinen nach erfolgreicher Zertifizierung.
            </p>
          ) : (
            (badges.data ?? []).map((badge) => (
              <div key={badge.id} className="space-y-2 rounded-md border border-border bg-card p-4">
                <p className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                  <Award className="h-3.5 w-3.5 text-success" /> {badge.label}
                </p>
                <CodeBlock
                  label="markdown"
                  code={`![${badge.label}](https://api.your-platform.io/v1/badges/${badge.slug}.svg)`}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </PortalShell>
  );
}

function Field({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: string;
  max: number;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[11px]">{label}</Label>
      <Input
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-xs"
      />
    </div>
  );
}
