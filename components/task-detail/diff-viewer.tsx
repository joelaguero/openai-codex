"use client";

import { useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, FileDiff as FileDiffIcon } from "lucide-react";
import { FileDiff } from "./file-diff";
import { Button } from "@/components/ui/button";
import { diffTotals } from "@/lib/diff";
import type { FileDiff as FileDiffType } from "@/lib/types";

export function DiffViewer({
  files,
  running,
}: {
  files: FileDiffType[];
  running?: boolean;
}) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
        <FileDiffIcon className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {running ? "Waiting for changes…" : "No file changes for this task."}
        </p>
      </div>
    );
  }

  const isOpen = (path: string) => overrides[path] ?? true;
  const allOpen = files.every((f) => isOpen(f.path));
  const totals = diffTotals(files);

  const setAll = (open: boolean) =>
    setOverrides(Object.fromEntries(files.map((f) => [f.path, open])));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{files.length}</span>{" "}
          {files.length === 1 ? "file" : "files"} changed{" "}
          <span className="ml-1 font-mono text-success">+{totals.additions}</span>{" "}
          <span className="font-mono text-destructive">−{totals.deletions}</span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAll(!allOpen)}
          className="text-muted-foreground"
        >
          {allOpen ? (
            <ChevronsDownUp className="h-4 w-4" />
          ) : (
            <ChevronsUpDown className="h-4 w-4" />
          )}
          {allOpen ? "Collapse all" : "Expand all"}
        </Button>
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <FileDiff
            key={file.path}
            file={file}
            open={isOpen(file.path)}
            onToggle={() =>
              setOverrides((m) => ({ ...m, [file.path]: !isOpen(file.path) }))
            }
          />
        ))}
      </div>
    </div>
  );
}
