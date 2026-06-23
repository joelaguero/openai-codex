"use client";

import { useEffect, useRef } from "react";
import type { LogLine } from "@/lib/types";
import { cn } from "@/lib/utils";

function Line({ line }: { line: LogLine }) {
  switch (line.kind) {
    case "user":
      return (
        <div className="my-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1.5 not-italic text-foreground">
          <span className="select-none text-muted-foreground">You: </span>
          {line.text}
        </div>
      );
    case "command":
      return (
        <div className="text-foreground">
          <span className="select-none text-success">$ </span>
          {line.text}
        </div>
      );
    case "reasoning":
      return (
        <div className="my-1 border-l-2 border-info/40 pl-2 italic text-info/80">
          {line.text}
        </div>
      );
    case "error":
      return (
        <div className="whitespace-pre-wrap text-destructive">{line.text}</div>
      );
    case "output":
    case "info":
    default:
      return (
        <div className="whitespace-pre-wrap text-muted-foreground">
          {line.text}
        </div>
      );
  }
}

export function LogStream({
  logs,
  running,
}: {
  logs: LogLine[];
  running?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [logs.length, running]);

  return (
    <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-[#080808] p-4 font-mono text-xs leading-relaxed">
      {logs.length === 0 && (
        <div className="text-muted-foreground">
          {running ? "Booting the cloud environment…" : "No logs."}
        </div>
      )}
      <div className="space-y-0.5">
        {logs.map((line) => (
          <Line key={line.id} line={line} />
        ))}
      </div>
      {running && (
        <div className={cn("mt-1 text-foreground")}>
          <span className="caret-blink">▋</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
