"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquareText, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { reviewSubmission } from "@/lib/portal/actions";
import { formatDateTime } from "@/lib/portal/format";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmAction } from "@/components/admin/confirm-button";

/** Feedback for an intern; optionally sends the work back so they can edit and resubmit. */
export function ReviewForm({
  submissionId,
  submitted,
  feedback,
  reviewedAt,
}: {
  submissionId: string;
  submitted: boolean;
  feedback: string;
  reviewedAt: string | null;
}) {
  const router = useRouter();
  const [text, setText] = React.useState(feedback);
  const [busy, setBusy] = React.useState<"save" | "return" | null>(null);

  const send = async (returnForChanges: boolean) => {
    setBusy(returnForChanges ? "return" : "save");
    const res = await reviewSubmission(submissionId, text, returnForChanges);
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(
      returnForChanges
        ? "Sent back to the intern for changes"
        : "Feedback saved. The intern can see it.",
    );
    router.refresh();
  };

  return (
    <section className="rounded-xl border bg-paper p-5">
      <Label htmlFor="feedback" className="flex items-center gap-2 text-base font-medium text-ink">
        <MessageSquareText className="size-4 text-gold" /> Feedback for the intern
      </Label>
      <p className="mt-1 text-xs text-muted-foreground">
        {reviewedAt ? `Last reviewed ${formatDateTime(reviewedAt)}. ` : ""}
        The intern sees this on the task page.
      </p>
      <Textarea
        id="feedback"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        maxLength={5000}
        placeholder="What worked well, what to improve…"
        className="mt-3 bg-white"
      />
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {submitted && (
          <ConfirmAction
            title="Return for changes?"
            description="The task reopens for the intern so they can edit and complete it again. It no longer counts as completed until they do."
            confirmLabel="Return for changes"
            onConfirm={() => send(true)}
          >
            <Button variant="outline" disabled={busy !== null}>
              {busy === "return" ? <Loader2 className="animate-spin" /> : <RotateCcw />}
              Return for changes
            </Button>
          </ConfirmAction>
        )}
        <Button onClick={() => send(false)} disabled={busy !== null || !text.trim()}>
          {busy === "save" && <Loader2 className="animate-spin" />}
          Save feedback
        </Button>
      </div>
    </section>
  );
}
