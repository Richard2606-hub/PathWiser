/**
 * Job listings — 12 realistic Malaysian openings.
 * Later replaced by Supabase `job_listings` table.
 */

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

export const JOB_LISTINGS: JobListing[] = [
  { id: 1, title: 'Senior Data Scientist', company: 'Grab MY', location: 'KL', sector: 'Tech · Ride-hailing',
    salaryMin: 12000, salaryMax: 18000, exp: '4–7 yrs', fit: 92, mycol: true, remote: 'Hybrid',
    skills: ['Python', 'ML', 'SQL', 'A/B Testing'], posted: '2 days ago', bridge: 'Python, MLOps',
    description: 'Own the growth-and-retention modelling stack. Lead one experimentation squad. 4+ years of applied ML in production.' },
  { id: 2, title: 'ML Engineer', company: 'AirAsia', location: 'Sepang', sector: 'Tech · Airlines',
    salaryMin: 9500, salaryMax: 14000, exp: '3–5 yrs', fit: 88, mycol: true, remote: 'Hybrid',
    skills: ['TensorFlow', 'Kubernetes', 'Airflow'], posted: '5 days ago', bridge: 'MLOps, Deep Learning',
    description: 'Deploy pricing + demand forecasting models to production. Own the MLOps stack end-to-end.' },
  { id: 3, title: 'Product Analyst — Fintech', company: 'CIMB Digital', location: 'KL Sentral', sector: 'Finance · Digital',
    salaryMin: 7500, salaryMax: 11000, exp: '2–4 yrs', fit: 84, mycol: false, remote: 'Onsite',
    skills: ['SQL', 'Tableau', 'A/B Testing', 'Stakeholder Mgmt'], posted: '1 week ago', bridge: 'Product analytics',
    description: 'Analytics support to the fintech product team — payments, wealth, savings.' },
  { id: 4, title: 'Analytics Engineer', company: 'Shopee MY', location: 'Bangsar', sector: 'Tech · E-commerce',
    salaryMin: 10000, salaryMax: 15000, exp: '3–5 yrs', fit: 81, mycol: true, remote: 'Hybrid',
    skills: ['dbt', 'SQL', 'Python', 'Snowflake'], posted: '3 days ago', bridge: 'Data engineering, dbt',
    description: 'Own the growth analytics data mart. dbt / Snowflake / self-serve enablement.' },
  { id: 5, title: 'Lead Data Scientist', company: 'Petronas Digital', location: 'KLCC', sector: 'Energy · Digital',
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
  { id: 10, title: 'Senior Backend Engineer', company: 'iPay88', location: 'PJ', sector: 'Finance · Payments',
    salaryMin: 11000, salaryMax: 17000, exp: '5+ yrs', fit: 66, mycol: true, remote: 'Hybrid',
    skills: ['Go', 'PostgreSQL', 'Kafka', 'Distributed Systems'], posted: '6 days ago', bridge: 'Distributed systems',
    description: 'Payment rail — Go / PostgreSQL / Kafka. Own reliability + latency.' },
  { id: 11, title: 'Reservoir Engineer', company: 'Petronas Carigali', location: 'KLCC', sector: 'Energy · Upstream',
    salaryMin: 9000, salaryMax: 14000, exp: '3–6 yrs', fit: 40, mycol: true, remote: 'Onsite',
    skills: ['Petrel', 'Simulation', 'Geology'], posted: '2 weeks ago', bridge: 'Deep-domain switch',
    description: 'Reservoir modelling for Kimanis / Kikeh assets. Requires industry background.' },
  { id: 12, title: 'Head of Product', company: 'BoldRise Sdn Bhd', location: 'KL Sentral', sector: 'Product · SaaS',
    salaryMin: 22000, salaryMax: 32000, exp: '8+ yrs', fit: 55, mycol: false, remote: 'Hybrid',
    skills: ['Strategy', 'Cross-functional Leadership', 'Metrics'], posted: '1 week ago', bridge: 'IC → leadership',
    description: 'Take the product org from 15 to 40. Own P&L for the core product line.' },
];
