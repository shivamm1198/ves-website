"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { indiaStates } from "@/lib/india";
import { memberTotals } from "@/lib/content/derive";
import type { SiteContent } from "@/lib/content/schema";
import { Input } from "@/components/ui/input";
import { IndiaMap } from "@/components/home/india-map";
import { NumberInput } from "./fields";

type StateMembers = SiteContent["stateMembers"];

const sortedStates = [...indiaStates].sort((a, b) => a.name.localeCompare(b.name));

/** Members and cities for every state, with a live preview of the homepage map. */
export function MapEditor({
  value,
  onChange,
}: {
  value: StateMembers;
  onChange: (next: StateMembers) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [onlyActive, setOnlyActive] = React.useState(false);
  const { total, states } = memberTotals(value);

  const update = (id: string, patch: Partial<StateMembers[string]>) => {
    const current = value[id] ?? { members: 0, cities: [] };
    const next = { ...current, ...patch };
    const copy = { ...value };
    if (next.members === 0 && next.cities.length === 0) delete copy[id];
    else copy[id] = next;
    onChange(copy);
  };

  const q = query.trim().toLowerCase();
  const rows = sortedStates.filter(
    (s) =>
      (!q || s.name.toLowerCase().includes(q)) && (!onlyActive || (value[s.id]?.members ?? 0) > 0),
  );

  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-ink tabular-nums">
              {total.toLocaleString("en-IN")}
            </span>{" "}
            members in <span className="font-medium text-ink">{states}</span> states & UTs
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs whitespace-nowrap text-muted-foreground">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
                className="accent-[var(--ink)]"
              />
              Only states with members
            </label>
            <label className="relative">
              <span className="sr-only">Find a state</span>
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a state"
                className="h-9 w-40 bg-white pl-8 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="hidden grid-cols-[1fr_7rem_1.4fr] gap-3 border-b bg-paper px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid">
            <span>State / UT</span>
            <span>Members</span>
            <span>Chapter cities (comma separated)</span>
          </div>
          <ul className="divide-y">
            {rows.map((state) => {
              const entry = value[state.id];
              return (
                <li
                  key={state.id}
                  className="grid grid-cols-[1fr_6rem] items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:grid-cols-[1fr_7rem_1.4fr]"
                >
                  <span
                    className={cn(
                      "text-sm",
                      entry?.members ? "font-medium text-ink" : "text-muted-foreground",
                    )}
                  >
                    {state.name}
                  </span>
                  <NumberInput
                    value={entry?.members ?? 0}
                    min={0}
                    onChange={(n) => update(state.id, { members: n })}
                    aria-label={`Members in ${state.name}`}
                    className="h-9"
                  />
                  <CitiesInput
                    value={entry?.cities ?? []}
                    onChange={(cities) => update(state.id, { cities })}
                    label={`Cities in ${state.name}`}
                  />
                </li>
              );
            })}
            {rows.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No states match.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="max-w-md 2xl:sticky 2xl:top-6 2xl:max-w-none 2xl:self-start">
        <p className="mb-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Live preview
        </p>
        <IndiaMap stateMembers={value} />
      </div>
    </div>
  );
}

/** Free-text city list; keeps what's typed and reports the parsed list. */
function CitiesInput({
  value,
  onChange,
  label,
}: {
  value: string[];
  onChange: (cities: string[]) => void;
  label: string;
}) {
  const parse = (text: string) =>
    text
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  const [text, setText] = React.useState(value.join(", "));
  // Show outside changes (discard, reset) when they differ from what's typed.
  const shown = parse(text).join("|") === value.join("|") ? text : value.join(", ");

  return (
    <Input
      value={shown}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parse(e.target.value));
      }}
      placeholder="e.g. Jaipur, Jodhpur"
      aria-label={label}
      className="col-span-2 h-9 bg-white sm:col-span-1"
    />
  );
}
