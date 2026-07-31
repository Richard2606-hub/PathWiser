import type { Aggregate } from '@/types';

const PREDICTIVE = /\b(you will|you'll|you are going to|guaranteed|definitely|certainly will|your outcome will)\b/i;

export function validateCoachReply(reply: string, aggregate: Aggregate) {
  const notes: string[] = [];
  if (PREDICTIVE.test(reply)) notes.push('Predictive language detected.');
  const rawSize = String(aggregate.cohort_size);
  const formattedSize = aggregate.cohort_size.toLocaleString();
  const mentionsCohort = reply.includes(rawSize) || reply.includes(formattedSize) || /cohort/i.test(reply);
  if (!mentionsCohort) notes.push('Cohort size context missing.');
  return { passed: notes.length === 0, notes };
}

export function deterministicCoachReply(aggregate: Aggregate, roleTitle: string = 'your role') {
  const top = aggregate.next_role_distribution.slice(0, 4);
  const roles = top.length
    ? top.map((item) => `${item.role} (${Math.round(item.probability * 100)}% share)`).join(', ')
    : 'no common next destination';
  const bridges = aggregate.common_skill_bridges.slice(0, 4).map((item) => item.skill).join(', ') || 'no consistent skill bridges';
  return `Within a cohort of ${aggregate.cohort_size.toLocaleString()} trajectories evaluated for ${roleTitle}, observed career directions include ${roles}. Observed skill bridges include ${bridges}. Treat these cohort evidence patterns as realistic data-backed options to guide your next move, not as an individual prediction.`;
}
