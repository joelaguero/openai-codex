"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AgentPlan } from "./agent-plan";
import { DiffViewer } from "./diff-viewer";
import { FollowUp } from "./follow-up";
import { LogStream } from "./log-stream";
import { Summary } from "./summary";
import { TaskHeader } from "./task-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startRun } from "@/lib/run-engine";
import { useStore } from "@/lib/store";

export function TaskDetail({ id }: { id: string }) {
  const task = useStore((s) => s.tasks.find((t) => t.id === id));
  const started = useRef(false);

  // Auto-start a freshly created/queued task when its detail view opens.
  useEffect(() => {
    if (started.current) return;
    const current = useStore.getState().tasks.find((t) => t.id === id);
    if (current && current.status === "queued" && current.logs.length === 0) {
      started.current = true;
      startRun(id);
    }
  }, [id]);

  const isCode = task?.mode === "code";
  const [tab, setTab] = useState<string>(() => {
    if (!task) return "logs";
    if (task.mode === "ask") return "logs";
    return task.status === "completed" || task.status === "failed"
      ? "diff"
      : "logs";
  });

  if (!task) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">Task not found.</p>
        <Button asChild variant="secondary" size="sm">
          <Link href="/">Back to tasks</Link>
        </Button>
      </div>
    );
  }

  const running = task.status === "running" || task.status === "queued";

  return (
    <div className="flex h-full flex-col">
      <TaskHeader task={task} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-5 px-6 py-6">
          {/* Original request */}
          <div className="flex gap-3">
            <Avatar className="h-7 w-7">
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-xl border border-border bg-card p-4 text-sm">
              {task.prompt}
            </div>
          </div>

          <AgentPlan plan={task.plan} />

          {task.summary && <Summary text={task.summary} />}

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              {isCode && (
                <TabsTrigger value="diff">
                  Diff
                  {task.diffs.length > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      {task.diffs.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            {isCode && (
              <TabsContent value="diff" className="mt-4">
                <DiffViewer files={task.diffs} running={running} />
              </TabsContent>
            )}
            <TabsContent value="logs" className="mt-4">
              <LogStream logs={task.logs} running={running} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <FollowUp task={task} onSent={() => setTab("logs")} />
    </div>
  );
}
