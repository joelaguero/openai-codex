"use client";

import { create } from "zustand";
import { environments as seedEnvironments, repos, seedTasks } from "./mock-data";
import type {
  Environment,
  FileDiff,
  LogLine,
  PlanStep,
  Repo,
  Task,
  TaskMode,
  TaskStatus,
} from "./types";

function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

interface ComposerState {
  prompt: string;
  repoId: string;
  branch: string;
  mode: TaskMode;
  attempts: number;
}

interface StoreState {
  repos: Repo[];
  tasks: Task[];
  environments: Environment[];
  composer: ComposerState;

  // composer
  setComposer: (patch: Partial<ComposerState>) => void;
  resetComposerPrompt: () => void;

  // task lifecycle
  createTask: (input: {
    prompt: string;
    mode: TaskMode;
    repoId: string;
    branch: string;
    attempts?: number;
  }) => Task;
  archiveTask: (id: string) => void;

  // run-engine mutators
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setPlan: (id: string, plan: PlanStep[]) => void;
  setPlanStep: (id: string, index: number, status: PlanStep["status"]) => void;
  appendLog: (id: string, line: LogLine) => void;
  appendDiff: (id: string, file: FileDiff) => void;
  setSummary: (id: string, summary: string) => void;
  setDuration: (id: string, ms: number) => void;
  setPullRequest: (id: string, pr: Task["pr"]) => void;

  // environments
  updateEnvironment: (id: string, patch: Partial<Environment>) => void;
}

function titleFromPrompt(prompt: string): string {
  const firstLine = prompt.trim().split("\n")[0];
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}…` : firstLine;
}

export const useStore = create<StoreState>((set) => ({
  repos,
  tasks: seedTasks,
  environments: seedEnvironments,
  composer: {
    prompt: "",
    repoId: repos[0].id,
    branch: repos[0].defaultBranch,
    mode: "code",
    attempts: 1,
  },

  setComposer: (patch) =>
    set((s) => ({ composer: { ...s.composer, ...patch } })),
  resetComposerPrompt: () =>
    set((s) => ({ composer: { ...s.composer, prompt: "" } })),

  createTask: (input) => {
    const task: Task = {
      id: uid("t"),
      title: titleFromPrompt(input.prompt),
      prompt: input.prompt,
      mode: input.mode,
      repoId: input.repoId,
      branch: input.branch,
      status: "queued",
      createdAt: new Date().toISOString(),
      attempts: input.attempts ?? 1,
      plan: [],
      logs: [],
      diffs: [],
    };
    set((s) => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  archiveTask: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, archived: true } : t)),
    })),

  setTaskStatus: (id, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  setPlan: (id, plan) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, plan } : t)),
    })),

  setPlanStep: (id, index, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              plan: t.plan.map((p, i) => (i === index ? { ...p, status } : p)),
            }
          : t
      ),
    })),

  appendLog: (id, line) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, logs: [...t.logs, line] } : t
      ),
    })),

  appendDiff: (id, file) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, diffs: [...t.diffs, file] } : t
      ),
    })),

  setSummary: (id, summary) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, summary } : t)),
    })),

  setDuration: (id, ms) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, durationMs: ms } : t)),
    })),

  setPullRequest: (id, pr) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, pr } : t)),
    })),

  updateEnvironment: (id, patch) =>
    set((s) => ({
      environments: s.environments.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    })),
}));

// Non-reactive selectors for convenience in event handlers / engine.
export const repoById = (id: string): Repo | undefined =>
  useStore.getState().repos.find((r) => r.id === id);

export const taskById = (id: string): Task | undefined =>
  useStore.getState().tasks.find((t) => t.id === id);
