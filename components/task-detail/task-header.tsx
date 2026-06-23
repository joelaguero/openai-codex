"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Clock,
  FolderGit2,
  GitBranch,
  MoreHorizontal,
} from "lucide-react";
import { PrActions } from "./pr-actions";
import { StatusBadge } from "@/components/tasks/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

export function TaskHeader({ task }: { task: Task }) {
  const router = useRouter();
  const repos = useStore((s) => s.repos);
  const archiveTask = useStore((s) => s.archiveTask);
  const repo = repos.find((r) => r.id === task.repoId);

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-3">
      <Button asChild variant="ghost" size="icon-sm" aria-label="Back to tasks">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-semibold">{task.title}</h1>
          <StatusBadge status={task.status} />
          {task.mode === "ask" && <Badge variant="outline">Ask</Badge>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FolderGit2 className="h-3.5 w-3.5" />
            {repo?.fullName}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5" />
            {task.branch}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {task.status === "running" || task.status === "queued"
              ? "in progress"
              : formatDuration(task.durationMs)}
          </span>
        </div>
      </div>

      <PrActions task={task} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              archiveTask(task.id);
              router.push("/");
            }}
          >
            <Archive className="h-4 w-4" />
            Archive task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
