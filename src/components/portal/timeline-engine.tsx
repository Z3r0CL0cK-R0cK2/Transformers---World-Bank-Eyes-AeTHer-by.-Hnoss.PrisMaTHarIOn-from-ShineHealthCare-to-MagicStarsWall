import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { timelinePhases, severityToken, type TimelineEvent } from "@/lib/timeline";
import { cn } from "@/lib/utils";

const WINDOW_MS = 10 * 60 * 1000;

function formatStamp(date: Date) {
  const pad = (n: number, size = 2) => String(n).padStart(size, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    ms: pad(date.getMilliseconds(), 3),
  };
}

export function TimelineEngine() {
  const { user } = useSession();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setNow(new Date());
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const { data: events } = useQuery({
    queryKey: ["timeline-events", user?.id],
    enabled: Boolean(user),
    refetchInterval: 15000,
    queryFn: async (): Promise<TimelineEvent[]> => {
      const { data, error } = await supabase
        .from("timeline_events")
        .select("id, phase, label, detail, severity, created_at")
        .order("created_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      return data ?? [];
    },
  });

  const activePhaseIndex = useMemo(() => {
    const latest = events?.[0]?.phase;
    const index = timelinePhases.findIndex((p) => p === latest);
    return index < 0 ? 0 : index;
  }, [events]);

  const stamp = now ? formatStamp(now) : null;
  const reference = now?.getTime() ?? 0;

  return (
    <footer className="glass-bar fixed inset-x-0 bottom-0 z-30 border-t border-border">
      <div className="flex items-center gap-3 px-3 py-1.5 lg:px-6">
        <div className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {stamp ? (
            <span className="text-foreground">
              <span className="text-muted-foreground">{stamp.date}</span> {stamp.time}
              <span key={stamp.ms} className="clock-glitch text-primary">
                .{stamp.ms}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">synchronisiere …</span>
          )}
        </div>

        <div className="relative hidden h-7 min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card/60 md:block">
          <div className="scanline motion-heavy absolute inset-0" />
          <div className="absolute inset-y-0 left-0 right-0">
            {(events ?? []).map((event) => {
              const age = reference - new Date(event.created_at).getTime();
              if (age > WINDOW_MS || age < 0) return null;
              const left = 100 - (age / WINDOW_MS) * 100;
              return (
                <div
                  key={event.id}
                  title={`${event.phase} · ${event.label}${event.detail ? ` — ${event.detail}` : ""}`}
                  className="group absolute top-0 h-full w-px"
                  style={{ left: `${left}%` }}
                >
                  <span
                    className={cn(
                      "absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                      severityToken[event.severity] ?? "bg-eu",
                    )}
                  />
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden max-w-56 -translate-x-1/2 truncate rounded border border-border bg-popover px-2 py-1 font-mono text-[10px] text-popover-foreground group-hover:block">
                    {event.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="absolute inset-y-0 right-0 w-px bg-primary shadow-[0_0_12px_var(--vivid)]" />
        </div>

        <div className="hidden shrink-0 items-center gap-1 font-mono text-[10px] lg:flex">
          {timelinePhases.map((phase, index) => (
            <span
              key={phase}
              className={cn(
                "rounded px-1.5 py-0.5 uppercase tracking-widest",
                index < activePhaseIndex && "text-success",
                index === activePhaseIndex && "bg-primary/15 text-primary",
                index > activePhaseIndex && "text-muted-foreground",
              )}
            >
              {phase}
            </span>
          ))}
        </div>

        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <Radio className="h-3 w-3 text-success" />
          {events?.length ?? 0} Events
        </span>
      </div>
    </footer>
  );
}
