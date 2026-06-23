"use client";

import { useState } from "react";
import { Check, ChevronDown, Cpu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const MODELS = [
  { id: "gpt-5-codex-high", label: "gpt-5-codex", effort: "high" },
  { id: "gpt-5-codex-medium", label: "gpt-5-codex", effort: "medium" },
  { id: "codex-mini", label: "codex-mini", effort: "low" },
];

const triggerClass =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function ModelSelector() {
  const [model, setModel] = useState(MODELS[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClass}>
        <Cpu className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{model.label}</span>
        <span className="text-xs text-muted-foreground">{model.effort}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Model &amp; reasoning effort</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MODELS.map((m) => (
          <DropdownMenuItem key={m.id} onSelect={() => setModel(m)}>
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">
              {m.label}{" "}
              <span className="text-xs text-muted-foreground">· {m.effort}</span>
            </span>
            <Check
              className={cn(
                "h-4 w-4",
                m.id === model.id ? "opacity-100" : "opacity-0"
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
