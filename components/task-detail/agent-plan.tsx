"use client";

import { Check, Circle, Loader2 } from "lucide-react";
import type { PlanStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AgentPlan({ plan }: { plan: PlanStep[] }) {
  if (plan.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 text-sm font-medium">Plan</div>
      <ul className="space-y-2">
        {plan.map((step) => (
          <li key={step.id} className="flex items-center gap-2.5 text-sm">
            {step.status === "done" ? (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            ) : step.status === "active" ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-info" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            )}
            <span
              className={cn(
                step.status === "active"
                  ? "text-foreground"
                  : step.status === "done"
                    ? "text-muted-foreground"
                    : "text-muted-foreground/70"
              )}
            >
              {step.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
