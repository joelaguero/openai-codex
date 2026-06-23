import type { DiffLine, FileChange, FileDiff } from "./types";

/**
 * Parse a unified-diff hunk body (lines starting at "@@") into structured
 * DiffLines with old/new line numbers and additions/deletions counts.
 */
export function parseDiff(raw: string): {
  lines: DiffLine[];
  additions: number;
  deletions: number;
} {
  const lines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let oldNo = 0;
  let newNo = 0;

  const body = raw.replace(/\n$/, "");
  for (const line of body.split("\n")) {
    if (line.startsWith("@@")) {
      const m = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (m) {
        oldNo = parseInt(m[1], 10);
        newNo = parseInt(m[2], 10);
      }
      lines.push({ type: "hunk", content: line });
      continue;
    }
    const tag = line[0];
    const content = line.slice(1);
    if (tag === "+") {
      lines.push({ type: "add", newNo, content });
      newNo++;
      additions++;
    } else if (tag === "-") {
      lines.push({ type: "del", oldNo, content });
      oldNo++;
      deletions++;
    } else {
      lines.push({ type: "context", oldNo, newNo, content });
      oldNo++;
      newNo++;
    }
  }

  return { lines, additions, deletions };
}

/** Build a FileDiff from raw unified-diff hunk text. */
export function makeFileDiff(
  path: string,
  change: FileChange,
  raw: string,
  oldPath?: string
): FileDiff {
  const { lines, additions, deletions } = parseDiff(raw);
  return { path, change, additions, deletions, lines, oldPath };
}

/** Sum additions/deletions across a set of files. */
export function diffTotals(files: FileDiff[]): {
  additions: number;
  deletions: number;
} {
  return files.reduce(
    (acc, f) => ({
      additions: acc.additions + f.additions,
      deletions: acc.deletions + f.deletions,
    }),
    { additions: 0, deletions: 0 }
  );
}
