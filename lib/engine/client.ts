/**
 * Client-side engine wrapper — one function all React components use.
 * Hits the /api/engine/navigate route.
 */

import type { UserShape, Aggregate, Explanation, EvidenceProvenance } from '@/types';
import type { EvidenceMode } from '@/lib/evidence';
import { sanitizeShape } from '@/lib/utils';

export interface NavigateOptions {
  currentStepIndex?: number;
  filterByLifeStage?: boolean;
  filterByState?: boolean;
  filterBySector?: string;
  k?: number;
  evidenceMode?: EvidenceMode;
}

export interface NavigateResponse {
  cohort: {
    size: number;
    similarity_stats: { mean: number; stddev: number; min: number; max: number };
    filters_applied: { life_stage?: string; state?: string; sector?: string };
  };
  aggregate: Aggregate;
  explanation: Explanation;
  k_min: number;
  evidence: EvidenceProvenance;
}

export interface CohortTooSmallResponse {
  cohort_too_small: true;
  cohort_size: number;
  k_min: number;
  message: string;
  evidence?: EvidenceProvenance;
}

export async function navigate(
  rawShape: UserShape,
  options: NavigateOptions = {}
): Promise<NavigateResponse | CohortTooSmallResponse> {
  const shape = sanitizeShape(rawShape);
  const evidenceMode = options.evidenceMode ??
    (shape.userId === 'anon' || shape.userId.startsWith('demo-') ? 'modelled' : 'community');
  const res = await fetch('/api/engine/navigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shape, ...options, evidenceMode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Engine call failed (${res.status})`);
  }
  return res.json();
}
