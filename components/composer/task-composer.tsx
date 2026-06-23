"use client";

import { useRouter } from "next/navigation";
import { ArrowUp, MessageCircleQuestion } from "lucide-react";
import { BranchSelector } from "./branch-selector";
import { ModelSelector } from "./model-selector";
import { RepoSelector } from "./repo-selector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { startRun } from "@/lib/run-engine";
import { useStore } from "@/lib/store";
import type { TaskMode } from "@/lib/types";

export function TaskComposer() {
  const router = useRouter();
  const composer = useStore((s) => s.composer);
  const setComposer = useStore((s) => s.setComposer);
  const createTask = useStore((s) => s.createTask);
  const resetComposerPrompt = useStore((s) => s.resetComposerPrompt);

  const prompt = composer.prompt.trim();

  const submit = (mode: TaskMode) => {
    if (!prompt) return;
    const task = createTask({
      prompt,
      mode,
      repoId: composer.repoId,
      branch: composer.branch,
    });
    startRun(task.id);
    resetComposerPrompt();
    router.push(`/tasks/${task.id}`);
  };

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card shadow-sm transition-colors focus-within:border-muted-foreground/40">
        <Textarea
          value={composer.prompt}
          onChange={(e) => setComposer({ prompt: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit("code");
            }
          }}
          placeholder="Describe a task for Codex to work on…"
          className="min-h-[92px] resize-none border-0 bg-transparent px-4 pt-4 text-base shadow-none focus-visible:ring-0"
        />
        <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
          <RepoSelector />
          <BranchSelector />
          <ModelSelector />
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={!prompt}
              onClick={() => submit("ask")}
            >
              <MessageCircleQuestion className="h-4 w-4" />
              Ask
            </Button>
            <Button size="sm" disabled={!prompt} onClick={() => submit("code")}>
              <ArrowUp className="h-4 w-4" />
              Code
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono text-[10px]">
          ⌘↵
        </kbd>{" "}
        to start ·{" "}
        <span className="text-foreground/70">Code</span> writes changes,{" "}
        <span className="text-foreground/70">Ask</span> just answers
      </p>
    </div>
  );
}
