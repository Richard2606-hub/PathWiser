import type { Aggregate, UserShape } from '@/types';

export interface MarketplaceJob {
  id: string;
  title: string;
  company: string;
  location: string;
  sector: string;
  salaryMin: number;
  salaryMax: number;
  exp: string;
  mycol: boolean;
  remote: 'Onsite' | 'Hybrid' | 'Remote';
  skills: string[];
  posted: string;
  description: string;
}

export interface RankedMarketplaceJob extends MarketplaceJob {
  alignment: 'Strong direction' | 'Adjacent direction' | 'Exploratory';
  alignmentWeight: number;
  cohortRole?: string;
  cohortShare?: number;
  alignedSkills: string[];
  skillBridges: string[];
  rationale: string;
}

function tokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !['senior', 'junior', 'lead', 'head'].includes(token)),
  );
}

function similarity(left: string, right: string) {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  a.forEach((token) => {
    if (b.has(token)) intersection += 1;
  });
  return intersection / Math.max(a.size, b.size);
}

export function rankMarketplaceJobs(
  jobs: MarketplaceJob[],
  shape: UserShape,
  aggregate?: Aggregate,
): RankedMarketplaceJob[] {
  const currentSkills = new Set(shape.skills.map((skill) => skill.toLowerCase()));
  const cohortRoles = aggregate?.next_role_distribution || [];
  return jobs
    .map((job) => {
      const closest = cohortRoles
        .map((role) => ({ role, similarity: similarity(job.title, role.role) }))
        .sort((a, b) => (b.similarity * b.role.probability) - (a.similarity * a.role.probability))[0];
      const alignedSkills = job.skills.filter((skill) => currentSkills.has(skill.toLowerCase()));
      const skillBridges = job.skills.filter((skill) => !currentSkills.has(skill.toLowerCase()));
      const roleSignal = closest ? closest.similarity * closest.role.probability : 0;
      const skillSignal = job.skills.length ? alignedSkills.length / job.skills.length : 0;
      const alignmentWeight = roleSignal * 0.75 + skillSignal * 0.25;
      const alignment: RankedMarketplaceJob['alignment'] =
        alignmentWeight >= 0.32 ? 'Strong direction' :
        alignmentWeight >= 0.12 ? 'Adjacent direction' :
        'Exploratory';
      const rationale = closest && closest.similarity > 0
        ? `${closest.role.role} appears in the active cohort (${Math.round(closest.role.probability * 100)}% share), and ${alignedSkills.length} of ${job.skills.length || 0} declared role skills align.`
        : `${alignedSkills.length} of ${job.skills.length || 0} declared role skills align; the active cohort does not yet show a closely named destination.`;
      return {
        ...job,
        alignment,
        alignmentWeight,
        cohortRole: closest?.similarity ? closest.role.role : undefined,
        cohortShare: closest?.similarity ? closest.role.probability : undefined,
        alignedSkills,
        skillBridges,
        rationale,
      };
    })
    .sort((a, b) => b.alignmentWeight - a.alignmentWeight || Number(b.mycol) - Number(a.mycol));
}
