import { useCallback, useEffect, useState } from "react";

export type MotionLevel = "full" | "reduced" | "off";

const STORAGE_KEY = "titan-motion-level";

function apply(level: MotionLevel) {
  if (typeof document === "undefined") return;
  try {
    document.documentElement.setAttribute("data-motion", level);
  } catch {
    /* ignore environments that block attribute writes */
  }
}

export function useMotionLevel() {
  const [level, setLevel] = useState<MotionLevel>("full");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    const initial: MotionLevel =
      stored === "full" || stored === "reduced" || stored === "off" ? stored : "full";
    setLevel(initial);
    apply(initial);
  }, []);

  const update = useCallback((next: MotionLevel) => {
    setLevel(next);
    apply(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable in private/blocked contexts */
    }
  }, []);

  const cycle = useCallback(() => {
    update(level === "full" ? "reduced" : level === "reduced" ? "off" : "full");
  }, [level, update]);

  return { level, setLevel: update, cycle };
}

export const motionLabels: Record<MotionLevel, string> = {
  full: "Motion: Voll",
  reduced: "Motion: Reduziert",
  off: "Motion: Aus",
};
