"use client";

import { ChevronRight } from "lucide-react";
import type { FileChange, FileDiff as FileDiffType } from "@/lib/types";
import { cn } from "@/lib/utils";

const changeMeta: Record<FileChange, { letter: string; className: string }> = {
  added: { letter: "A", className: "bg-success/15 text-success" },
  modified: { letter: "M", className: "bg-warning/15 text-warning" },
  deleted: { letter: "D", className: "bg-destructive/15 text-destructive" },
  renamed: { letter: "R", className: "bg-info/15 text-info" },
};

export function FileDiff({
  file,
  open,
  onToggle,
}: {
  file: FileDiffType;
  open: boolean;
  onToggle: () => void;
}) {
  const meta = changeMeta[file.change];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent/40"
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        />
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold",
            meta.className
          )}
        >
          {meta.letter}
        </span>
        <span className="truncate font-mono text-xs text-foreground">
          {file.oldPath && file.oldPath !== file.path ? (
            <>
              <span className="text-muted-foreground line-through">
                {file.oldPath}
              </span>{" "}
              → {file.path}
            </>
          ) : (
            file.path
          )}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-xs">
          <span className="text-success">+{file.additions}</span>
          <span className="text-destructive">−{file.deletions}</span>
        </span>
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full border-collapse font-mono text-xs leading-relaxed">
            <tbody>
              {file.lines.map((line, i) => {
                if (line.type === "hunk") {
                  return (
                    <tr key={i}>
                      <td
                        colSpan={3}
                        className="select-none bg-muted/60 px-3 py-1 text-muted-foreground"
                      >
                        {line.content}
                      </td>
                    </tr>
                  );
                }
                const bg =
                  line.type === "add"
                    ? "bg-[var(--diff-add-bg)]"
                    : line.type === "del"
                      ? "bg-[var(--diff-del-bg)]"
                      : "";
                const sign =
                  line.type === "add" ? "+" : line.type === "del" ? "−" : " ";
                const signColor =
                  line.type === "add"
                    ? "text-success"
                    : line.type === "del"
                      ? "text-destructive"
                      : "text-transparent";
                return (
                  <tr key={i} className={bg}>
                    <td className="w-10 select-none border-r border-border/60 px-2 text-right align-top text-[11px] text-muted-foreground/50">
                      {line.oldNo ?? ""}
                    </td>
                    <td className="w-10 select-none border-r border-border/60 px-2 text-right align-top text-[11px] text-muted-foreground/50">
                      {line.newNo ?? ""}
                    </td>
                    <td className="whitespace-pre px-3 align-top">
                      <span className={cn("select-none", signColor)}>
                        {sign}
                      </span>
                      <span>{line.content}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
