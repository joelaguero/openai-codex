"use client";

import { ExternalLink, GitPullRequest } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

export function PrActions({ task }: { task: Task }) {
  const repos = useStore((s) => s.repos);
  const setPullRequest = useStore((s) => s.setPullRequest);
  const repo = repos.find((r) => r.id === task.repoId);

  if (task.pr) {
    const variant =
      task.pr.status === "merged"
        ? "info"
        : task.pr.status === "open"
          ? "success"
          : "outline";
    return (
      <div className="flex items-center gap-2">
        <Badge variant={variant} className="capitalize">
          <GitPullRequest className="h-3 w-3" />
          {task.pr.status}
        </Badge>
        <Button asChild variant="secondary" size="sm">
          <a href={task.pr.url} target="_blank" rel="noreferrer">
            PR #{task.pr.number}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    );
  }

  const canCreate =
    task.mode === "code" &&
    task.status === "completed" &&
    task.diffs.length > 0;

  const createPr = () => {
    const number = Math.floor(100 + Math.random() * 900);
    setPullRequest(task.id, {
      number,
      url: `https://github.com/${repo?.fullName ?? "acme/repo"}/pull/${number}`,
      status: "open",
      title: task.title,
    });
  };

  return (
    <Button size="sm" disabled={!canCreate} onClick={createPr}>
      <GitPullRequest className="h-4 w-4" />
      Create PR
    </Button>
  );
}
