import { getCorpusStats } from '@/lib/corpus';
import { hasGeminiConfig, hasSupabaseConfig } from '@/lib/utils';
import type { EvidenceProvenance } from '@/types';

export function getEvidenceProvenance(): EvidenceProvenance {
  const communityMode = hasSupabaseConfig() && hasGeminiConfig() && process.env.ALLOW_FULL_MODE === 'true';
  const synthetic = process.env.EVIDENCE_CORPUS_SYNTHETIC !== 'false';
  return {
    mode: communityMode ? 'community' : 'modelled',
    synthetic,
    label: communityMode
      ? synthetic ? 'Configured community service using a modelled Malaysian-calibrated corpus' : 'Configured consented community trajectory corpus'
      : 'Modelled trajectories calibrated to Malaysian labour data',
    corpus_size: communityMode ? 0 : getCorpusStats().total,
    minimum_cohort_size: 50,
    calibration_sources: ['DOSM Salaries & Wages', 'ESCO', 'O*NET', 'TalentCorp MyCOL'],
  };
}
