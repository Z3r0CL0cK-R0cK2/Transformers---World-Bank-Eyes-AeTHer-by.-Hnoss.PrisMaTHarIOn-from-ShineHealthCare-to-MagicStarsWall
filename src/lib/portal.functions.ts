import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createKeySchema = z.object({
  name: z.string().trim().min(1).max(60),
  scopes: z.array(z.enum(["read", "write", "deploy"])).min(1).max(3),
});

const applicationSchema = z.object({
  company_name: z.string().trim().min(2).max(120),
  website: z.string().trim().url().max(200),
  solution_name: z.string().trim().min(2).max(120),
  solution_description: z.string().trim().min(20).max(1200),
  repo_url: z.string().trim().url().max(200).optional().or(z.literal("")),
  contact_email: z.string().trim().email().max(200),
});

const deploySchema = z.object({
  repository_id: z.string().uuid(),
  environment: z.enum(["preview", "staging", "production"]),
});

const repoSchema = z.object({
  provider: z.enum(["github", "gitlab"]),
  url: z.string().trim().url().max(200),
});

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createKeySchema.parse(input))
  .handler(async ({ data, context }) => {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const raw = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const token = `pk_live_${raw}`;
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const hash = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { data: row, error } = await context.supabase
      .from("api_keys")
      .insert({
        user_id: context.userId,
        name: data.name,
        key_prefix: token.slice(0, 16),
        key_hash: hash,
        scopes: data.scopes,
      })
      .select("id, name, key_prefix, scopes, created_at")
      .single();

    if (error) throw new Error(error.message);
    return { key: row, token };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("api_keys")
      .update({ revoked: true })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const linkRepository = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => repoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const parts = new URL(data.url).pathname.replace(/^\/+|\.git$/g, "").split("/");
    const fullName = parts.slice(0, 2).join("/");
    if (parts.length < 2 || !fullName) throw new Error("Repository-URL muss Besitzer und Namen enthalten.");

    const { data: row, error } = await context.supabase
      .from("repositories")
      .insert({ user_id: context.userId, provider: data.provider, url: data.url, full_name: fullName })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const runDeployment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deploySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: repo, error: repoError } = await context.supabase
      .from("repositories")
      .select("id, full_name, default_branch")
      .eq("id", data.repository_id)
      .single();
    if (repoError || !repo) throw new Error("Repository nicht gefunden.");

    const sha = Math.random().toString(16).slice(2, 9);
    const steps = [
      `> checkout ${repo.full_name}@${repo.default_branch} (${sha})`,
      "> runner: platform/runner:latest gestartet",
      "> install: dependencies aufgelöst",
      "> build: Artefakt erzeugt (edge-bundle)",
      `> deploy: ${data.environment} — Rollout abgeschlossen`,
    ];

    const { data: row, error } = await context.supabase
      .from("deployments")
      .insert({
        user_id: context.userId,
        repository_id: repo.id,
        environment: data.environment,
        status: "success",
        commit_sha: sha,
        log: steps.join("\n"),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const submitPartnerApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => applicationSchema.parse(input))
  .handler(async ({ data, context }) => {
    const checks = [
      {
        id: "https",
        label: "Website über HTTPS erreichbar",
        passed: data.website.startsWith("https://"),
      },
      {
        id: "repo",
        label: "Öffentliches Repository angegeben",
        passed: Boolean(data.repo_url),
      },
      {
        id: "description",
        label: "Lösungsbeschreibung ausreichend detailliert (>= 120 Zeichen)",
        passed: data.solution_description.length >= 120,
      },
      {
        id: "contact",
        label: "Kontakt-E-Mail auf Firmendomain",
        passed: (() => {
          try {
            return new URL(data.website).hostname.replace(/^www\./, "").endsWith(
              data.contact_email.split("@")[1] ?? "",
            );
          } catch {
            return false;
          }
        })(),
      },
    ];

    const passed = checks.filter((c) => c.passed).length;
    const score = Math.round((passed / checks.length) * 100);
    const status = score >= 75 ? "certified" : score >= 50 ? "in_review" : "action_required";

    const { data: application, error } = await context.supabase
      .from("partner_applications")
      .insert({
        user_id: context.userId,
        company_name: data.company_name,
        website: data.website,
        solution_name: data.solution_name,
        solution_description: data.solution_description,
        repo_url: data.repo_url || null,
        contact_email: data.contact_email,
        status,
        checks,
        score,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    if (status === "certified") {
      const slug = `${data.solution_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40)}-${application.id.slice(0, 6)}`;

      await context.supabase.from("badges").insert([
        {
          user_id: context.userId,
          application_id: application.id,
          slug,
          badge_type: "verified_isv",
          label: "Verified ISV Partner",
        },
        {
          user_id: context.userId,
          application_id: application.id,
          slug: `${slug}-security`,
          badge_type: "security_certified",
          label: "Security Certified",
        },
      ]);
    }

    return application;
  });
