import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { retrieveCohort, aggregate } from '@/lib/engine';
import { MODELLED_CANDIDATES } from '@/lib/corpus/candidates';
import { getEvidenceProvenance } from '@/lib/evidence';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';
import { createClient } from '@/lib/supabase/server';
import { getAIProvider } from '@/lib/ai';
import type { TalentCandidateMatch, UserShape } from '@/types';

const RequestSchema = z.object({
  role: z.string().trim().min(2).max(160),
  skills: z.array(z.string().trim().min(1).max(80)).min(1).max(30),
  state: z.string().trim().min(1).max(80).default('Kuala Lumpur'),
  include_adjacent: z.boolean().default(true),
});

function normalise(value: string) { return value.trim().toLowerCase(); }

export async function POST(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request); if (invalidOrigin) return invalidOrigin;
  const limited = rateLimit(request, 'talent-match', 25); if (limited) return limited;
  try {
    const input = RequestSchema.parse(await request.json());
    const shape: UserShape = { userId: 'anon', persona: 'employer', role: input.role, education: "Bachelor's", years_experience: 5, state: input.state, skills: input.skills, life_stage: 'mid_career' };
    const cohort = await retrieveCohort(shape, { k: 1200 });
    if (cohort.cohort_too_small) return NextResponse.json({ cohort_too_small: true, cohort_size: cohort.size, message: cohort.cohort_too_small.reason, candidates: [], evidence: getEvidenceProvenance() });
    const evidenceAggregate = aggregate(cohort, 0);

    let candidates: TalentCandidateMatch[] = [];
    let dataScope: 'consented-community' | 'modelled-examples' = 'modelled-examples';

    if (process.env.ALLOW_FULL_MODE === 'true' && process.env.GEMINI_API_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const embedding = await getAIProvider().getEmbedding(`Target role: ${input.role}\nRequired skills: ${input.skills.join(', ')}\nState: ${input.state}`);
          const { data, error } = await supabase.rpc('match_consented_candidates', { query_embedding: embedding, match_count: 20 });
          if (error) throw error;
          candidates = (data || []).map((candidate: { candidate_key: string; display_name: string; current_role: string; state: string; skills: string[] }) => buildMatch(candidate.candidate_key, candidate.display_name, candidate.current_role, candidate.state, candidate.skills, input.skills, cohort.size, 'employer-discovery'));
          dataScope = 'consented-community';
        }
      } catch (error) {
        console.warn('[PathWiser] Consented candidate retrieval unavailable:', error instanceof Error ? error.message : error);
      }
    }

    if (!candidates.length) {
      candidates = MODELLED_CANDIDATES.map((candidate) => buildMatch(candidate.id, candidate.display_name, candidate.current_role, candidate.state, candidate.skills, input.skills, cohort.size, 'synthetic-example'));
    }

    candidates = candidates
      .filter((candidate) => input.include_adjacent || !candidate.adjacent)
      .sort((a, b) => b.matched_skills.length - a.matched_skills.length || a.skill_bridges.length - b.skill_bridges.length);

    return NextResponse.json({ candidates, cohort_size: cohort.size, common_bridges: evidenceAggregate.common_skill_bridges.slice(0, 5), data_scope: dataScope, evidence: getEvidenceProvenance() });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'invalid_query', issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'talent_match_failed', message: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

function buildMatch(id: string, displayName: string, currentRole: string, state: string, candidateSkills: string[], requiredSkills: string[], cohortSize: number, consentScope: TalentCandidateMatch['consent_scope']): TalentCandidateMatch {
  const skillMap = new Map(candidateSkills.map((skill) => [normalise(skill), skill]));
  const matchedSkills = requiredSkills.filter((skill) => skillMap.has(normalise(skill)));
  const skillBridges = requiredSkills.filter((skill) => !skillMap.has(normalise(skill))).slice(0, 3);
  const adjacent = skillBridges.length > 0;
  return {
    id, display_name: displayName, current_role: currentRole, state,
    matched_skills: matchedSkills, skill_bridges: skillBridges, adjacent, consent_scope: consentScope,
    rationale: `${matchedSkills.length || 'No'} declared requirement${matchedSkills.length === 1 ? '' : 's'} ${matchedSkills.length === 1 ? 'aligns' : 'align'} directly. ${adjacent ? `${skillBridges.length} bridge skill${skillBridges.length === 1 ? '' : 's'} should be assessed with the candidate.` : 'No declared bridge is required.'} The role context is supported by a retrieved cohort of ${cohortSize.toLocaleString()} modelled trajectories; the employer makes the final decision.`,
  };
}
