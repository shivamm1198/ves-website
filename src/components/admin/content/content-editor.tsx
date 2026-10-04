"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { defaultContent } from "@/data/site";
import type { ContentKey, SiteContent } from "@/lib/content/schema";
import { resetContentSection, saveContentSection } from "@/lib/admin/content-actions";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmAction } from "@/components/admin/confirm-button";
import { RelativeTime } from "@/components/admin/relative-time";
import { FieldsGrid, ListEditor } from "./fields";
import { MapEditor } from "./map-editor";
import { sectionGroups, sections, type SectionDef } from "./sections";

type Obj = Record<string, unknown>;
type UpdatedAt = Partial<Record<ContentKey, string>>;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function ContentEditor({
  initial,
  updatedAt: initialUpdatedAt,
  loadError,
}: {
  initial: SiteContent;
  updatedAt: UpdatedAt;
  loadError?: string;
}) {
  const [saved, setSaved] = React.useState(initial);
  const [draft, setDraft] = React.useState(initial);
  const [updatedAt, setUpdatedAt] = React.useState(initialUpdatedAt);
  const [active, setActive] = React.useState<ContentKey>("site");
  // Bumped on discard/reset so list editors rebuild their row ids.
  const [version, setVersion] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  const section = sections.find((s) => s.key === active)!;
  const dirtyKeys = sections.filter((s) => !same(draft[s.key], saved[s.key])).map((s) => s.key);
  const isDirty = dirtyKeys.includes(active);

  // Warn before leaving the page with unsaved edits.
  React.useEffect(() => {
    if (dirtyKeys.length === 0) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirtyKeys.length]);

  const setSection = (value: unknown) =>
    setDraft((d) => ({ ...d, [active]: value }) as SiteContent);

  const save = async () => {
    setSaving(true);
    const res = await saveContentSection(active, draft[active]);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error, { duration: 8000 });
      return;
    }
    setSaved((s) => ({ ...s, [active]: draft[active] }));
    setUpdatedAt((u) => ({ ...u, [active]: res.data.updatedAt }));
    toast.success(`${section.title} saved — the website is updated.`);
  };

  const discard = () => {
    setDraft((d) => ({ ...d, [active]: saved[active] }));
    setVersion((v) => v + 1);
  };

  const reset = async () => {
    const res = await resetContentSection(active);
    if (!res.ok) return toast.error(res.error);
    setDraft((d) => ({ ...d, [active]: defaultContent[active] }));
    setSaved((s) => ({ ...s, [active]: defaultContent[active] }));
    setUpdatedAt((u) => ({ ...u, [active]: undefined }));
    setVersion((v) => v + 1);
    toast.success(`${section.title} restored to the original content.`);
  };

  // Ctrl/Cmd + S saves the open section.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty && !saving) void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Homepage editor"
        description="Edit every section of the website. Each section saves separately and goes live immediately."
      />
      {loadError && (
        <p className="mx-5 mt-5 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive sm:mx-8">
          Couldn&apos;t load saved content ({loadError}). Showing the defaults.
        </p>
      )}

      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[230px_1fr]">
        {/* Section picker */}
        <nav aria-label="Sections" className="lg:sticky lg:top-6 lg:self-start">
          <label className="lg:hidden">
            <span className="sr-only">Section</span>
            <select
              value={active}
              onChange={(e) => setActive(e.target.value as ContentKey)}
              className="h-11 w-full rounded-md border bg-white px-3 text-sm"
            >
              {sectionGroups.map((g) => (
                <optgroup key={g} label={g}>
                  {sections
                    .filter((s) => s.group === g)
                    .map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.title}
                        {dirtyKeys.includes(s.key) ? " •" : ""}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div className="hidden flex-col gap-5 lg:flex">
            {sectionGroups.map((g) => (
              <div key={g}>
                <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {g}
                </p>
                <ul className="flex flex-col">
                  {sections
                    .filter((s) => s.group === g)
                    .map(({ key, title, Icon }) => (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => setActive(key)}
                          aria-current={active === key ? "true" : undefined}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                            active === key
                              ? "bg-white font-medium text-ink shadow-sm ring-1 ring-border"
                              : "text-foreground/65 hover:bg-white/70 hover:text-ink",
                          )}
                        >
                          <Icon className={cn("size-4", active === key && "text-gold")} />
                          <span className="flex-1 truncate">{title}</span>
                          {dirtyKeys.includes(key) && (
                            <span className="size-1.5 rounded-full bg-gold" aria-label="Unsaved" />
                          )}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Active section */}
        <section aria-labelledby="section-title" className="min-w-0">
          <div className="rounded-xl border bg-white">
            <div className="flex flex-col gap-3 border-b px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div>
                <h2
                  id="section-title"
                  className="flex items-center gap-2.5 text-3xl font-semibold text-ink"
                >
                  <section.Icon className="size-5 text-gold" />
                  {section.title}
                </h2>
                <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                  {section.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {updatedAt[active] ? (
                    <>
                      Last saved <RelativeTime date={updatedAt[active]!} />
                    </>
                  ) : (
                    "Showing the original content — not customised yet."
                  )}
                </p>
              </div>
              {updatedAt[active] && (
                <ConfirmAction
                  title="Restore the original content?"
                  description={`Your saved “${section.title}” will be replaced by the content the website shipped with.`}
                  confirmLabel="Restore"
                  onConfirm={reset}
                >
                  <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground">
                    <RotateCcw /> Restore original
                  </Button>
                </ConfirmAction>
              )}
            </div>

            <div className="bg-paper/40 p-5 sm:p-6">
              <SectionForm
                key={`${active}-${version}`}
                section={section}
                value={draft[active]}
                onChange={setSection}
              />
            </div>
          </div>

          {/* Save bar */}
          <AnimatePresence>
            {isDirty && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="sticky bottom-4 z-20 mt-4 flex flex-col gap-3 rounded-xl bg-ink px-5 py-3.5 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="flex items-center gap-2 text-sm">
                  <span className="size-2 rounded-full bg-gold-light" />
                  Unsaved changes in {section.title}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={discard}
                    disabled={saving}
                    className="text-white/75 hover:bg-white/10 hover:text-white"
                  >
                    Discard
                  </Button>
                  <Button variant="gold" size="sm" onClick={save} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" /> : <Save />}
                    {saving ? "Saving…" : "Save & publish"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </>
  );
}

function SectionForm({
  section,
  value,
  onChange,
}: {
  section: SectionDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (section.shape) {
    case "object":
      return (
        <FieldsGrid
          fields={section.fields}
          value={value as Obj}
          onChange={onChange}
          idPrefix={section.key}
        />
      );
    case "list":
      return (
        <ListEditor
          items={value as Obj[]}
          onChange={onChange}
          fields={section.itemFields}
          noun={section.itemNoun}
          title={section.itemTitle}
          subtitle={section.itemSubtitle}
          newItem={section.newItem}
          fixed={section.fixed}
          idPrefix={section.key}
        />
      );
    case "map":
      return <MapEditor value={value as SiteContent["stateMembers"]} onChange={onChange} />;
  }
}
