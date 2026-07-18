/**
 * Career Twin Engine — the shared engine that all 9 audience modules call.
 *
 * Every module route boils down to:
 *   1. Build a UserShape from the caller's context
 *   2. retrieveCohort(shape, filters)
 *   3. aggregate(cohort, currentStepIndex)
 *   4. explain(aggregate, audience)
 *
 * The audience-specific framing (candidate vs employer vs university) is
 * ONLY in step 4. Steps 1-3 are identical across surfaces — the Career
 * Signal Loop's architectural claim, made real.
 */

export { retrieveCohort, shapeToText } from './retrieve';
export {
  aggregate,
  computeNextRoleDistribution,
  computeSalaryPercentilesByRole,
  computeMedianTimeInRole,
  computeCommonSkillBridges,
  percentile,
  MIN_COHORT_SIZE,
} from './aggregate';
export { explain, renderTemplateExplanation } from './explain';
