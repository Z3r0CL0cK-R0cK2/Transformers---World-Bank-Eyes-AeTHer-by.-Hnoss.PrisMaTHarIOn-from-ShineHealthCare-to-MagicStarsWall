import { useCallback, useEffect, useState } from "react";

export type MotionLevel = "full" | "reduced" | "off";

const STORAGE_KEY = "titan-motion-level";

function apply(level: MotionLevel) {
  document.documentElement.dataset["motion"] = level;
}

export function useMotionLevel() {
  const [level, setLevel] = useState<MotionLevel>("full");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as MotionLevel | null;
    const initial: MotionLevel =
      stored === "full" || stored === "reduced" || stored === "off" ? stored : "full";
    setLevel(initial);
    apply(initial);
  }, []);

  const update = useCallback((next: MotionLevel) => {
    setLevel(next);
    apply(next);
    window.localStorage.setItem(STORAGE_KEY, next);
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
