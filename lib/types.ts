export interface Repo {
  id: string;
  owner: string;
  name: string;
  /** "owner/name" */
  fullName: string;
  defaultBranch: string;
  branches: string[];
}

export type TaskMode = "code" | "ask";

export type TaskStatus = "queued" | "running" | "completed" | "failed";

export interface PlanStep {
  id: string;
  text: string;
  status: "pending" | "active" | "done";
}

export type LogKind =
  | "command"
  | "output"
  | "reasoning"
  | "info"
  | "error"
  | "user";

export interface LogLine {
  id: string;
  kind: LogKind;
  text: string;
  /** ms offset from run start, used only for display */
  ts: number;
}

export type FileChange = "added" | "modified" | "deleted" | "renamed";

export type DiffLineType = "add" | "del" | "context" | "hunk";

export interface DiffLine {
  type: DiffLineType;
  /** old line number (blank for adds / hunk headers) */
  oldNo?: number;
  /** new line number (blank for dels / hunk headers) */
  newNo?: number;
  content: string;
}

export interface FileDiff {
  path: string;
  /** previous path for renames */
  oldPath?: string;
  change: FileChange;
  additions: number;
  deletions: number;
  lines: DiffLine[];
}

export interface PullRequest {
  number: number;
  url: string;
  status: "draft" | "open" | "merged";
  title: string;
}

export interface Task {
  id: string;
  title: string;
  prompt: string;
  mode: TaskMode;
  repoId: string;
  branch: string;
  status: TaskStatus;
  createdAt: string;
  /** total run time once completed */
  durationMs?: number;
  plan: PlanStep[];
  logs: LogLine[];
  diffs: FileDiff[];
  /** markdown-ish answer/summary the agent produces */
  summary?: string;
  pr?: PullRequest;
  archived?: boolean;
  /** how many parallel attempts were requested (best-of-N feel) */
  attempts?: number;
}

export interface EnvVar {
  key: string;
  value: string;
}

export interface Secret {
  key: string;
  /** write-only; never displayed after entry */
  value?: string;
  /** masked hint shown in the UI, e.g. "npm_••••3f9a" */
  preview: string;
}

export interface Environment {
  id: string;
  name: string;
  repoId: string;
  baseImage: string;
  setupScript: string;
  envVars: EnvVar[];
  secrets: Secret[];
  networkAccess: boolean;
  allowedDomains: string[];
}

/** A scripted timeline event used by the simulated run engine. */
export type RunEvent =
  | { at: number; kind: "status"; status: TaskStatus }
  | { at: number; kind: "plan"; index: number; status: PlanStep["status"] }
  | { at: number; kind: "log"; line: Omit<LogLine, "id"> }
  | { at: number; kind: "diff"; file: FileDiff }
  | { at: number; kind: "summary"; text: string }
  | { at: number; kind: "duration"; ms: number };
