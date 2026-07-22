import type { Aggregate } from '@/types';

const PREDICTIVE = /\b(you will|you'll|you are going to|guaranteed|definitely|certainly will|your outcome will)\b/i;

export function validateCoachReply(reply: string, aggregate: Aggregate) {
  const notes: string[] = [];
  if (PREDICTIVE.test(reply)) notes.push('Predictive language detected.');
  if (!reply.includes(String(aggregate.cohort_size))) notes.push('Exact cohort size not disclosed.');
  return { passed: notes.length === 0, notes };
}

export function deterministicCoachReply(aggregate: Aggregate) {
  const top = aggregate.next_role_distribution.slice(0, 3);
  const roles = top.length ? top.map((item) => `${item.role} (${Math.round(item.probability * 100)}% cohort share)`).join(', ') : 'no sufficiently common next destination';
  const bridges = aggregate.common_skill_bridges.slice(0, 3).map((item) => item.skill).join(', ') || 'no consistent bridge skill';
  return `The retrieved cohort contains ${aggregate.cohort_size.toLocaleString()} trajectories. Its most common observed directions are ${roles}. Common bridge evidence includes ${bridges}. Treat these patterns as options to investigate alongside your goals and constraints, not as an individual prediction.`;
}
