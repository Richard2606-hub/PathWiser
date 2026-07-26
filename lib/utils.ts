import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { UserShape } from '@/types';

/** Tailwind class merger. Use everywhere for conditional classes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A shape is "complete enough" to query the engine only when it carries the
 * fields the engine requires. A half-filled profile (e.g. right after signup)
 * is NOT complete — sending it would fail engine validation with a 400.
 */
export function isCompleteShape(shape: UserShape | null | undefined): shape is UserShape {
  return Boolean(
    shape &&
    shape.persona &&
    shape.role?.trim() &&
    typeof shape.years_experience === 'number' &&
    shape.state?.trim() &&
    shape.life_stage &&
    Array.isArray(shape.skills) && shape.skills.length > 0,
  );
}

/**
 * Resolve the shape to use for an engine call: the user's own shape when it is
 * complete, otherwise a complete fallback (the disclosed demo persona). This
 * keeps every module working instead of throwing a raw 400 for an unfinished
 * profile.
 */
export function resolveShape(shape: UserShape | null | undefined, fallback: UserShape): UserShape {
  const target = isCompleteShape(shape) ? shape : fallback;
  return sanitizeShape(target);
}

export function sanitizeShape(shape: UserShape): UserShape {
  const cleanSkills = (shape.skills || [])
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s.length > 0 && s.length <= 80);

  return {
    ...shape,
    userId: shape.userId?.trim() || 'anon',
    persona: ['candidate', 'employer', 'university'].includes(shape.persona) ? shape.persona : 'candidate',
    role: shape.role?.trim() || 'Software Engineer',
    education: shape.education?.trim() || "Bachelor's Degree",
    years_experience: typeof shape.years_experience === 'number' && !isNaN(shape.years_experience) ? Math.max(0, Math.min(60, shape.years_experience)) : 3,
    state: shape.state?.trim() || 'Kuala Lumpur',
    skills: cleanSkills.length > 0 ? cleanSkills.slice(0, 50) : ['Software Engineering', 'Problem Solving'],
    life_stage: ['student', 'young_adult', 'early_career', 'mid_career', 'senior_career', 'executive'].includes(shape.life_stage) ? shape.life_stage : 'early_career',
  };
}

/** Format a MYR amount as RM 5,500/m or RM 12,000. */
export function formatMYR(amount: number, monthly = true): string {
  return `RM ${amount.toLocaleString('en-MY', { maximumFractionDigits: 0 })}${monthly ? '/m' : ''}`;
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
