"use client";

import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

/** Minimal inline markdown: **bold** and `code`. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-foreground">
          {m[2]}
        </strong>
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {m[3]}
        </code>
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Render a small markdown-ish block: paragraphs and `- ` bullet lists. */
function renderBlocks(text: string): ReactNode[] {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="ml-1 list-disc space-y-1 pl-4">
          {list.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("- ")) {
      list.push(line.trim().slice(2));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push(<p key={key++}>{renderInline(line)}</p>);
    }
  }
  flushList();
  return blocks;
}

export function Summary({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-info" />
        Summary
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {renderBlocks(text)}
      </div>
    </div>
  );
}
