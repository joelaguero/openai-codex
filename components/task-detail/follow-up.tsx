"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

let followUpCounter = 0;

export function FollowUp({
  task,
  onSent,
}: {
  task: Task;
  onSent?: () => void;
}) {
  const [value, setValue] = useState("");
  const appendLog = useStore((s) => s.appendLog);

  const send = () => {
    const msg = value.trim();
    if (!msg) return;
    appendLog(task.id, {
      id: `fu-${task.id}-${followUpCounter++}`,
      kind: "user",
      text: msg,
      ts: 0,
    });
    setValue("");
    onSent?.();
    setTimeout(() => {
      appendLog(task.id, {
        id: `fu-${task.id}-${followUpCounter++}`,
        kind: "reasoning",
        text: "Got it — I'll factor that into the next pass. (Follow-ups are simulated in this prototype.)",
        ts: 0,
      });
    }, 1200);
  };

  return (
    <div className="border-t border-border bg-background/80 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Steer Codex or ask a follow-up…"
          className="min-h-[44px] resize-none py-2.5"
          rows={1}
        />
        <Button size="icon" disabled={!value.trim()} onClick={send}>
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
