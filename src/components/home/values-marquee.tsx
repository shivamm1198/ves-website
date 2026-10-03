const items = [
  "Integrity",
  "Unity",
  "Justice",
  "Empowerment",
  "Internships",
  "Scholarships",
  "Moot Courts",
  "Legal Aid",
  "Mentorship",
];

/** The one bold gold band on the page — a slow, quiet marquee. */
export function ValuesMarquee() {
  return (
    <div className="gold-gradient overflow-hidden border-y border-gold-dark/30 py-3 text-ink">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-8 pr-8 text-xs font-semibold tracking-[0.3em] uppercase"
              >
                {item}
                <span className="text-[8px] text-ink/50">◆</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
