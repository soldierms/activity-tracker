export const CATEGORY_COLORS = [
  "slate",
  "indigo",
  "violet",
  "rose",
  "amber",
  "emerald",
  "sky",
  "orange",
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

const DOT_CLASSES: Record<string, string> = {
  slate: "bg-slate-400",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  orange: "bg-orange-500",
};

const CHIP_CLASSES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  indigo: "bg-indigo-100 text-indigo-700",
  violet: "bg-violet-100 text-violet-700",
  rose: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  orange: "bg-orange-100 text-orange-700",
};

const RING_CLASSES: Record<string, string> = {
  slate: "ring-slate-500",
  indigo: "ring-indigo-500",
  violet: "ring-violet-500",
  rose: "ring-rose-500",
  amber: "ring-amber-500",
  emerald: "ring-emerald-500",
  sky: "ring-sky-500",
  orange: "ring-orange-500",
};

export function dotClass(color: string): string {
  return DOT_CLASSES[color] ?? DOT_CLASSES.slate;
}

export function chipClass(color: string): string {
  return CHIP_CLASSES[color] ?? CHIP_CLASSES.slate;
}

export function ringClass(color: string): string {
  return RING_CLASSES[color] ?? RING_CLASSES.slate;
}
