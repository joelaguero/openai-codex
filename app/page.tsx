import { TaskComposer } from "@/components/composer/task-composer";
import { TaskList } from "@/components/tasks/task-list";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          What should we work on?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kick off a task and Codex works in a cloud environment, then hands you
          a diff to review.
        </p>
      </header>

      <TaskComposer />

      <section className="mt-12">
        <TaskList />
      </section>
    </div>
  );
}
