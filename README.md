# Codex Cloud — Interface Prototype

A faithful, mock-driven recreation of the **OpenAI Codex cloud** web interface,
built as a playground for prototyping product ideas. Nothing talks to a real
backend — tasks are simulated by a small in-app "run engine" so you can kick one
off and watch the plan fill in, logs stream, and a diff build up over time.

> Built with Next.js (App Router) + TypeScript + Tailwind v4 + hand-rolled
> shadcn/ui components. Dark, single-accent theme to match the product.

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

Other scripts: `npm run build`, `npm run lint`.

## What's in it

| Screen | Route | What to try |
| --- | --- | --- |
| **Home / composer + task list** | `/` | Type a prompt, pick a repo + branch, hit **Code** (writes a diff) or **Ask** (just answers). Watch it run. |
| **Task detail** | `/tasks/[id]` | Live plan, streaming logs, expandable diffs (expand/collapse all), follow-up input, **Create PR → View PR**. |
| **Environments** | `/environments` | Edit the setup script, env vars, secrets, network access + allowed domains. Save persists in the store. |

One seeded task auto-starts on first load so the dashboard shows live motion
immediately. The other seeds are realistic completed / failed / "Ask" snapshots.

## Where to change things (for prototyping)

Everything you'd want to tweak is centralized:

| You want to… | Edit |
| --- | --- |
| Re-skin colors / theme | `app/globals.css` (all tokens live in `:root`) |
| Change seed repos, tasks, environments | `lib/mock-data.ts` |
| Change how a simulated run unfolds (plan, logs, diffs, timing) | `lib/run-engine.ts` (`buildRunScript`) |
| Adjust the data shapes | `lib/types.ts` |
| App state + actions | `lib/store.ts` (Zustand) |
| Reusable UI primitives | `components/ui/*` |

### Architecture in one breath

- **`lib/store.ts`** — a Zustand store holds `tasks`, `environments`, and the
  composer state, plus mutators (`appendLog`, `appendDiff`, `setPlanStep`, …).
- **`lib/run-engine.ts`** — `startRun(taskId)` builds a scripted timeline and
  drives those mutators over ~15–20s. Swap this module for a real API call
  behind the same interface and the UI doesn't change.
- **Components** are grouped by surface: `composer/`, `tasks/`, `task-detail/`,
  `environments/`, with the shell in `layout/` and `components/ui/`.

### Add a new concept/screen

1. Add a route under `app/` (e.g. `app/reviews/page.tsx`).
2. Add a nav entry in `components/layout/app-sidebar.tsx` (`nav` array).
3. Read/write state through `useStore`. Reuse `components/ui/*` primitives.

## Notes

- Visual fidelity is reconstructed from the product + public docs, not pixel
  measurement — tokens and mock data are centralized so it's quick to refine.
- All "agent" activity is simulated; no model or network calls are made.
