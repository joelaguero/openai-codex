"use client";

import { useState } from "react";
import { Box, Globe, GlobeLock } from "lucide-react";
import { EnvironmentForm } from "./environment-form";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function EnvironmentsView() {
  const environments = useStore((s) => s.environments);
  const repos = useStore((s) => s.repos);
  const [selectedId, setSelectedId] = useState(environments[0]?.id);

  const selected =
    environments.find((e) => e.id === selectedId) ?? environments[0];

  if (!selected) {
    return (
      <p className="text-sm text-muted-foreground">
        No environments configured yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <div className="space-y-1.5">
        {environments.map((env) => {
          const repo = repos.find((r) => r.id === env.repoId);
          const active = env.id === selected.id;
          return (
            <button
              key={env.id}
              onClick={() => setSelectedId(env.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-border bg-accent"
                  : "border-transparent hover:bg-accent/40"
              )}
            >
              <Box className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{env.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {repo?.fullName}
                </div>
              </div>
              {env.networkAccess ? (
                <Globe className="h-3.5 w-3.5 shrink-0 text-success" />
              ) : (
                <GlobeLock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>

      <EnvironmentForm key={selected.id} env={selected} />
    </div>
  );
}
