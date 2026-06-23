import { makeFileDiff } from "./diff";
import type { Environment, Repo, Task } from "./types";

export const repos: Repo[] = [
  {
    id: "web-dashboard",
    owner: "acme",
    name: "web-dashboard",
    fullName: "acme/web-dashboard",
    defaultBranch: "main",
    branches: ["main", "develop", "release/2.4"],
  },
  {
    id: "payments-api",
    owner: "acme",
    name: "payments-api",
    fullName: "acme/payments-api",
    defaultBranch: "main",
    branches: ["main", "staging"],
  },
  {
    id: "mobile-app",
    owner: "acme",
    name: "mobile-app",
    fullName: "acme/mobile-app",
    defaultBranch: "main",
    branches: ["main", "feature/offline-mode"],
  },
  {
    id: "design-system",
    owner: "acme",
    name: "design-system",
    fullName: "acme/design-system",
    defaultBranch: "main",
    branches: ["main"],
  },
];

export const environments: Environment[] = [
  {
    id: "env-web",
    name: "web-dashboard",
    repoId: "web-dashboard",
    baseImage: "universal-node-22",
    setupScript: `# Install dependencies and prepare the workspace
npm ci
npm run build --if-present`,
    envVars: [
      { key: "NODE_ENV", value: "test" },
      { key: "NEXT_TELEMETRY_DISABLED", value: "1" },
    ],
    secrets: [
      { key: "NPM_TOKEN", value: "", preview: "npm_••••••••••••3f9a" },
      { key: "SENTRY_AUTH_TOKEN", value: "", preview: "••••••••••••••2b71" },
    ],
    networkAccess: true,
    allowedDomains: ["registry.npmjs.org", "github.com", "api.acme.dev"],
  },
  {
    id: "env-payments",
    name: "payments-api",
    repoId: "payments-api",
    baseImage: "universal-python-3.12",
    setupScript: `# Set up the Python service for tests
pip install -r requirements.txt
pip install -r requirements-dev.txt`,
    envVars: [
      { key: "PYTHONPATH", value: "src" },
      { key: "DATABASE_URL", value: "postgres://localhost:5432/test" },
    ],
    secrets: [{ key: "STRIPE_TEST_KEY", value: "", preview: "sk_test_••••9KdZ" }],
    networkAccess: false,
    allowedDomains: [],
  },
];

// Helper to make ISO timestamps relative to "now" (minutes/hours ago).
const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const seedTasks: Task[] = [
  {
    id: "t-dark-mode",
    title: "Add a dark mode toggle to the settings page",
    prompt:
      "Add a dark mode toggle to the settings page. Persist the choice in localStorage and respect the OS preference on first load.",
    mode: "code",
    repoId: "web-dashboard",
    branch: "main",
    status: "completed",
    createdAt: minsAgo(42),
    durationMs: 7 * 60_000 + 12_000,
    attempts: 1,
    plan: [
      { id: "p1", text: "Explore the settings page and theme setup", status: "done" },
      { id: "p2", text: "Add a useTheme hook with localStorage + OS preference", status: "done" },
      { id: "p3", text: "Wire a toggle into the settings UI", status: "done" },
      { id: "p4", text: "Run lint and the component tests", status: "done" },
    ],
    logs: [
      { id: "l1", kind: "command", text: "rg -l \"settings\" app/ components/", ts: 1200 },
      { id: "l2", kind: "output", text: "app/settings/page.tsx\ncomponents/settings/preferences.tsx", ts: 1900 },
      { id: "l3", kind: "reasoning", text: "Theme is read from a ThemeProvider but there's no user-facing toggle. I'll add a useTheme hook and a Switch.", ts: 2600 },
      { id: "l4", kind: "command", text: "applying patch to lib/use-theme.ts", ts: 3400 },
      { id: "l5", kind: "command", text: "applying patch to components/settings/preferences.tsx", ts: 4200 },
      { id: "l6", kind: "command", text: "npm run lint", ts: 5200 },
      { id: "l7", kind: "output", text: "✔ No ESLint warnings or errors", ts: 6100 },
      { id: "l8", kind: "command", text: "npm test -- preferences", ts: 6600 },
      { id: "l9", kind: "output", text: "PASS components/settings/preferences.test.tsx\nTests: 4 passed, 4 total", ts: 7600 },
    ],
    diffs: [
      makeFileDiff(
        "lib/use-theme.ts",
        "added",
        `@@ -0,0 +1,24 @@
+import { useEffect, useState } from "react";
+
+type Theme = "light" | "dark";
+
+export function useTheme() {
+  const [theme, setTheme] = useState<Theme>("light");
+
+  useEffect(() => {
+    const stored = localStorage.getItem("theme") as Theme | null;
+    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
+    setTheme(stored ?? (prefersDark ? "dark" : "light"));
+  }, []);
+
+  useEffect(() => {
+    document.documentElement.classList.toggle("dark", theme === "dark");
+    localStorage.setItem("theme", theme);
+  }, [theme]);
+
+  return {
+    theme,
+    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
+  };
+}
`
      ),
      makeFileDiff(
        "components/settings/preferences.tsx",
        "modified",
        `@@ -1,8 +1,11 @@
 import { Switch } from "@/components/ui/switch";
+import { useTheme } from "@/lib/use-theme";

 export function Preferences() {
+  const { theme, toggle } = useTheme();
   return (
     <section className="space-y-4">
-      <h2>Preferences</h2>
+      <h2 className="text-lg font-medium">Preferences</h2>
+      <label className="flex items-center justify-between">
+        <span>Dark mode</span>
+        <Switch checked={theme === "dark"} onCheckedChange={toggle} />
+      </label>
     </section>
   );
 }
`
      ),
    ],
    summary:
      "Added a `useTheme` hook that reads the saved preference from `localStorage` and falls back to the OS `prefers-color-scheme`, then wired a Switch into the Preferences section of the settings page. Lint is clean and the 4 preference tests pass.",
    pr: {
      number: 482,
      url: "https://github.com/acme/web-dashboard/pull/482",
      status: "open",
      title: "Add dark mode toggle to settings",
    },
  },
  {
    id: "t-flaky-test",
    title: "Fix the flaky checkout integration test",
    prompt:
      "The checkout integration test fails intermittently in CI. Find the race condition and make it deterministic.",
    mode: "code",
    repoId: "payments-api",
    branch: "main",
    status: "completed",
    createdAt: minsAgo(180),
    durationMs: 4 * 60_000 + 33_000,
    attempts: 1,
    plan: [
      { id: "p1", text: "Reproduce the flaky test locally", status: "done" },
      { id: "p2", text: "Identify the timing/race issue", status: "done" },
      { id: "p3", text: "Await the webhook before asserting", status: "done" },
    ],
    logs: [
      { id: "l1", kind: "command", text: "pytest tests/test_checkout.py -k webhook --count 20", ts: 1500 },
      { id: "l2", kind: "output", text: "18 passed, 2 failed (timeout waiting for webhook)", ts: 3200 },
      { id: "l3", kind: "reasoning", text: "The test asserts on the order status immediately after POSTing, but the webhook is processed asynchronously. Need to poll until the order settles.", ts: 4100 },
      { id: "l4", kind: "command", text: "applying patch to tests/test_checkout.py", ts: 4900 },
      { id: "l5", kind: "command", text: "pytest tests/test_checkout.py -k webhook --count 50", ts: 5800 },
      { id: "l6", kind: "output", text: "50 passed in 12.4s", ts: 7300 },
    ],
    diffs: [
      makeFileDiff(
        "tests/test_checkout.py",
        "modified",
        `@@ -34,9 +34,16 @@ def test_checkout_webhook(client):
     resp = client.post("/checkout", json=payload)
     assert resp.status_code == 202

-    order = client.get(f"/orders/{order_id}").json()
-    assert order["status"] == "paid"
+    # Webhook is processed asynchronously; poll until the order settles.
+    order = wait_for(
+        lambda: client.get(f"/orders/{order_id}").json(),
+        until=lambda o: o["status"] == "paid",
+        timeout=5.0,
+    )
+    assert order["status"] == "paid"
`
      ),
    ],
    summary:
      "The test asserted on order status immediately after the checkout POST, but the payment webhook is processed asynchronously, so it occasionally read a `pending` order. Replaced the immediate read with a `wait_for` poll (5s timeout). 50/50 runs now pass.",
    pr: {
      number: 1207,
      url: "https://github.com/acme/payments-api/pull/1207",
      status: "merged",
      title: "Make checkout webhook test deterministic",
    },
  },
  {
    id: "t-auth-question",
    title: "How does the auth token refresh flow work?",
    prompt:
      "Explain how the auth token refresh flow works in this service, and where the refresh token is stored.",
    mode: "ask",
    repoId: "payments-api",
    branch: "main",
    status: "completed",
    createdAt: minsAgo(95),
    durationMs: 51_000,
    attempts: 1,
    plan: [
      { id: "p1", text: "Locate the auth middleware and token logic", status: "done" },
      { id: "p2", text: "Trace the refresh flow", status: "done" },
    ],
    logs: [
      { id: "l1", kind: "command", text: "rg -n \"refresh_token\" src/", ts: 900 },
      { id: "l2", kind: "output", text: "src/auth/tokens.py:18\nsrc/auth/middleware.py:64", ts: 1600 },
      { id: "l3", kind: "reasoning", text: "Refresh tokens are stored hashed in Redis with a 30-day TTL; access tokens are short-lived JWTs.", ts: 2400 },
    ],
    diffs: [],
    summary:
      "Access tokens are short-lived (15 min) JWTs signed with `JWT_SECRET` in `src/auth/tokens.py`. On a 401, the client calls `POST /auth/refresh` with the refresh token, which `middleware.py` validates against a **hashed** copy stored in Redis (`refresh:{user_id}`) with a 30-day TTL. A successful refresh rotates the refresh token (the old one is revoked) and issues a new access token. Refresh tokens are never stored in plaintext and are not returned in API responses after issuance.",
  },
  {
    id: "t-react-upgrade",
    title: "Upgrade to React 19 and fix the resulting type errors",
    prompt:
      "Upgrade the app to React 19 and resolve any TypeScript errors that come up.",
    mode: "code",
    repoId: "web-dashboard",
    branch: "develop",
    status: "failed",
    createdAt: minsAgo(20),
    durationMs: 3 * 60_000 + 8_000,
    attempts: 1,
    plan: [
      { id: "p1", text: "Bump react and react-dom to 19", status: "done" },
      { id: "p2", text: "Install and typecheck", status: "done" },
      { id: "p3", text: "Resolve type errors", status: "active" },
    ],
    logs: [
      { id: "l1", kind: "command", text: "npm install react@19 react-dom@19", ts: 1400 },
      { id: "l2", kind: "output", text: "added 2 packages, changed 2 packages", ts: 3000 },
      { id: "l3", kind: "command", text: "npx tsc --noEmit", ts: 3800 },
      { id: "l4", kind: "error", text: "components/legacy/Chart.tsx(112,7): error TS2769: No overload matches this call.\nsrc/providers/RouterProvider.tsx(44,5): error TS2322: Type 'ReactNode' is not assignable...", ts: 5600 },
      { id: "l5", kind: "reasoning", text: "The legacy Chart component depends on a wrapper library that hasn't published React 19 types. This needs a dependency upgrade that's out of scope for an automated change.", ts: 7100 },
      { id: "l6", kind: "error", text: "Stopping: blocked on an upstream dependency (react-vintage-charts) that is incompatible with React 19.", ts: 8000 },
    ],
    diffs: [],
    summary:
      "Bumped React to 19, but the upgrade is blocked: `react-vintage-charts` (used by the legacy Chart component) has no React 19-compatible release, producing unavoidable type errors. Recommend replacing or forking that dependency before retrying.",
  },
  {
    // Seeded as queued and auto-started on load so the dashboard shows live motion.
    id: "t-csv-export",
    title: "Implement CSV export for the reports table",
    prompt:
      "Add a button to the reports table that exports the current rows to a CSV file, respecting active filters.",
    mode: "code",
    repoId: "web-dashboard",
    branch: "main",
    status: "queued",
    createdAt: minsAgo(1),
    attempts: 1,
    plan: [],
    logs: [],
    diffs: [],
  },
];
