/**
 * Job listings — an economy-wide marketplace of Malaysian openings.
 *
 * A curated set of flagship, hand-written roles is followed by a deterministic,
 * seeded expansion generated from the occupation taxonomy × company directory,
 * so the marketplace covers every sector with realistic, salary-anchored roles.
 * Deterministic (seed = 42) → reproducible for CI + demos.
 *
 * Later replaced by a Supabase `job_listings` table.
 */

import { OCCUPATIONS, type Occupation, type Seniority } from './occupations';
import { COMPANIES } from './companies';
import { seededRandom, pickRandom } from '@/lib/utils';

export interface JobListing {
  id: number;
  title: string;
  company: string;
  location: string;
  sector: string;
  salaryMin: number;
  salaryMax: number;
  exp: string;
  fit: number;
  mycol: boolean;
  remote: 'Onsite' | 'Hybrid' | 'Remote';
  skills: string[];
  posted: string;
  bridge: string;
  description: string;
}

// ─── Curated flagship listings (hand-written, recognisable) ───
const CURATED: JobListing[] = [
  { id: 1, title: 'Senior Data Scientist', company: 'Grab MY', location: 'KL', sector: 'Tech · Ride-hailing',
    salaryMin: 12000, salaryMax: 18000, exp: '4–7 yrs', fit: 92, mycol: true, remote: 'Hybrid',
    skills: ['Python', 'ML', 'SQL', 'A/B Testing'], posted: '2 days ago', bridge: 'Python, MLOps',
    description: 'Own the growth-and-retention modelling stack. Lead one experimentation squad. 4+ years of applied ML in production.' },
  { id: 2, title: 'ML Engineer', company: 'AirAsia MOVE', location: 'Sepang', sector: 'Tech · Airlines',
    salaryMin: 9500, salaryMax: 14000, exp: '3–5 yrs', fit: 88, mycol: true, remote: 'Hybrid',
    skills: ['TensorFlow', 'Kubernetes', 'Airflow'], posted: '5 days ago', bridge: 'MLOps, Deep Learning',
    description: 'Deploy pricing + demand forecasting models to production. Own the MLOps stack end-to-end.' },
  { id: 3, title: 'Product Analyst — Fintech', company: 'Touch \'n Go Digital', location: 'KL Sentral', sector: 'Finance · Digital',
    salaryMin: 7500, salaryMax: 11000, exp: '2–4 yrs', fit: 84, mycol: false, remote: 'Onsite',
    skills: ['SQL', 'Tableau', 'A/B Testing', 'Stakeholder Mgmt'], posted: '1 week ago', bridge: 'Product analytics',
    description: 'Analytics support to the fintech product team — payments, wealth, savings.' },
  { id: 4, title: 'Analytics Engineer', company: 'Shopee MY', location: 'Bangsar', sector: 'Tech · E-commerce',
    salaryMin: 10000, salaryMax: 15000, exp: '3–5 yrs', fit: 81, mycol: true, remote: 'Hybrid',
    skills: ['dbt', 'SQL', 'Python', 'Snowflake'], posted: '3 days ago', bridge: 'Data engineering, dbt',
    description: 'Own the growth analytics data mart. dbt / Snowflake / self-serve enablement.' },
  { id: 5, title: 'Lead Data Scientist', company: 'Petronas', location: 'KLCC', sector: 'Energy · Digital',
    salaryMin: 16000, salaryMax: 24000, exp: '6–10 yrs', fit: 76, mycol: true, remote: 'Onsite',
    skills: ['ML', 'People Mgmt', 'Domain Knowledge'], posted: '2 weeks ago', bridge: 'Leadership skills',
    description: 'Lead a squad of 5 data scientists in upstream + downstream analytics. Deep energy-sector context preferred.' },
  { id: 6, title: 'Business Intelligence Analyst', company: 'Astro', location: 'Bukit Jalil', sector: 'Media · Broadcasting',
    salaryMin: 6000, salaryMax: 9000, exp: '2–4 yrs', fit: 74, mycol: false, remote: 'Hybrid',
    skills: ['Power BI', 'DAX', 'SQL'], posted: '4 days ago', bridge: 'Storytelling, BI tools',
    description: 'BI for the OTT + linear streaming teams. Own dashboards for programming + content decisions.' },
  { id: 7, title: 'Data Engineering Manager', company: 'Maybank', location: 'Menara Maybank', sector: 'Finance · Banking',
    salaryMin: 18000, salaryMax: 26000, exp: '7+ yrs', fit: 68, mycol: true, remote: 'Onsite',
    skills: ['People Mgmt', 'Data Platform', 'Cloud'], posted: '1 week ago', bridge: 'Management transition',
    description: 'Lead a 12-person data platform team. Own the roadmap for lakehouse + streaming.' },
  { id: 8, title: 'AI Research Scientist', company: 'MIMOS Berhad', location: 'Bukit Jalil', sector: 'Research · Government-linked',
    salaryMin: 11000, salaryMax: 16000, exp: '5+ yrs · PhD preferred', fit: 62, mycol: true, remote: 'Onsite',
    skills: ['Deep Learning', 'Publication track', 'Research'], posted: '3 weeks ago', bridge: 'Research pivot',
    description: 'Advance MIMOS research programs in vision + language. Publication expected.' },
  { id: 9, title: 'Growth Marketer', company: 'BoldRise Sdn Bhd', location: 'KL Sentral', sector: 'Marketing · SaaS',
    salaryMin: 6500, salaryMax: 10000, exp: '2–4 yrs', fit: 58, mycol: false, remote: 'Hybrid',
    skills: ['Growth Loops', 'Analytics', 'Experimentation'], posted: '1 day ago', bridge: 'Marketing analytics pivot',
    description: 'Own the growth funnel for a B2B SaaS product. Deep analytics + creative shipping.' },
  { id: 10, title: 'Senior Backend Engineer', company: 'BigPay', location: 'PJ', sector: 'Finance · Payments',
    salaryMin: 11000, salaryMax: 17000, exp: '5+ yrs', fit: 66, mycol: true, remote: 'Hybrid',
    skills: ['Go', 'PostgreSQL', 'Kafka', 'Distributed Systems'], posted: '6 days ago', bridge: 'Distributed systems',
    description: 'Payment rail — Go / PostgreSQL / Kafka. Own reliability + latency.' },
  { id: 11, title: 'Reservoir Engineer', company: 'Petronas Carigali', location: 'KLCC', sector: 'Energy · Upstream',
    salaryMin: 9000, salaryMax: 14000, exp: '3–6 yrs', fit: 40, mycol: true, remote: 'Onsite',
    skills: ['Petrel', 'Simulation', 'Geology'], posted: '2 weeks ago', bridge: 'Deep-domain switch',
    description: 'Reservoir modelling for Kimanis / Kikeh assets. Requires industry background.' },
  { id: 12, title: 'Head of Product', company: 'Carsome', location: 'KL Sentral', sector: 'Tech · Automotive',
    salaryMin: 22000, salaryMax: 32000, exp: '8+ yrs', fit: 55, mycol: false, remote: 'Hybrid',
    skills: ['Strategy', 'Cross-functional Leadership', 'Metrics'], posted: '1 week ago', bridge: 'IC → leadership',
    description: 'Take the product org from 15 to 40. Own P&L for the core product line.' },
];

// ─── Deterministic marketplace expansion ───

const EXP_BY_SENIORITY: Record<Seniority, string> = {
  entry: '0–2 yrs',
  junior: '1–3 yrs',
  mid: '3–6 yrs',
  senior: '5–9 yrs',
  lead: '8+ yrs',
  exec: '12+ yrs',
};

// Sectors that lean onsite vs. remote-friendly.
const ONSITE_LEANING = new Set(['Manufacturing', 'Healthcare', 'Hospitality', 'Construction', 'Retail', 'Agriculture', 'Energy', 'Logistics']);
const REMOTE_FRIENDLY = new Set(['Tech', 'Marketing', 'Creative', 'Consulting']);

// Map an occupation sector to the company-directory sector prefixes it accepts.
const COMPANY_SECTOR_ALIASES: Record<string, string[]> = {
  Marketing: ['Marketing', 'Media'],
  Creative: ['Media', 'Marketing'],
  Construction: ['Construction', 'Property'],
};

const LOCATIONS_BY_SECTOR: Record<string, string[]> = {
  Tech: ['KL Sentral', 'Bangsar South', 'Cyberjaya', 'Petaling Jaya', 'Penang'],
  Finance: ['KL Sentral', 'KLCC', 'Menara KL', 'Bangsar'],
  Energy: ['KLCC', 'Kerteh', 'Bintulu', 'Miri'],
  Manufacturing: ['Penang', 'Kulim', 'Batu Kawan', 'Shah Alam', 'Senai'],
  Construction: ['Petaling Jaya', 'Shah Alam', 'Cyberjaya', 'Johor Bahru'],
  Healthcare: ['Bangsar', 'Petaling Jaya', 'George Town', 'Johor Bahru'],
  Education: ['Subang Jaya', 'Bandar Sunway', 'Cyberjaya', 'Kuala Lumpur'],
  Hospitality: ['Kuala Lumpur', 'Genting Highlands', 'Langkawi', 'Kota Kinabalu'],
  Logistics: ['Port Klang', 'Shah Alam', 'Sepang', 'Pasir Gudang'],
  'Public Sector': ['Putrajaya', 'Kuala Lumpur', 'Cyberjaya'],
  Legal: ['KLCC', 'KL Sentral', 'Menara KL'],
  Retail: ['Petaling Jaya', 'Mid Valley', 'Johor Bahru', 'Penang'],
  Agriculture: ['Klang', 'Sandakan', 'Lahad Datu', 'Sitiawan'],
};
const DEFAULT_LOCATIONS = ['Kuala Lumpur', 'Petaling Jaya', 'Selangor'];

function companiesForSector(sector: string): string[] {
  const prefixes = COMPANY_SECTOR_ALIASES[sector] || [sector];
  const matches = COMPANIES.filter((co) => prefixes.some((p) => co.sector.startsWith(p))).map((co) => co.name);
  return matches.length ? matches : COMPANIES.map((co) => co.name);
}

function remoteMode(sector: string, rng: () => number): 'Onsite' | 'Hybrid' | 'Remote' {
  const r = rng();
  if (REMOTE_FRIENDLY.has(sector)) return r < 0.45 ? 'Hybrid' : r < 0.75 ? 'Remote' : 'Onsite';
  if (ONSITE_LEANING.has(sector)) return r < 0.8 ? 'Onsite' : 'Hybrid';
  return r < 0.55 ? 'Onsite' : 'Hybrid'; // Finance / Legal / Public Sector / Education
}

function postedLabel(rng: () => number): string {
  const days = Math.floor(rng() * 28);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 14) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

function buildListing(occ: Occupation, id: number, rng: () => number): JobListing {
  const company = pickRandom(companiesForSector(occ.sector), rng);
  const location = pickRandom(LOCATIONS_BY_SECTOR[occ.sector] || DEFAULT_LOCATIONS, rng);
  const [lo, hi] = occ.salary_anchor_myr;
  const skills = occ.typical_skills.slice(0, 4);
  const bridge = skills.length > 1 ? `${skills[0]}, ${skills[1]}` : skills[0] || 'Adjacent skills';
  const seniorLabel = occ.seniority === 'exec' || occ.seniority === 'lead' ? 'Lead a team and' : occ.seniority === 'entry' ? 'Start your career and' : 'Own key deliverables and';

  return {
    id,
    title: occ.role,
    company,
    location,
    sector: occ.sector,
    salaryMin: lo,
    salaryMax: hi,
    exp: EXP_BY_SENIORITY[occ.seniority],
    fit: 55 + Math.floor(rng() * 41), // 55–95
    mycol: Boolean(occ.is_mycol_critical),
    remote: remoteMode(occ.sector, rng),
    skills,
    posted: postedLabel(rng),
    bridge,
    description: `${seniorLabel} contribute to ${company}'s ${occ.sector.toLowerCase()} team. Focus on ${skills.slice(0, 3).join(', ')}.`,
  };
}

function generateListings(): JobListing[] {
  const rng = seededRandom(42);
  // One listing per occupation, plus a second for MyCOL-critical roles (higher demand).
  const generated: JobListing[] = [];
  let id = CURATED.length + 1;
  for (const occ of OCCUPATIONS) {
    generated.push(buildListing(occ, id++, rng));
    if (occ.is_mycol_critical && rng() < 0.6) {
      generated.push(buildListing(occ, id++, rng));
    }
  }
  return generated;
}

export const JOB_LISTINGS: JobListing[] = [...CURATED, ...generateListings()];
