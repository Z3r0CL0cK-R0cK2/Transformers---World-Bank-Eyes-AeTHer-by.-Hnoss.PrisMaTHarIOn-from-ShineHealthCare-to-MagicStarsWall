import { supabase } from "@/integrations/supabase/client";

export const timelinePhases = [
  "INIT",
  "DISCOVER",
  "VALIDATE",
  "VAULT_PUSH",
  "SYNC_COMPLETE",
] as const;

export type TimelinePhase = (typeof timelinePhases)[number];

export type TimelineEvent = {
  id: string;
  phase: string;
  label: string;
  detail: string;
  severity: string;
  created_at: string;
};

export async function logTimelineEvent(input: {
  userId: string;
  phase: TimelinePhase;
  label: string;
  detail?: string;
  severity?: "info" | "success" | "warning" | "critical";
}) {
  await supabase.from("timeline_events").insert({
    user_id: input.userId,
    phase: input.phase,
    label: input.label,
    detail: input.detail ?? "",
    severity: input.severity ?? "info",
  });
}

export const severityToken: Record<string, string> = {
  info: "bg-eu",
  success: "bg-success",
  warning: "bg-cyber",
  critical: "bg-neon",
};
