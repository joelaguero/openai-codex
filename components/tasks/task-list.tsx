"use client";

import { Inbox } from "lucide-react";
import { TaskRow } from "./task-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

function TaskGroup({ tasks, empty }: { tasks: Task[]; empty: string }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
        <Inbox className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{empty}</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </div>
  );
}

export function TaskList() {
  const tasks = useStore((s) => s.tasks);
  const active = tasks.filter((t) => !t.archived);
  const archived = tasks.filter((t) => t.archived);

  return (
    <Tabs defaultValue="active" className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="active">
            Tasks
            <span className="ml-1 text-xs text-muted-foreground">
              {active.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived
            <span className="ml-1 text-xs text-muted-foreground">
              {archived.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="active">
        <TaskGroup tasks={active} empty="No tasks yet. Describe one above to get started." />
      </TabsContent>
      <TabsContent value="archived">
        <TaskGroup tasks={archived} empty="Nothing archived." />
      </TabsContent>
    </Tabs>
  );
}
