"use client";

import { Check, ChevronDown, GitBranch } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const triggerClass =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function BranchSelector() {
  const repos = useStore((s) => s.repos);
  const repoId = useStore((s) => s.composer.repoId);
  const branch = useStore((s) => s.composer.branch);
  const setComposer = useStore((s) => s.setComposer);
  const repo = repos.find((r) => r.id === repoId) ?? repos[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClass}>
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{branch}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Branch</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {repo.branches.map((b) => (
          <DropdownMenuItem key={b} onSelect={() => setComposer({ branch: b })}>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">{b}</span>
            <Check
              className={cn(
                "h-4 w-4",
                b === branch ? "opacity-100" : "opacity-0"
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
