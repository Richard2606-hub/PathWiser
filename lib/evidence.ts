import { getCorpusStats } from '@/lib/corpus';
import { hasGeminiConfig, hasSupabaseConfig } from '@/lib/utils';
import type { EvidenceProvenance } from '@/types';

export type EvidenceMode = 'community' | 'modelled';

export function resolveEvidenceMode(userId: string, requestedMode?: EvidenceMode): EvidenceMode {
  if (requestedMode === 'modelled' || userId === 'anon' || userId.startsWith('demo-')) {
    return 'modelled';
  }
  return hasSupabaseConfig() && hasGeminiConfig() && process.env.ALLOW_FULL_MODE === 'true'
    ? 'community'
    : 'modelled';
}

export function getEvidenceProvenance(modeOverride?: EvidenceMode): EvidenceProvenance {
  const communityMode = modeOverride
    ? modeOverride === 'community'
    : hasSupabaseConfig() && hasGeminiConfig() && process.env.ALLOW_FULL_MODE === 'true';
  const synthetic = process.env.EVIDENCE_CORPUS_SYNTHETIC !== 'false';
  return {
    mode: communityMode ? 'community' : 'modelled',
    synthetic: communityMode ? synthetic : true,
    label: communityMode
      ? synthetic ? 'Configured community service using a modelled Malaysian-calibrated corpus' : 'Configured consented community trajectory corpus'
      : 'Modelled trajectories calibrated to Malaysian labour data',
    corpus_size: communityMode ? 0 : getCorpusStats().total,
    minimum_cohort_size: 50,
    calibration_sources: ['DOSM Salaries & Wages', 'ESCO', 'O*NET', 'TalentCorp MyCOL'],
  };
}
