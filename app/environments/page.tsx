import { EnvironmentsView } from "@/components/environments/environments-view";

export default function EnvironmentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Environments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the cloud container Codex uses for each repository — setup
          script, variables, secrets, and network access.
        </p>
      </header>

      <div className="mt-8">
        <EnvironmentsView />
      </div>
    </div>
  );
}
