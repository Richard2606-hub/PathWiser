import { OCCUPATIONS, findOccupation, type Occupation } from '../corpus/occupations';
import type { Persona, UserShape } from '../../types';

const ONET_BY_ESCO: Record<string, string> = {
  '2511.1': '15-2051.00',
  '2511.2': '15-2051.00',
  '2511.3': '15-2051.01',
  '2512.1': '15-1252.00',
  '2512.4': '15-1252.00',
  '2512.5': '15-1243.01',
  '1213.1': '11-2021.00',
  '1330.1': '11-3021.00',
  '2411.1': '13-2051.00',
  '2412.1': '13-2051.00',
  '2421.1': '13-1111.00',
};

const SKILL_CANONICAL: Record<string, string> = {
  'a/b testing': 'A/B Testing',
  'ab testing': 'A/B Testing',
  'amazon web services': 'AWS',
  aws: 'AWS',
  'data visualisation': 'Data Visualization',
  'data visualization': 'Data Visualization',
  excel: 'Excel',
  javascript: 'JavaScript',
  'machine learning': 'Machine Learning',
  ml: 'Machine Learning',
  'people management': 'People Management',
  'power bi': 'Power BI',
  python: 'Python',
  sql: 'SQL',
  tableau: 'Tableau',
  typescript: 'TypeScript',
};

export interface ShapeNormalization {
  matchedRole?: string;
  escoCode?: string;
  onetCode?: string;
  mascoCode?: string;
  programmeCode?: string;
  confidence: number;
  method: 'exact-taxonomy' | 'token-taxonomy' | 'programme-taxonomy' | 'unmapped';
  skills: string[];
}

function roleTokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !['and', 'the', 'for', 'target', 'hire'].includes(token)),
  );
}

function tokenScore(left: string, right: string) {
  const a = roleTokens(left);
  const b = roleTokens(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  a.forEach((token) => {
    if (b.has(token)) intersection += 1;
  });
  return intersection / Math.max(a.size, b.size);
}

function closestOccupation(role: string): { occupation?: Occupation; confidence: number; exact: boolean } {
  const direct = findOccupation(role.replace(/\s*\(target hire\)\s*/i, '').trim());
  if (direct) return { occupation: direct, confidence: 1, exact: true };
  const ranked = OCCUPATIONS
    .map((occupation) => ({ occupation, score: tokenScore(role, occupation.role) }))
    .sort((a, b) => b.score - a.score);
  if (!ranked[0] || ranked[0].score < 0.5) return { confidence: 0, exact: false };
  return {
    occupation: ranked[0].occupation,
    confidence: Math.min(0.92, 0.62 + ranked[0].score * 0.3),
    exact: false,
  };
}

export function normalizeSkills(skills: string[]) {
  const deduplicated = new Map<string, string>();
  for (const raw of skills) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const canonical = SKILL_CANONICAL[trimmed.toLowerCase()] || trimmed;
    deduplicated.set(canonical.toLowerCase(), canonical);
  }
  return Array.from(deduplicated.values()).slice(0, 50);
}

export function normalizeShapeInput(
  persona: Persona,
  role: string,
  skills: string[],
): ShapeNormalization {
  const normalizedSkills = normalizeSkills(skills);
  if (persona === 'university') {
    const lower = role.toLowerCase();
    const programmeCode = /computer science|software|programming/.test(lower)
      ? 'ISCED-F 0613'
      : /information technology|information systems|ict/.test(lower)
        ? 'ISCED-F 0610'
        : /business analytics|data science/.test(lower)
          ? 'ISCED-F 0542'
          : undefined;
    return {
      programmeCode,
      confidence: programmeCode ? 0.95 : 0,
      method: programmeCode ? 'programme-taxonomy' : 'unmapped',
      skills: normalizedSkills,
    };
  }

  const match = closestOccupation(role);
  const occupation = match.occupation;
  return {
    matchedRole: occupation?.role,
    escoCode: occupation?.esco_code,
    onetCode: occupation?.esco_code ? ONET_BY_ESCO[occupation.esco_code] : undefined,
    mascoCode: occupation?.masco_code,
    confidence: occupation ? match.confidence : 0,
    method: occupation ? (match.exact ? 'exact-taxonomy' : 'token-taxonomy') : 'unmapped',
    skills: normalizedSkills,
  };
}

export function applyNormalization(shape: UserShape): UserShape {
  const normalized = normalizeShapeInput(shape.persona, shape.role, shape.skills);
  return {
    ...shape,
    skills: normalized.skills,
    esco_code: normalized.escoCode,
    onet_code: normalized.onetCode,
    masco_code: normalized.mascoCode,
  };
}
