import { Check, CircleDashed, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";

type Meta = {
  label: string;
  badge: "default" | "success" | "warning" | "info" | "destructive" | "outline";
  dot: string;
};

export const statusMeta: Record<TaskStatus, Meta> = {
  queued: { label: "Queued", badge: "outline", dot: "bg-muted-foreground" },
  running: { label: "Running", badge: "info", dot: "bg-info" },
  completed: { label: "Done", badge: "success", dot: "bg-success" },
  failed: { label: "Failed", badge: "destructive", dot: "bg-destructive" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = statusMeta[status];
  const Icon =
    status === "running"
      ? Loader2
      : status === "completed"
        ? Check
        : status === "failed"
          ? X
          : CircleDashed;
  return (
    <Badge variant={meta.badge}>
      <Icon className={cn("h-3 w-3", status === "running" && "animate-spin")} />
      {meta.label}
    </Badge>
  );
}

export function StatusDot({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  const meta = statusMeta[status];
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      {status === "running" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-60" />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", meta.dot)} />
    </span>
  );
}
