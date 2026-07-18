/**
 * Demo personas — one-click login bypass for judges.
 * Pre-seeded shapes so quick-launch works without going through onboarding.
 */

import type { UserShape, Persona } from '@/types';

export interface DemoPersona {
  key: string;
  persona: Persona;
  identity: { name: string; role: string };
  landingModule: string;
  shape: UserShape;
}

export const DEMO_PERSONAS: Record<string, DemoPersona> = {
  aisyah: {
    key: 'aisyah',
    persona: 'candidate',
    identity: { name: 'Aisyah binti Rahman', role: 'Candidate' },
    landingModule: 'path_navigator',
    shape: {
      userId: 'demo-aisyah',
      persona: 'candidate',
      role: 'Junior Data Analyst',
      esco_code: '2511.2',
      masco_code: '2120',
      education: 'BSc in Computer Science',
      years_experience: 3,
      state: 'Kuala Lumpur',
      skills: ['SQL', 'Python', 'Tableau', 'Excel'],
      life_stage: 'early_career',
    },
  },
  boldrise: {
    key: 'boldrise',
    persona: 'employer',
    identity: { name: 'BoldRise Sdn Bhd', role: 'Employer' },
    landingModule: 'talent_matching',
    shape: {
      userId: 'demo-boldrise',
      persona: 'employer',
      role: 'Hiring Lead',
      education: 'MBA',
      years_experience: 10,
      state: 'Kuala Lumpur',
      skills: ['Talent Strategy', 'Growth', 'People Ops'],
      life_stage: 'mid_career',
    },
  },
  utm: {
    key: 'utm',
    persona: 'university',
    identity: { name: 'Universiti Teknologi Malaysia', role: 'University' },
    landingModule: 'outcome_loop',
    shape: {
      userId: 'demo-utm',
      persona: 'university',
      role: 'Programme Director',
      education: 'PhD',
      years_experience: 18,
      state: 'Johor',
      skills: ['Curriculum Design', 'Programme Governance', 'Academic Research'],
      life_stage: 'senior_career',
    },
  },
};
