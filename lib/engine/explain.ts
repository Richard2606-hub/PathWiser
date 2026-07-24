/**
 * The honest narrative layer.
 *
 * Takes a deterministic Aggregate + an audience, produces a hedged narrative.
 * The AI provider only converts numbers into language — it does not invent claims.
 *
 * If the AI provider is unavailable (rate-limited, misconfigured), we fall back
 * to a template-based narrative that still references the aggregate correctly.
 * The demo never breaks; it just gets less prose-y.
 */

import { getAIProvider } from '@/lib/ai';
import type { Aggregate, Explanation } from '@/types';

interface ExplainOptions {
  audience: 'candidate' | 'employer' | 'university';
  useTemplateOnly?: boolean; // For deterministic tests + no-token demos
}

export async function explain(
  aggregate: Aggregate,
  opts: ExplainOptions
): Promise<Explanation> {
  if (opts.useTemplateOnly) {
    return renderTemplateExplanation(aggregate, opts.audience);
  }

  try {
    const ai = getAIProvider();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const explanation = await ai.generateNarrative(aggregate, opts.audience);
      if (explanation.passed_validation) {
        return { ...explanation, generation_mode: 'provider' };
      }
    }
    return renderTemplateExplanation(aggregate, opts.audience, 'validation_failed');
  } catch (err) {
    // Graceful degradation: template narrative that still references aggregates verbatim.
    // Talentbank's engineers will see the fallback in logs and know something's up.
    console.warn(
      '[PathWiser] AI provider unavailable, falling back to template narrative:',
      err instanceof Error ? err.message : err
    );
    return renderTemplateExplanation(aggregate, opts.audience, 'provider_unavailable');
  }
}

/**
 * Template narrative — deterministic, honest, uses aggregate numbers verbatim.
 * Used as a fallback when the AI provider fails, AND used in tests where
 * we don't want token spend or non-determinism.
 */
export function renderTemplateExplanation(
  agg: Aggregate,
  audience: 'candidate' | 'employer' | 'university',
  fallbackReason?: Explanation['fallback_reason'],
): Explanation {
  const topRole = agg.next_role_distribution[0];
  const topSalary = topRole ? agg.salary_percentiles_by_role[topRole.role] : undefined;
  const topBridges = agg.common_skill_bridges.slice(0, 3).map((b) => b.skill).join(', ');

  const bodies: Record<typeof audience, string> = {
    candidate: `Based on a cohort of ${agg.cohort_size.toLocaleString()} similar trajectories, the most common next step is ${
      topRole?.role || 'unclear'
    } (${Math.round((topRole?.probability || 0) * 100)}% of cohort). ${
      topSalary
        ? `Median salary in this cohort is RM${topSalary.median.toLocaleString()}/m (range RM${topSalary.p25.toLocaleString()}–${topSalary.p75.toLocaleString()}).`
        : ''
    } ${
      topBridges
        ? `Common skill bridges: ${topBridges}.`
        : ''
    } These are cohort aggregates, not predictions of your individual outcome.`,

    employer: `${agg.cohort_size.toLocaleString()} candidates in our corpus share this trajectory shape. ${
      topRole
        ? `The most common next step is ${topRole.role} (${Math.round(
            topRole.probability * 100
          )}%).`
        : ''
    } ${
      topSalary
        ? `Salary expectation range: RM${topSalary.p25.toLocaleString()}–${topSalary.p75.toLocaleString()}/m (median RM${topSalary.median.toLocaleString()}).`
        : ''
    } Use this cohort read to calibrate your role expectations, not to score any single candidate.`,

    university: `Across ${agg.cohort_size.toLocaleString()} similar graduate trajectories, ${
      topRole
        ? `${Math.round(
            topRole.probability * 100
          )}% land in ${topRole.role}-adjacent roles`
        : 'destinations are diverse'
    } after their first job. ${
      topBridges
        ? `Skills most frequently added post-graduation: ${topBridges}.`
        : ''
    } This is retrospective cohort evidence — treat as curriculum signal, not individual prediction.`,
  };

  const narrative = bodies[audience];
  return {
    narrative,
    cohort_size_disclosed: true,
    ranges_disclosed: true,
    passed_validation: true,
    validator_notes: undefined,
    generation_mode: 'template',
    fallback_reason: fallbackReason,
  };
}
