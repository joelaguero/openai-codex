"use client";

import Link from "next/link";
import { FolderGit2, GitBranch, GitPullRequest } from "lucide-react";
import { StatusBadge, StatusDot } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { diffTotals } from "@/lib/diff";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

export function TaskRow({ task }: { task: Task }) {
  const repos = useStore((s) => s.repos);
  const repo = repos.find((r) => r.id === task.repoId);
  const { additions, deletions } = diffTotals(task.diffs);
  const hasDiff = task.mode === "code" && task.diffs.length > 0;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="group flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/30"
    >
      <StatusDot status={task.status} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {task.title}
          </span>
          {task.mode === "ask" && (
            <Badge variant="outline" className="shrink-0">
              Ask
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FolderGit2 className="h-3.5 w-3.5" />
            {repo?.fullName}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5" />
            {task.branch}
          </span>
          {task.pr && (
            <span className="inline-flex items-center gap-1">
              <GitPullRequest className="h-3.5 w-3.5" />#{task.pr.number}
            </span>
          )}
        </div>
      </div>

      {hasDiff && (
        <div className="hidden shrink-0 items-center gap-1.5 font-mono text-xs sm:flex">
          <span className="text-success">+{additions}</span>
          <span className="text-destructive">−{deletions}</span>
        </div>
      )}

      <div className="hidden shrink-0 sm:block">
        <StatusBadge status={task.status} />
      </div>

      <time className="w-14 shrink-0 text-right text-xs text-muted-foreground">
        {relativeTime(task.createdAt)}
      </time>
    </Link>
  );
}
