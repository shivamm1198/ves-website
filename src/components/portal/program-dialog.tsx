"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { saveProgram } from "@/lib/portal/actions";
import type { Program } from "@/lib/portal/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorNote } from "@/components/admin/events-manager";

/** Create or edit an internship programme (president only). */
export function ProgramDialog({
  program,
  open,
  onOpenChange,
}: {
  program: Program | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <ProgramForm
            key={program?.id ?? "new"}
            program={program}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProgramForm({ program, onDone }: { program: Program | null; onDone: () => void }) {
  const router = useRouter();
  const [form, setForm] = React.useState({
    title: program?.title ?? "",
    description: program?.description ?? "",
    start_date: program?.start_date ?? "",
    end_date: program?.end_date ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await saveProgram(program?.id ?? null, form);
    setSaving(false);
    if (!res.ok) return setError(res.error);
    toast.success(program ? "Internship updated" : "Internship created");
    onDone();
    if (program) router.refresh();
    else router.push(`/portal/programs/${res.data.id}`);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">
          {program ? "Edit internship" : "New internship"}
        </DialogTitle>
        <DialogDescription>
          {program
            ? "Interns and coordinators see these details on their dashboard."
            : "After creating it, add a coordinator and send interns their invite link."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="program-title">Name</Label>
        <Input
          id="program-title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Legal Research Internship · Winter 2026"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="program-start">Starts on</Label>
          <Input
            id="program-start"
            type="date"
            value={form.start_date}
            onChange={(e) => set("start_date", e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="program-end">Ends on</Label>
          <Input
            id="program-end"
            type="date"
            min={form.start_date || undefined}
            value={form.end_date}
            onChange={(e) => set("end_date", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="program-description">
          About this internship{" "}
          <span className="font-normal text-muted-foreground">· optional</span>
        </Label>
        <Textarea
          id="program-description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder="What interns will work on, how they'll be guided, and what they'll get at the end."
        />
      </div>
      {error && <ErrorNote message={error} />}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {program ? "Save changes" : "Create internship"}
        </Button>
      </DialogFooter>
    </form>
  );
}
