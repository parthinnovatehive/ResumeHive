"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveStatus } from "@/types/resume";

interface UseAutoSaveOptions {
  saveFn: (data: Record<string, unknown>) => Promise<void>;
  delay?: number;
}

export function useAutoSave({ saveFn, delay = 2000 }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef<Record<string, unknown> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(
    (data: Record<string, unknown>) => {
      latestDataRef.current = data;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        setStatus("saving");
        try {
          await saveFn(data);
          setStatus("saved");
          setTimeout(() => {
            setStatus((prev) => (prev === "saved" ? "idle" : prev));
          }, 2000);
        } catch {
          setStatus("error");
        }
      }, delay);
    },
    [saveFn, delay],
  );

  // Retry failed saves after 5 seconds
  useEffect(() => {
    if (status !== "error" || !latestDataRef.current) return;

    retryTimerRef.current = setTimeout(async () => {
      if (!latestDataRef.current) return;
      setStatus("saving");
      try {
        await saveFn(latestDataRef.current);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
      }
    }, 5000);

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [status, saveFn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  return { status };
}
