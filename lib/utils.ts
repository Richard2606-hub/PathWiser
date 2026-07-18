import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind class merger. Use everywhere for conditional classes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a MYR amount as RM 5,500/m or RM 12,000. */
export function formatMYR(amount: number, monthly = true): string {
  return `RM ${amount.toLocaleString('en-MY')}${monthly ? '/m' : ''}`;
}

/** Format a probability (0-1) as a percentage string. */
export function formatPct(p: number, decimals = 0): string {
  return `${(p * 100).toFixed(decimals)}%`;
}

/** Cosine similarity between two vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Debounce helper for text inputs. */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait = 250
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Seedable pseudo-random for reproducible synthetic corpus. */
export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Pick a random element from an array with a seeded RNG. */
export function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Weighted-random pick — items with higher weights are more likely. */
export function pickWeighted<T>(
  items: Array<{ item: T; weight: number }>,
  rng: () => number
): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const { item, weight } of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1].item;
}

/** Detect whether the engine has real Supabase credentials available. */
export function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Detect whether the engine has real Gemini credentials available. */
export function hasGeminiConfig(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
