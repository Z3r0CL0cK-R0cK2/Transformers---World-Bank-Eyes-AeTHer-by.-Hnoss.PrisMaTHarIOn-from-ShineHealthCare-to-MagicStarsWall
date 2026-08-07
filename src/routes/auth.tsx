import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Anmelden — oneclick.platform" },
      {
        name: "description",
        content:
          "One-Click-Registrierung für die Developer Control Plane: Google-Login oder E-Mail. Zero-Trust API-Token wird automatisch erzeugt.",
      },
      { property: "og:title", content: "Anmelden — oneclick.platform" },
      {
        property: "og:description",
        content: "One-Click-Registrierung mit Google oder E-Mail für die Developer Control Plane.",
      },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email({ message: "Bitte eine gültige E-Mail eingeben." }).max(255),
  password: z.string().min(8, { message: "Mindestens 8 Zeichen." }).max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google-Anmeldung fehlgeschlagen.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/developer" });
  }

  async function submit(mode: "signin" | "signup") {
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Ungültige Eingabe.");
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        setSent(true);
        toast.success("Bestätigungs-E-Mail versendet.");
        return;
      }
      navigate({ to: "/developer" });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error("Anmeldung fehlgeschlagen. Zugangsdaten prüfen.");
      return;
    }
    navigate({ to: "/developer" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10 font-sans text-foreground">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> zurück zur Startseite
        </Link>

        <div className="mt-5 rounded-lg border border-border bg-card p-6">
          <div className="grid h-8 w-8 place-items-center rounded bg-primary font-mono text-xs font-bold text-primary-foreground">
            1C
          </div>
          <h1 className="mt-4 text-lg font-semibold tracking-tight">Identity Gateway</h1>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Ein Login für Katalog, API-Keys, Zertifizierung und Deployments.
          </p>

          {sent ? (
            <p className="mt-5 rounded-md border border-success/40 bg-success/10 p-3 text-xs text-success">
              Prüfe dein Postfach und bestätige die E-Mail-Adresse, um die Anmeldung
              abzuschließen.
            </p>
          ) : null}

          <Button
            onClick={google}
            disabled={busy}
            variant="outline"
            className="mt-5 w-full gap-2 font-mono text-xs"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
            Mit Google fortfahren
          </Button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              oder
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 font-mono text-xs">
              <TabsTrigger value="signin">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>

            {(["signin", "signup"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`${mode}-email`} className="font-mono text-[11px]">
                    E-Mail
                  </Label>
                  <Input
                    id={`${mode}-email`}
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dev@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${mode}-password`} className="font-mono text-[11px]">
                    Passwort
                  </Label>
                  <Input
                    id={`${mode}-password`}
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    maxLength={72}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="mindestens 8 Zeichen"
                  />
                </div>
                <Button
                  onClick={() => submit(mode)}
                  disabled={busy}
                  className="w-full font-mono text-xs"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  {mode === "signup" ? "Konto anlegen" : "Anmelden"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
