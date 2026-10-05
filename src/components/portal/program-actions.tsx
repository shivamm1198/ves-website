"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProgram } from "@/lib/portal/actions";
import type { Program } from "@/lib/portal/types";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/admin/confirm-button";
import { ProgramDialog } from "@/components/portal/program-dialog";

export function NewProgramButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> New internship
      </Button>
      <ProgramDialog program={null} open={open} onOpenChange={setOpen} />
    </>
  );
}

/** Edit / delete controls for the president. `compact` renders icon buttons for cards. */
export function ProgramCardMenu({
  program,
  compact = true,
}: {
  program: Program;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const remove = async () => {
    setBusy(true);
    const res = await deleteProgram(program.id);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Deleted “${program.title}”`);
    router.push("/portal");
    router.refresh();
  };

  return (
    <div className="relative z-10 flex shrink-0 gap-1">
      <Button
        variant={compact ? "ghost" : "outline"}
        size={compact ? "icon-sm" : "default"}
        onClick={() => setOpen(true)}
        aria-label={`Edit ${program.title}`}
      >
        <Pencil /> {!compact && "Edit details"}
      </Button>
      <ConfirmAction
        title="Delete this internship?"
        description={
          <>
            “{program.title}” will be removed with all of its tasks, submissions, invite links and
            members. Uploaded files stay in storage. This can&apos;t be undone.
          </>
        }
        onConfirm={remove}
      >
        <Button
          variant="ghost"
          size={compact ? "icon-sm" : "icon"}
          disabled={busy}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${program.title}`}
        >
          <Trash2 />
        </Button>
      </ConfirmAction>
      <ProgramDialog program={program} open={open} onOpenChange={setOpen} />
    </div>
  );
}
