import { useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Copy,
  FileText,
  GraduationCap,
  Layers3,
  Radar,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import AnimatedList, {
  type AnimatedListItem,
} from "@/components/react-bits/animated-list";
import MagicTransform from "@/components/react-bits/magic-transform";
import SquareMatrix from "@/components/react-bits/square-matrix";
import TwilightLines from "@/components/react-bits/twilight-lines";

type Mode = "analysis" | "plan-topic" | "plan-artifact";
type Depth = "standard" | "deep";
type Role = "senior-engineer" | "backend" | "frontend" | "infra" | "architect" | "manager";
type Lang = "auto" | "zh" | "en";
type AgentTarget = "codex" | "codex-cli" | "claude-code";

const roles: Role[] = [
  "senior-engineer",
  "backend",
  "frontend",
  "infra",
  "architect",
  "manager",
];

const modeOptions = [
  {
    id: "analysis" as const,
    label: "Reverse analysis",
    description: "Reconstruct evolution, trade-offs, debt, and unresolved pain.",
    icon: Radar,
  },
  {
    id: "plan-topic" as const,
    label: "Plan from topic",
    description: "Create a senior-engineer learning plan from a technology name.",
    icon: GraduationCap,
  },
  {
    id: "plan-artifact" as const,
    label: "Plan from artifact",
    description: "Use an existing redo markdown artifact as the planning source.",
    icon: FileText,
  },
];

const agentTargets = [
  {
    id: "codex" as const,
    label: "Codex",
    hint: "Paste into Codex chat or select redo from the skill picker.",
  },
  {
    id: "codex-cli" as const,
    label: "Codex CLI",
    hint: "Paste into Codex CLI after installing the redo skill.",
  },
  {
    id: "claude-code" as const,
    label: "Claude Code",
    hint: "Paste as a Claude Code slash command.",
  },
];

const quoteIfNeeded = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /\s/.test(trimmed) ? `"${trimmed.replace(/"/g, '\\"')}"` : trimmed;
};

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-[#f6eee4] outline-none transition placeholder:text-[#776d62] focus:border-[#f1c46d] disabled:opacity-45";

export function App() {
  const [mode, setMode] = useState<Mode>("plan-topic");
  const [subject, setSubject] = useState("kafka");
  const [artifactPath, setArtifactPath] = useState("kafka.md");
  const [role, setRole] = useState<Role>("senior-engineer");
  const [depth, setDepth] = useState<Depth>("standard");
  const [days, setDays] = useState(7);
  const [daily, setDaily] = useState("45m");
  const [brief, setBrief] = useState(false);
  const [includeAnalysis, setIncludeAnalysis] = useState(false);
  const [lang, setLang] = useState<Lang>("auto");
  const [agentTarget, setAgentTarget] = useState<AgentTarget>("codex");
  const [copied, setCopied] = useState(false);

  const redoCommand = useMemo(() => {
    const args: string[] = [];

    if (mode === "analysis") {
      args.push("redo", quoteIfNeeded(subject) || "<topic>");
    }

    if (mode === "plan-topic") {
      args.push("redo", quoteIfNeeded(subject) || "<topic>", "--plan");
      if (includeAnalysis) args.push("--include-analysis");
    }

    if (mode === "plan-artifact") {
      args.push("redo", "plan", quoteIfNeeded(artifactPath) || "<artifact-path>");
    }

    if (mode !== "analysis") {
      if (brief) args.push("--brief");
      args.push("--days", String(days));
      args.push("--daily", daily);
      args.push("--role", role);
      args.push("--depth", depth);
    } else if (depth === "deep") {
      args.push("--depth", depth);
    }

    if (lang !== "auto") args.push("--lang", lang);

    return args.join(" ");
  }, [artifactPath, brief, daily, days, depth, includeAnalysis, lang, mode, role, subject]);

  const agentInvocation = useMemo(() => {
    if (agentTarget === "claude-code") {
      return redoCommand.replace(/^redo\b/, "/redo");
    }

    return redoCommand.replace(/^redo\b/, "$redo");
  }, [agentTarget, redoCommand]);

  const selectedAgent = agentTargets.find((target) => target.id === agentTarget);

  const explanationItems = useMemo<AnimatedListItem[]>(() => {
    const items = [
      {
        id: "agent",
        content: (
          <CommandNote
            label="Agent"
            value={`${selectedAgent?.label ?? "Codex"} format: paste the invocation into the AI tool, not a terminal.`}
          />
        ),
      },
      {
        id: "mode",
        content: (
          <CommandNote
            label="Mode"
            value={
              mode === "analysis"
                ? "Full redo analysis"
                : mode === "plan-topic"
                  ? "Learning plan generated from a topic"
                  : "Learning plan generated from an existing artifact"
            }
          />
        ),
      },
      {
        id: "brief",
        content: (
          <CommandNote
            label="Scan level"
            value={brief ? "--brief: one-page scan, fast to review" : "Standard: day-by-day plan with required outputs"}
          />
        ),
      },
      {
        id: "depth",
        content: (
          <CommandNote
            label="Depth"
            value={depth === "deep" ? "Deep mode adds source verification and limited hands-on checks" : "Standard mode keeps the output focused"}
          />
        ),
      },
      {
        id: "language",
        content: (
          <CommandNote
            label="Language"
            value={lang === "auto" ? "Auto: follow the conversation language" : lang === "zh" ? "Force Chinese output" : "Force English output"}
          />
        ),
      },
    ];

    if (mode === "plan-topic" && includeAnalysis) {
      items.splice(1, 0, {
        id: "include-analysis",
        content: (
          <CommandNote
            label="Analysis"
            value="Include the full redo analysis before the learning plan"
          />
        ),
      });
    }

    return items;
  }, [brief, depth, includeAnalysis, lang, mode, selectedAgent?.label]);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(agentInvocation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f6eee4]">
      <SquareMatrix
        backgroundColor="#050505"
        baseBrightness={0.03}
        cellGap={0.22}
        className="pointer-events-none fixed inset-0 opacity-55"
        color="#7c8d77"
        cornerRadius={0.22}
        cursorInteraction={false}
        gridSize={18}
        opacity={0.62}
        peakBrightness={0.72}
        preset={1}
        speed={0.16}
        waveAmplitude={0.34}
        waveFrequency={0.85}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(241,196,109,0.13),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(104,143,114,0.16),transparent_34%),linear-gradient(180deg,rgba(5,5,5,0.18),#050505_82%)]" />

      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="grid overflow-hidden rounded-[34px] border border-white/10 bg-[#0b0a09]/86 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)]">
          <div className="relative z-10 p-7 text-[#fffaf3] sm:p-9 lg:p-11">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f1c46d]">
              ReDerive command lab
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-normal md:text-6xl">
              Generate the exact redo invocation for Codex or Claude Code.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[#d8d0c6] md:text-lg">
              Pick a path, tune the learning depth, and copy a complete agent prompt for reverse analysis or senior-engineer learning plans.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-[#e8ded2]">
              <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-2">constraint-first</span>
              <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-2">debt map</span>
              <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-2">learning plan</span>
            </div>
          </div>

          <div className="relative min-h-[300px] border-t border-white/10 lg:border-l lg:border-t-0">
            <TwilightLines
              backgroundColor="#070707"
              className="absolute inset-0"
              cursorInteraction
              lineColor="#8aa884"
              lineCount={5}
              lineGlow={0.014}
              lineIntensity={2.4}
              opacity={0.92}
              pulseColor="#f1c46d"
              pulseIntensity={4.2}
              pulseSpeed={0.18}
              waveAmplitude={0.36}
              waveFrequency={2.1}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(241,196,109,0.18),transparent_34%),linear-gradient(90deg,rgba(7,7,7,0.08),rgba(7,7,7,0.72))]" />
            <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-end p-7 text-[#fffaf3]">
              <div className="max-w-sm rounded-2xl border border-white/12 bg-black/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1c46d]">
                  Live command surface
                </p>
                <p className="mt-3 text-sm leading-6 text-[#d8d0c6]">
                  The visual language should feel like constraints being traced into decisions, not a decorative logo slot.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid items-stretch gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="space-y-5">
            <Panel title="1. Choose the redo path" icon={WandSparkles}>
              <div className="grid gap-3 md:grid-cols-3">
                {modeOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = mode === option.id;
                  return (
                    <button
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#f1c46d]/70 bg-[#f1c46d] text-[#14110d]"
                          : "border-white/10 bg-white/[0.055] text-[#f6eee4] hover:border-white/24 hover:bg-white/[0.08]"
                      }`}
                      key={option.id}
                      onClick={() => setMode(option.id)}
                      type="button"
                    >
                      <Icon size={18} />
                      <span className="mt-5 block text-sm font-semibold">{option.label}</span>
                      <span className={`mt-2 block text-xs leading-5 ${selected ? "text-[#3b2f1f]" : "text-[#aaa095]"}`}>
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel title="2. Fill the source" icon={Clipboard}>
              <div className="grid gap-4 md:grid-cols-2">
                {mode !== "plan-artifact" ? (
                  <Field label="Topic">
                    <input
                      className={inputClass}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="kafka, react, postgres..."
                      value={subject}
                    />
                  </Field>
                ) : (
                  <Field label="Artifact path">
                    <input
                      className={inputClass}
                      onChange={(event) => setArtifactPath(event.target.value)}
                      placeholder="kafka.md"
                      value={artifactPath}
                    />
                  </Field>
                )}

                <Field label="Language">
                  <select
                    className={inputClass}
                    onChange={(event) => setLang(event.target.value as Lang)}
                    value={lang}
                  >
                    <option value="auto">Auto</option>
                    <option value="zh">Chinese</option>
                    <option value="en">English</option>
                  </select>
                </Field>
              </div>
            </Panel>

            <Panel title="3. Tune the plan" icon={Layers3}>
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Role">
                  <select
                    className={inputClass}
                    disabled={mode === "analysis"}
                    onChange={(event) => setRole(event.target.value as Role)}
                    value={role}
                  >
                    {roles.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Depth">
                  <select
                    className={inputClass}
                    onChange={(event) => setDepth(event.target.value as Depth)}
                    value={depth}
                  >
                    <option value="standard">standard</option>
                    <option value="deep">deep</option>
                  </select>
                </Field>
                <Field label="Days">
                  <input
                    className={inputClass}
                    disabled={mode === "analysis"}
                    min={1}
                    onChange={(event) => setDays(Number(event.target.value))}
                    type="number"
                    value={days}
                  />
                </Field>
                <Field label="Daily budget">
                  <input
                    className={inputClass}
                    disabled={mode === "analysis"}
                    onChange={(event) => setDaily(event.target.value)}
                    value={daily}
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Toggle
                  checked={brief}
                  disabled={mode === "analysis"}
                  className="min-h-[112px]"
                  label="One-page scan"
                  note="Adds --brief for a fast executive-style learning path."
                  onClick={() => setBrief((value) => !value)}
                />
                <Toggle
                  checked={includeAnalysis}
                  disabled={mode !== "plan-topic"}
                  className="min-h-[112px]"
                  label="Include full analysis"
                  note="Adds --include-analysis before the learning plan."
                  onClick={() => setIncludeAnalysis((value) => !value)}
                />
              </div>
            </Panel>
          </div>

          <aside className="min-h-0">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0a09]/88 p-4 text-[#fffaf3] shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:h-[706px]">
              <div className="h-44 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#11100e]">
                <MagicTransform
                  centerContent={<Sparkles size={30} />}
                  classNames={{
                    axis: "bg-[#8f6cff]",
                    center: "border border-white/14 bg-[#f1c46d] text-[#11100d] shadow-[0_18px_70px_rgba(241,196,109,0.24)]",
                    document:
                      "border-white/10 bg-[#15130f] shadow-[0_16px_50px_rgba(0,0,0,0.38)]",
                    particle: "opacity-80",
                    result: "opacity-90",
                    resultBody: "drop-shadow-[0_14px_28px_rgba(0,0,0,0.35)]",
                  }}
                  className="h-full"
                  documentDuration={2.4}
                  documentHeight={270}
                  documentWidth={190}
                  height="100%"
                  results={[
                    { id: "constraint", label: "constraint", color: "#8b5e34" },
                    { id: "debt", label: "debt", color: "#d85f3d" },
                    { id: "pattern", label: "pattern", color: "#688f72" },
                    { id: "plan", label: "plan", color: "#1f1d1b" },
                  ]}
                />
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-semibold text-[#f6eee4]">AI agent invocation</span>
                  <p className="mt-1 text-xs leading-5 text-[#9d948a]">
                    Copy this into {selectedAgent?.label}; it is not a shell command.
                  </p>
                </div>
                <button
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#f1c46d] px-3 text-xs font-semibold text-[#1f1d1b] transition hover:bg-[#ffd77d]"
                  onClick={copyCommand}
                  type="button"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {agentTargets.map((target) => (
                  <button
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                      agentTarget === target.id
                        ? "border-[#f1c46d]/70 bg-[#f1c46d] text-[#15110c]"
                        : "border-white/10 bg-white/[0.055] text-[#bdb4aa] hover:border-white/24"
                    }`}
                    key={target.id}
                    onClick={() => setAgentTarget(target.id)}
                    type="button"
                  >
                    {target.label}
                  </button>
                ))}
              </div>

              <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-[#15130f] p-4 font-mono text-sm leading-6 text-[#fffaf3]">
                {agentInvocation}
              </pre>
              <p className="mt-2 text-xs leading-5 text-[#8f867c]">{selectedAgent?.hint}</p>

              <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-white/10 pt-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#f6eee4]">
                  <Sparkles size={16} />
                  What this invocation means
                </div>
                <AnimatedList
                  animationType="blur"
                  autoAddDelay={0}
                  className="rounded-2xl"
                  fadeColor="#0b0a09"
                  fadeEdgeSize={36}
                  height="100%"
                  items={explanationItems}
                  itemGap={8}
                  startFrom="top"
                />
              </div>
            </div>
          </aside>
        </section>

      </section>
    </main>
  );
}

function Panel({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#0b0a09]/72 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon size={16} />
        {title}
      </div>
      {children}
    </section>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#f1c46d]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  className,
  disabled,
  label,
  note,
  onClick,
}: {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  label: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-[#f1c46d]/70 bg-[#f1c46d] text-[#15110c]"
          : "border-white/10 bg-white/[0.055] text-[#f6eee4]"
      } ${disabled ? "cursor-not-allowed opacity-35" : "hover:border-white/24 hover:bg-white/[0.08]"} ${className ?? ""}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-3 text-sm font-semibold">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${checked ? "border-[#15110c] bg-[#15110c] text-[#f1c46d]" : "border-white/22"}`}>
          {checked && <Check size={13} />}
        </span>
        {label}
      </span>
      <span className={`mt-2 block text-xs leading-5 ${checked ? "text-[#3f321f]" : "text-[#aaa095]"}`}>
        {note}
      </span>
    </button>
  );
}

function CommandNote({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f1c46d]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[#efe7dc]">{value}</p>
    </div>
  );
}
