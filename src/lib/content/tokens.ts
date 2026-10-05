const NUMBER_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];

export const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);

/**
 * Replaces {placeholders} that editors can type in text fields, e.g.
 * "{wings} wings" → "8 wings". Unknown placeholders are left as typed.
 */
export function fillTokens(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
