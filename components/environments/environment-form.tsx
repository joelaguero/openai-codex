"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Globe,
  Lock,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Environment, EnvVar, Secret } from "@/lib/types";

const BASE_IMAGES = [
  "universal-node-22",
  "universal-python-3.12",
  "universal-ubuntu-24",
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function mask(value: string): string {
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
}

export function EnvironmentForm({ env }: { env: Environment }) {
  const repos = useStore((s) => s.repos);
  const updateEnvironment = useStore((s) => s.updateEnvironment);
  const repo = repos.find((r) => r.id === env.repoId);

  const [baseImage, setBaseImage] = useState(env.baseImage);
  const [setupScript, setSetupScript] = useState(env.setupScript);
  const [envVars, setEnvVars] = useState<EnvVar[]>(env.envVars);
  const [secrets, setSecrets] = useState<Secret[]>(env.secrets);
  const [networkAccess, setNetworkAccess] = useState(env.networkAccess);
  const [allowedDomains, setAllowedDomains] = useState<string[]>(
    env.allowedDomains
  );
  const [newSecret, setNewSecret] = useState({ key: "", value: "" });
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateEnvironment(env.id, {
      baseImage,
      setupScript,
      envVars: envVars.filter((v) => v.key.trim()),
      secrets,
      networkAccess,
      allowedDomains: allowedDomains.filter((d) => d.trim()),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">{env.name}</h2>
        <p className="text-sm text-muted-foreground">{repo?.fullName}</p>
      </div>

      <Field label="Base image" hint="Container the task runs in">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <span className="font-mono">{baseImage}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {BASE_IMAGES.map((img) => (
              <DropdownMenuItem key={img} onSelect={() => setBaseImage(img)}>
                <span className="flex-1 font-mono text-sm">{img}</span>
                {img === baseImage && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>

      <Field label="Setup script" hint="Runs after checkout, before the agent">
        <Textarea
          value={setupScript}
          onChange={(e) => setSetupScript(e.target.value)}
          className="min-h-[120px] font-mono text-xs"
          spellCheck={false}
        />
      </Field>

      <Field label="Environment variables">
        <div className="space-y-2">
          {envVars.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={v.key}
                placeholder="KEY"
                className="font-mono"
                onChange={(e) =>
                  setEnvVars((arr) =>
                    arr.map((x, j) =>
                      j === i ? { ...x, key: e.target.value } : x
                    )
                  )
                }
              />
              <Input
                value={v.value}
                placeholder="value"
                className="font-mono"
                onChange={(e) =>
                  setEnvVars((arr) =>
                    arr.map((x, j) =>
                      j === i ? { ...x, value: e.target.value } : x
                    )
                  )
                }
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove variable"
                onClick={() =>
                  setEnvVars((arr) => arr.filter((_, j) => j !== i))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEnvVars((arr) => [...arr, { key: "", value: "" }])}
          >
            <Plus className="h-4 w-4" />
            Add variable
          </Button>
        </div>
      </Field>

      <Field label="Secrets" hint="Values are write-only and never shown again">
        <div className="space-y-2">
          {secrets.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
            >
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{s.key}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {s.preview}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto"
                aria-label="Remove secret"
                onClick={() =>
                  setSecrets((arr) => arr.filter((_, j) => j !== i))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newSecret.key}
              placeholder="SECRET_NAME"
              className="font-mono"
              onChange={(e) =>
                setNewSecret((s) => ({ ...s, key: e.target.value }))
              }
            />
            <Input
              value={newSecret.value}
              placeholder="value"
              type="password"
              className="font-mono"
              onChange={(e) =>
                setNewSecret((s) => ({ ...s, value: e.target.value }))
              }
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={!newSecret.key.trim() || !newSecret.value}
              onClick={() => {
                setSecrets((arr) => [
                  ...arr,
                  {
                    key: newSecret.key.trim(),
                    value: "",
                    preview: mask(newSecret.value),
                  },
                ]);
                setNewSecret({ key: "", value: "" });
              }}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </Field>

      <Field label="Network access" hint={networkAccess ? "On" : "Off"}>
        <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-sm">
            Allow outbound network during the task
          </span>
          <Switch checked={networkAccess} onCheckedChange={setNetworkAccess} />
        </div>
        {networkAccess && (
          <div className="mt-2 space-y-2">
            <div className="text-xs text-muted-foreground">Allowed domains</div>
            {allowedDomains.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={d}
                  placeholder="example.com"
                  className="font-mono"
                  onChange={(e) =>
                    setAllowedDomains((arr) =>
                      arr.map((x, j) => (j === i ? e.target.value : x))
                    )
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove domain"
                  onClick={() =>
                    setAllowedDomains((arr) => arr.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAllowedDomains((arr) => [...arr, ""])}
            >
              <Plus className="h-4 w-4" />
              Add domain
            </Button>
          </div>
        )}
      </Field>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button onClick={save}>
          <Save className="h-4 w-4" />
          Save changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-success">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
