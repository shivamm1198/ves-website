import { CheckCircle2, CircleDashed, Clock, Loader2, PenLine, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  programStatusLabel,
  type Performance,
  type ProgramStatus,
  type TaskState,
} from "@/lib/portal/progress";

export const selectClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-full gold-gradient transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

const programTone: Record<ProgramStatus, string> = {
  upcoming: "border-foreground/15 text-foreground/70",
  ongoing: "border-gold/40 bg-gold/10 text-gold-dark",
  ended: "border-transparent bg-ink text-white",
};

export function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        programTone[status],
      )}
    >
      {programStatusLabel[status]}
    </span>
  );
}

const taskTone: Record<TaskState, { label: string; Icon: typeof Clock; className: string }> = {
  done: {
    label: "Completed",
    Icon: CheckCircle2,
    className: "border-emerald-600/20 bg-emerald-50 text-emerald-800",
  },
  "done-late": {
    label: "Completed late",
    Icon: CheckCircle2,
    className: "border-amber-600/25 bg-amber-50 text-amber-800",
  },
  "in-progress": {
    label: "Draft saved",
    Icon: PenLine,
    className: "border-gold/40 bg-gold/10 text-gold-dark",
  },
  todo: {
    label: "To do",
    Icon: CircleDashed,
    className: "border-foreground/15 text-foreground/70",
  },
  overdue: {
    label: "Overdue",
    Icon: TriangleAlert,
    className: "border-destructive/25 bg-destructive/5 text-destructive",
  },
};

export function TaskStateBadge({ state, className }: { state: TaskState; className?: string }) {
  const { label, Icon, className: tone } = taskTone[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-white px-4 py-4", className)}>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-serif text-3xl font-semibold text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Ring showing a completion percentage. */
export function RateRing({ rate, size = 132 }: { rate: number; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ves-ring)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - rate / 100)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="ves-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-gold-light)" />
            <stop offset="100%" stopColor="var(--color-gold-dark)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-center">
        <span className="block font-serif text-4xl font-semibold text-ink tabular-nums">
          {rate}%
        </span>
        <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          completed
        </span>
      </span>
    </div>
  );
}

/** One-line summary used in admin tables. */
export function PerformanceSummary({ perf }: { perf: Performance }) {
  return (
    <div className="min-w-40">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-medium text-ink tabular-nums">
          {perf.completed}/{perf.total} done
        </span>
        <span className="text-muted-foreground tabular-nums">{perf.rate}%</span>
      </div>
      <ProgressBar value={perf.rate} className="mt-1.5 h-1.5" />
    </div>
  );
}

export function PageFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-label="Loading" />
    </div>
  );
}
