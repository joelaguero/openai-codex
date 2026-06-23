"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Asterisk, Boxes, ListTodo, Plus, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/tasks/status-badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Tasks", icon: ListTodo, match: (p: string) => p === "/" },
  {
    href: "/environments",
    label: "Environments",
    icon: Boxes,
    match: (p: string) => p.startsWith("/environments"),
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const tasks = useStore((s) => s.tasks);
  const recent = tasks.filter((t) => !t.archived).slice(0, 7);

  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
          <Asterisk className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">Codex</span>
        <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          cloud
        </span>
      </div>

      <div className="px-3">
        <Button asChild className="w-full justify-start gap-2" size="sm">
          <Link href="/">
            <Plus className="h-4 w-4" />
            New task
          </Link>
        </Button>
      </div>

      {/* Primary nav */}
      <nav className="mt-4 px-3">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Recent tasks */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col px-3">
        <div className="px-2.5 pb-2 text-xs font-medium text-muted-foreground">
          Recent
        </div>
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {recent.map((t) => {
            const active = pathname === `/tasks/${t.id}`;
            return (
              <li key={t.id}>
                <Link
                  href={`/tasks/${t.id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <StatusDot status={t.status} className="shrink-0" />
                  <span className="truncate">{t.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User footer */}
      <div className="mt-auto flex items-center gap-2.5 border-t border-sidebar-border p-3">
        <Avatar className="h-7 w-7">
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">Jordan Lee</div>
          <div className="truncate text-xs text-muted-foreground">
            jordan@acme.dev
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
