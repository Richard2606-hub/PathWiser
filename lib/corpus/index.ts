/**
 * In-memory corpus singleton — generated once per server process.
 * ~4800 trajectories (≈300 per sector across the 16-sector taxonomy),
 * deterministic seed = 42 so cohorts stay reproducible.
 *
 * Talentbank replacement: swap for a Supabase query. The engine
 * automatically uses this when Supabase is not configured.
 */

import { generateCorpus } from './generate';
import { SECTORS } from './occupations';
import type { Trajectory } from '@/types';

type EnrichedTrajectory = Trajectory & { featureVector: number[] };

// ~300 trajectories per sector so sector-filtered cohorts clear the 50 floor.
const PER_SECTOR = 300;

let _cached: EnrichedTrajectory[] | null = null;

export function getCorpus(): EnrichedTrajectory[] {
  if (!_cached) {
    console.info('[PathWiser] Generating in-memory corpus (one-time)…');
    const start = Date.now();
    _cached = generateCorpus(PER_SECTOR * SECTORS.length, 42);
    console.info(`[PathWiser] Corpus ready in ${Date.now() - start}ms · ${_cached.length} trajectories`);
  }
  return _cached;
}

export function getCorpusStats() {
  const c = getCorpus();
  const sectors = new Map<string, number>();
  const states = new Map<string, number>();
  const stages = new Map<string, number>();
  for (const t of c) {
    sectors.set(t.sector || 'Unknown', (sectors.get(t.sector || 'Unknown') || 0) + 1);
    states.set(t.state || 'Unknown', (states.get(t.state || 'Unknown') || 0) + 1);
    stages.set(t.life_stage, (stages.get(t.life_stage) || 0) + 1);
  }
  return {
    total: c.length,
    sectors: Object.fromEntries(sectors),
    states: Object.fromEntries(states),
    life_stages: Object.fromEntries(stages),
  };
}

export { generateCorpus, shapeToFeatureVector, trajectoryToFeatureVector } from './generate';
export { OCCUPATIONS, SECTORS, MY_STATES } from './occupations';
