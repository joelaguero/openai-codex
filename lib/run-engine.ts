"use client";

import { makeFileDiff } from "./diff";
import { repoById, taskById, useStore } from "./store";
import type {
  FileDiff,
  LogLine,
  PlanStep,
  RunEvent,
  Task,
  TaskStatus,
} from "./types";

// Track in-flight runs so we never double-start or leak timers.
const activeRuns = new Map<string, ReturnType<typeof setTimeout>[]>();

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 28) || "task"
  );
}

function camel(s: string): string {
  const parts = slug(s).split("-").filter(Boolean);
  return (
    (parts[0] ?? "run") +
    parts
      .slice(1)
      .map((p) => p[0].toUpperCase() + p.slice(1))
      .join("")
  );
}

interface BuiltScript {
  plan: PlanStep[];
  events: RunEvent[];
  /** displayed (realistic) duration, independent of animation length */
  durationMs: number;
}

/** Build a believable scripted timeline for a task based on its mode + prompt. */
function buildRunScript(task: Task): BuiltScript {
  const repo = repoById(task.repoId);
  const repoName = repo?.name ?? "repo";
  const s = slug(task.title);
  const fn = camel(task.title);

  const events: RunEvent[] = [];
  let clock = 0;

  const status = (st: TaskStatus, gap = 600) => {
    clock += gap;
    events.push({ at: clock, kind: "status", status: st });
  };
  const log = (line: Omit<LogLine, "id" | "ts">, gap = 520) => {
    clock += gap;
    events.push({ at: clock, kind: "log", line: { ...line, ts: clock } });
  };
  const step = (index: number, st: PlanStep["status"], gap = 320) => {
    clock += gap;
    events.push({ at: clock, kind: "plan", index, status: st });
  };
  const diff = (file: FileDiff, gap = 650) => {
    clock += gap;
    events.push({ at: clock, kind: "diff", file });
  };

  status("running", 800);

  if (task.mode === "ask") {
    const plan: PlanStep[] = [
      { id: "p1", text: "Search the codebase for relevant context", status: "pending" },
      { id: "p2", text: "Read the key files", status: "pending" },
      { id: "p3", text: "Compose an answer", status: "pending" },
    ];

    step(0, "active");
    log({ kind: "command", text: `rg -n "${s.split("-")[0]}" .` });
    log({ kind: "output", text: `src/${repoName}/index.ts:42\nsrc/${repoName}/handlers.ts:118` });
    step(0, "done");

    step(1, "active");
    log({ kind: "reasoning", text: "Reading the matched files to understand the flow." });
    log({ kind: "command", text: "sed -n '1,80p' src/" + repoName + "/handlers.ts" });
    log({ kind: "output", text: "…" });
    step(1, "done");

    step(2, "active");
    log({ kind: "reasoning", text: "I have enough context to answer." }, 700);
    events.push({
      at: (clock += 200),
      kind: "summary",
      text: `Here's what I found in **${repo?.fullName ?? repoName}**:\n\nThe relevant logic lives in \`src/${repoName}/handlers.ts\`. It's wired up through the main entry point and is exercised by the existing test suite. Ask a follow-up if you'd like me to trace a specific path or propose a change.`,
    });
    step(2, "done");
    status("completed", 400);

    return { plan, events, durationMs: 40_000 + Math.round(Math.random() * 30_000) };
  }

  // ---- code mode ----
  const plan: PlanStep[] = [
    { id: "p1", text: "Explore the repository and locate relevant files", status: "pending" },
    { id: "p2", text: "Draft an implementation approach", status: "pending" },
    { id: "p3", text: "Make the code changes", status: "pending" },
    { id: "p4", text: "Run tests and linters", status: "pending" },
    { id: "p5", text: "Summarize the work", status: "pending" },
  ];

  const fileA = `lib/${s}.ts`;
  const fileB = `components/${s}-panel.tsx`;
  const Cap = fn[0].toUpperCase() + fn.slice(1);
  const promptSnippet =
    task.prompt.replace(/\s+/g, " ").slice(0, 60) +
    (task.prompt.length > 60 ? "…" : "");

  step(0, "active");
  log({ kind: "command", text: `git checkout -b codex/${s}` }, 420);
  log({ kind: "output", text: `Switched to a new branch 'codex/${s}'` });
  log({ kind: "command", text: "ls" }, 420);
  log({ kind: "output", text: "app/  components/  lib/  public/  package.json  tsconfig.json" });
  step(0, "done");

  step(1, "active");
  log({ kind: "reasoning", text: `I'll add a small helper in \`${fileA}\` and surface it through a new panel component, then verify with lint and tests.` }, 720);
  log({ kind: "command", text: `rg -n "${s.split("-")[0]}" app components lib` });
  log({ kind: "output", text: "no existing implementation found — creating new files" });
  step(1, "done");

  step(2, "active");
  log({ kind: "command", text: `applying patch to ${fileA}` }, 600);
  diff(
    makeFileDiff(
      fileA,
      "added",
      `@@ -0,0 +1,13 @@
+// ${task.title}
+export interface ${Cap}Options {
+  enabled?: boolean;
+}
+
+export function ${fn}(options: ${Cap}Options = {}) {
+  const { enabled = true } = options;
+  if (!enabled) return null;
+
+  // Generated for: "${promptSnippet}"
+  return { ok: true };
+}
`
    )
  );
  log({ kind: "command", text: `applying patch to ${fileB}` }, 600);
  diff(
    makeFileDiff(
      fileB,
      "added",
      `@@ -0,0 +1,12 @@
+"use client";
+
+import { ${fn} } from "@/lib/${s}";
+
+export function ${Cap}Panel() {
+  const result = ${fn}();
+  return (
+    <div className="rounded-md border p-4 text-sm">
+      {result?.ok ? "Ready" : "Disabled"}
+    </div>
+  );
+}
`
    )
  );
  step(2, "done");

  step(3, "active");
  log({ kind: "command", text: "npm run lint" }, 620);
  log({ kind: "output", text: "✔ No ESLint warnings or errors" }, 760);
  log({ kind: "command", text: "npm test" }, 520);
  log({ kind: "output", text: "Test Suites: 1 passed, 1 total\nTests:       6 passed, 6 total" }, 900);
  step(3, "done");

  step(4, "active");
  log({ kind: "reasoning", text: "Changes are in place and checks pass. Writing the summary." }, 620);
  events.push({
    at: (clock += 200),
    kind: "summary",
    text: `Implemented the request in **${repo?.fullName ?? repoName}** on a new branch \`codex/${s}\`.\n\n- Added \`${fileA}\` with the core logic\n- Added \`${fileB}\` to surface it in the UI\n\nLint is clean and all tests pass. Review the diff and open a PR when you're happy.`,
  });
  step(4, "done");
  status("completed", 400);

  return { plan, events, durationMs: 120_000 + Math.round(Math.random() * 180_000) };
}

/** Start (or resume) a simulated run for the given task id. Idempotent. */
export function startRun(taskId: string): void {
  if (activeRuns.has(taskId)) return;
  const task = taskById(taskId);
  if (!task) return;
  if (task.status === "completed" || task.status === "failed") return;
  // Only animate fresh tasks (no logs yet); existing snapshots stay static.
  if (task.logs.length > 0) return;

  const store = useStore.getState();
  const { plan, events, durationMs } = buildRunScript(task);

  store.setPlan(taskId, plan);

  const timers: ReturnType<typeof setTimeout>[] = [];
  let logCounter = 0;

  for (const event of events) {
    const timer = setTimeout(() => {
      const s = useStore.getState();
      switch (event.kind) {
        case "status":
          s.setTaskStatus(taskId, event.status);
          if (event.status === "completed") {
            s.setDuration(taskId, durationMs);
          }
          break;
        case "plan":
          s.setPlanStep(taskId, event.index, event.status);
          break;
        case "log":
          s.appendLog(taskId, { ...event.line, id: `log-${taskId}-${logCounter++}` });
          break;
        case "diff":
          s.appendDiff(taskId, event.file);
          break;
        case "summary":
          s.setSummary(taskId, event.text);
          break;
        case "duration":
          s.setDuration(taskId, event.ms);
          break;
      }
    }, event.at);
    timers.push(timer);
  }

  // Clear the active-run registry once the timeline finishes.
  const lastAt = events.length ? events[events.length - 1].at : 0;
  timers.push(setTimeout(() => activeRuns.delete(taskId), lastAt + 50));

  activeRuns.set(taskId, timers);
}

/** Cancel a run's pending timers (e.g. on full reset). */
export function stopRun(taskId: string): void {
  const timers = activeRuns.get(taskId);
  if (timers) timers.forEach(clearTimeout);
  activeRuns.delete(taskId);
}
