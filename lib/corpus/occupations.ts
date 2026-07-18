/**
 * Occupation taxonomy — a curated slice of ESCO + O*NET + MASCO relevant to
 * PathWiser's Malaysian demo corpus. Not exhaustive; enough for realistic
 * trajectory generation across 5 sectors.
 *
 * Talentbank replacement: swap this file with real ESCO/O*NET taxonomy import.
 */

export interface Occupation {
  role: string;
  esco_code?: string;
  masco_code?: string;
  sector: string;
  seniority: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'exec';
  is_mycol_critical?: boolean;
  typical_skills: string[];
  salary_anchor_myr: [number, number]; // p25, p75 range (DOSM/recruiter guide calibrated)
}

export const OCCUPATIONS: Occupation[] = [
  // ─ Tech / Data ─────────
  { role: 'Junior Data Analyst', esco_code: '2511.2', masco_code: '2120', sector: 'Tech', seniority: 'entry',
    typical_skills: ['SQL', 'Excel', 'Python basics', 'Tableau'], salary_anchor_myr: [3200, 4800] },
  { role: 'Data Analyst', esco_code: '2511.2', sector: 'Tech', seniority: 'junior',
    typical_skills: ['SQL', 'Python', 'Tableau', 'ETL'], salary_anchor_myr: [4500, 7000] },
  { role: 'BI Specialist', esco_code: '2511.3', sector: 'Tech', seniority: 'junior',
    typical_skills: ['Power BI', 'DAX', 'SQL', 'Data Warehousing'], salary_anchor_myr: [5000, 7500] },
  { role: 'Data Scientist', esco_code: '2511.1', sector: 'Tech', seniority: 'mid', is_mycol_critical: true,
    typical_skills: ['Python', 'ML', 'Statistics', 'A/B Testing'], salary_anchor_myr: [7500, 12000] },
  { role: 'Senior Data Scientist', esco_code: '2511.1', sector: 'Tech', seniority: 'senior', is_mycol_critical: true,
    typical_skills: ['Deep Learning', 'MLOps', 'PyTorch', 'Statistical Modeling'], salary_anchor_myr: [12000, 18000] },
  { role: 'ML Engineer', esco_code: '2512.4', sector: 'Tech', seniority: 'mid', is_mycol_critical: true,
    typical_skills: ['PyTorch', 'Kubernetes', 'Model Serving', 'CI/CD'], salary_anchor_myr: [9500, 14000] },
  { role: 'Analytics Engineer', sector: 'Tech', seniority: 'mid', is_mycol_critical: true,
    typical_skills: ['dbt', 'SQL', 'Python', 'Snowflake'], salary_anchor_myr: [10000, 15000] },
  { role: 'Data Engineer', esco_code: '2512.5', sector: 'Tech', seniority: 'mid', is_mycol_critical: true,
    typical_skills: ['Spark', 'Airflow', 'Kafka', 'AWS'], salary_anchor_myr: [9000, 14000] },
  { role: 'Analytics Manager', esco_code: '1330.1', sector: 'Tech', seniority: 'lead',
    typical_skills: ['People Management', 'Stakeholder Comms', 'Budget Planning'], salary_anchor_myr: [12000, 18000] },
  { role: 'Head of Data', sector: 'Tech', seniority: 'exec',
    typical_skills: ['Executive Presence', 'Strategy', 'Board Reporting'], salary_anchor_myr: [18000, 28000] },
  { role: 'Principal Data Scientist', sector: 'Tech', seniority: 'exec', is_mycol_critical: true,
    typical_skills: ['Research Publication', 'Architecture', 'Mentoring'], salary_anchor_myr: [22000, 32000] },
  { role: 'Junior Software Engineer', esco_code: '2512.1', sector: 'Tech', seniority: 'entry',
    typical_skills: ['JavaScript', 'Git', 'HTML/CSS', 'REST'], salary_anchor_myr: [3500, 5500] },
  { role: 'Software Engineer', esco_code: '2512.1', sector: 'Tech', seniority: 'junior', is_mycol_critical: true,
    typical_skills: ['TypeScript', 'React', 'Node.js', 'AWS'], salary_anchor_myr: [5500, 9000] },
  { role: 'Senior Software Engineer', esco_code: '2512.1', sector: 'Tech', seniority: 'senior', is_mycol_critical: true,
    typical_skills: ['System Design', 'Distributed Systems', 'Leadership'], salary_anchor_myr: [11000, 18000] },
  { role: 'Tech Lead', sector: 'Tech', seniority: 'lead',
    typical_skills: ['Team Leadership', 'Architecture', 'Roadmap'], salary_anchor_myr: [14000, 22000] },
  { role: 'Engineering Manager', sector: 'Tech', seniority: 'lead',
    typical_skills: ['People Management', 'Delivery', 'Hiring'], salary_anchor_myr: [16000, 25000] },
  { role: 'Director of Engineering', sector: 'Tech', seniority: 'exec',
    typical_skills: ['Executive Comms', 'Org Design', 'Strategy'], salary_anchor_myr: [22000, 38000] },
  { role: 'Product Manager', esco_code: '1213.1', sector: 'Tech', seniority: 'mid',
    typical_skills: ['User Research', 'Roadmapping', 'Stakeholder Mgmt', 'Metrics'], salary_anchor_myr: [8000, 13000] },
  { role: 'Senior Product Manager', sector: 'Tech', seniority: 'senior',
    typical_skills: ['Strategy', 'Cross-functional Leadership', 'Metrics'], salary_anchor_myr: [12000, 20000] },
  { role: 'Head of Product', sector: 'Tech', seniority: 'exec',
    typical_skills: ['Product Vision', 'Executive Presence', 'Team Building'], salary_anchor_myr: [20000, 32000] },

  // ─ Finance ─────────
  { role: 'Financial Analyst', esco_code: '2411.1', sector: 'Finance', seniority: 'junior',
    typical_skills: ['Excel', 'Financial Modeling', 'Bloomberg', 'SQL'], salary_anchor_myr: [4500, 7000] },
  { role: 'Investment Analyst', esco_code: '2412.1', sector: 'Finance', seniority: 'mid',
    typical_skills: ['Valuation', 'Modeling', 'Sector Research'], salary_anchor_myr: [7000, 11000] },
  { role: 'VP of Finance', sector: 'Finance', seniority: 'exec',
    typical_skills: ['FP&A', 'Board Reporting', 'M&A'], salary_anchor_myr: [22000, 40000] },
  { role: 'Risk Analyst', sector: 'Finance', seniority: 'junior',
    typical_skills: ['Statistics', 'SAS', 'Regulatory Reporting'], salary_anchor_myr: [4800, 7500] },
  { role: 'Quantitative Analyst', sector: 'Finance', seniority: 'senior', is_mycol_critical: true,
    typical_skills: ['Python', 'Statistics', 'C++', 'Derivatives'], salary_anchor_myr: [12000, 22000] },

  // ─ Marketing / Comms ─────
  { role: 'Digital Marketing Executive', sector: 'Marketing', seniority: 'entry',
    typical_skills: ['Google Ads', 'Meta Ads', 'SEO', 'Copywriting'], salary_anchor_myr: [3200, 5000] },
  { role: 'Growth Marketer', sector: 'Marketing', seniority: 'mid',
    typical_skills: ['Growth Loops', 'Analytics', 'Experimentation'], salary_anchor_myr: [6000, 10000] },
  { role: 'Head of Marketing', sector: 'Marketing', seniority: 'exec',
    typical_skills: ['Brand', 'Strategy', 'Executive Comms'], salary_anchor_myr: [15000, 26000] },

  // ─ Energy ─────────
  { role: 'Reservoir Engineer', sector: 'Energy', seniority: 'mid', is_mycol_critical: true,
    typical_skills: ['Petrel', 'Simulation', 'Geology'], salary_anchor_myr: [9000, 14000] },
  { role: 'Senior Reservoir Engineer', sector: 'Energy', seniority: 'senior', is_mycol_critical: true,
    typical_skills: ['Field Development', 'Modeling', 'Team Leadership'], salary_anchor_myr: [14000, 22000] },

  // ─ Consulting ─────
  { role: 'Business Analyst', esco_code: '2421.1', sector: 'Consulting', seniority: 'junior',
    typical_skills: ['Excel', 'PowerPoint', 'Stakeholder Interviews'], salary_anchor_myr: [4500, 7000] },
  { role: 'Consultant', sector: 'Consulting', seniority: 'mid',
    typical_skills: ['Structured Problem Solving', 'Client Mgmt', 'Presentations'], salary_anchor_myr: [8000, 13000] },
  { role: 'Senior Consultant', sector: 'Consulting', seniority: 'senior',
    typical_skills: ['Practice Development', 'Sales', 'Delivery'], salary_anchor_myr: [13000, 22000] },
  { role: 'Consulting Partner', sector: 'Consulting', seniority: 'exec',
    typical_skills: ['Business Development', 'P&L', 'Rainmaker'], salary_anchor_myr: [30000, 55000] }
];

export const SECTORS = ['Tech', 'Finance', 'Marketing', 'Energy', 'Consulting'] as const;
export const MY_STATES = ['Kuala Lumpur', 'Selangor', 'Penang', 'Johor', 'Sarawak'] as const;

export type Sector = typeof SECTORS[number];
export type MyState = typeof MY_STATES[number];

export function occupationsBySector(sector: string): Occupation[] {
  return OCCUPATIONS.filter((o) => o.sector === sector);
}
export function findOccupation(role: string): Occupation | undefined {
  return OCCUPATIONS.find((o) => o.role.toLowerCase() === role.toLowerCase());
}
