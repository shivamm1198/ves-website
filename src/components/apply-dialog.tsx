"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Application form. There is no backend yet, so submitting opens the
 * applicant's mail app with a pre-filled email to VES.
 */
export function ApplyDialog({
  title,
  email,
  children,
}: {
  title: string;
  email: string;
  children: React.ReactNode;
}) {
  const [sent, setSent] = React.useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `College: ${data.get("college")}`,
      `Year of study: ${data.get("year")}`,
      "",
      String(data.get("note") ?? ""),
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `Application: ${title}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <Dialog onOpenChange={(open) => !open && setSent(false)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <CheckCircle2 className="size-10 text-gold" strokeWidth={1.5} />
              <DialogTitle>Almost there</DialogTitle>
              <DialogDescription className="max-w-xs">
                Your email app has opened with your application. Attach your CV and hit send — our
                Internship Wing replies within 5 working days.
              </DialogDescription>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DialogHeader>
                <p className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
                  Apply
                </p>
                <DialogTitle className="leading-tight">{title}</DialogTitle>
                <DialogDescription>
                  Share a few details and we&apos;ll get back to you.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="College / University" name="college" required />
                  <Field label="Year of study" name="year" placeholder="e.g. 3rd year, BA LL.B." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Why this internship?</Label>
                  <Textarea id="note" name="note" placeholder="A few lines about your interest" />
                </div>
                <Button type="submit" size="lg" className="mt-2">
                  Send application
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.ComponentProps<"input">) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}
