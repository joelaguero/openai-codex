"use client";

import { useEffect } from "react";
import { startRun } from "@/lib/run-engine";
import { useStore } from "@/lib/store";

/**
 * Kicks the one seeded "queued" task into motion on first load so the
 * dashboard shows a live run immediately. Runs exactly once.
 */
export function RunBootstrap() {
  useEffect(() => {
    const tasks = useStore.getState().tasks;
    const pending = tasks.find(
      (t) => t.status === "queued" && t.logs.length === 0
    );
    if (pending) {
      const id = setTimeout(() => startRun(pending.id), 1200);
      return () => clearTimeout(id);
    }
  }, []);

  return null;
}
