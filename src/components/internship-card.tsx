import { CalendarClock, Clock, IndianRupee, MapPin } from "lucide-react";

import type { Internship } from "@/lib/content/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplyDialog } from "@/components/apply-dialog";

export function InternshipCard({ item, email }: { item: Internship; email: string }) {
  return (
    <article className="group relative flex h-full flex-col rounded-lg border bg-white p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.3)]">
      <span className="absolute inset-x-6 top-0 h-[2px] origin-left scale-x-0 gold-gradient transition-transform duration-500 group-hover:scale-x-100" />
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">{item.domain}</Badge>
        <span className="text-xs font-medium text-muted-foreground">{item.mode}</span>
      </div>
      <h3 className="mt-5 text-2xl leading-tight font-semibold text-ink">{item.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{item.organization}</p>
      <p className="mt-4 text-sm leading-relaxed text-foreground/80">{item.description}</p>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-5 text-sm">
        <Meta Icon={MapPin} label="Location" value={item.location} />
        <Meta Icon={Clock} label="Duration" value={item.duration} />
        <Meta Icon={IndianRupee} label="Stipend" value={item.stipend} />
        <Meta Icon={CalendarClock} label="Apply by" value={item.deadline} />
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="text-xs text-muted-foreground">
          {item.seats} {item.seats === 1 ? "seat" : "seats"}
        </span>
        <ApplyDialog title={item.title} email={email}>
          <Button size="sm">Apply now</Button>
        </ApplyDialog>
      </div>
    </article>
  );
}

function Meta({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-gold" />
      <div className="min-w-0">
        <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</dt>
        <dd className="truncate font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}
