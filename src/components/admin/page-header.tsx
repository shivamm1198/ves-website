export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b bg-white px-5 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:py-9">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.22em] text-gold-dark uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-4xl font-semibold text-ink">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
