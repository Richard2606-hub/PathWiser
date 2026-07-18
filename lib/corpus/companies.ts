/**
 * Company directory — 10 real Malaysian employers.
 * Later replaced by Supabase `companies` table.
 */

export interface CompanyProfile {
  id: number;
  name: string;
  logo: string;
  sector: string;
  headcount: string;
  hires: string;
  retention: number;
  culture: string;
  hiringShape: string;
  mycolRoles: number;
  nextDestinations: string[];
  sdgs: number[];
  description: string;
}

export const COMPANIES: CompanyProfile[] = [
  { id: 1, name: 'Grab MY', logo: '🚗', sector: 'Tech · Ride-hailing', headcount: '2,400+',
    hires: '~120/yr in tech', retention: 87, culture: 'Fast-paced · Data-driven · Ownership',
    hiringShape: 'Senior ICs + strong PMs', mycolRoles: 12,
    nextDestinations: ['ByteDance', 'Shopee', 'Own startup'], sdgs: [8, 9, 10],
    description: 'Regional super-app HQ in Malaysia. Strong on data + growth.' },
  { id: 2, name: 'AirAsia', logo: '✈️', sector: 'Tech · Airlines', headcount: '18,000+',
    hires: '~80/yr in tech', retention: 78, culture: 'Bold · Frugal · Adventurous',
    hiringShape: 'Multi-disciplinary generalists', mycolRoles: 8,
    nextDestinations: ['Grab', 'Fintech', 'Consulting'], sdgs: [8, 9],
    description: 'Airline + super-app. Big on internal mobility.' },
  { id: 3, name: 'CIMB Digital', logo: '🏦', sector: 'Finance · Digital', headcount: '32,000+ (group)',
    hires: '~40/yr digital', retention: 82, culture: 'Regulated · Steady · Digital-first',
    hiringShape: 'Fintech converts + domain veterans', mycolRoles: 6,
    nextDestinations: ['Maybank', 'BigTech', 'Fintech founders'], sdgs: [8, 5],
    description: 'Regional bank building a digital platform + fintech ventures.' },
  { id: 4, name: 'Petronas Digital', logo: '⛽', sector: 'Energy · Digital', headcount: '48,000+',
    hires: '~60/yr digital', retention: 91, culture: 'Long-tenure · High trust · Deep domain',
    hiringShape: 'Domain-first engineers', mycolRoles: 15,
    nextDestinations: ['Aramco', 'Shell', 'Consulting'], sdgs: [8, 9],
    description: 'National energy company + digital arm. Long-tenure, deep-domain culture.' },
  { id: 5, name: 'Shopee MY', logo: '🛒', sector: 'Tech · E-commerce', headcount: '2,800+',
    hires: '~140/yr', retention: 71, culture: 'Fast · Intense · Merit-based',
    hiringShape: 'Ex-startup + junior high-potential', mycolRoles: 10,
    nextDestinations: ['Grab', 'Google', 'Founders'], sdgs: [8, 10],
    description: 'Regional e-commerce. Fast-paced, meritocratic, high burn.' },
  { id: 6, name: 'Astro', logo: '📺', sector: 'Media · Broadcasting', headcount: '4,200+',
    hires: '~35/yr in data', retention: 85, culture: 'Creative · Analytics-forward · Family-friendly',
    hiringShape: 'BI/marketing analysts', mycolRoles: 4,
    nextDestinations: ['Grab', 'Streaming co', 'MarTech'], sdgs: [8, 4],
    description: 'PayTV + streaming. Strong content + data teams.' },
  { id: 7, name: 'Maybank', logo: '🏛️', sector: 'Finance · Banking', headcount: '43,000+',
    hires: '~55/yr digital', retention: 88, culture: 'Prestigious · Structured · High-integrity',
    hiringShape: 'Senior leaders + graduate scheme', mycolRoles: 11,
    nextDestinations: ['Government', 'Consulting', 'Board roles'], sdgs: [8, 5],
    description: 'Largest bank by market cap. Structured career progression.' },
  { id: 8, name: 'MIMOS Berhad', logo: '🔬', sector: 'Research · Government-linked', headcount: '900+',
    hires: '~20/yr', retention: 89, culture: 'Research-first · Publish · Long-form focus',
    hiringShape: 'PhDs + deep specialists', mycolRoles: 8,
    nextDestinations: ['Universities', 'BigTech AI labs', 'Consulting'], sdgs: [4, 9],
    description: 'National R&D institution. Publication + patent culture.' },
  { id: 9, name: 'BoldRise Sdn Bhd', logo: '🚀', sector: 'Tech · SaaS', headcount: '65',
    hires: '~15/yr', retention: 74, culture: 'Startup · Founder-led · Rapid feedback',
    hiringShape: 'Early product + growth folks', mycolRoles: 3,
    nextDestinations: ['Fintech', 'Founders', 'BigTech'], sdgs: [8, 9],
    description: 'Series B SaaS. Founder-led, growing fast.' },
  { id: 10, name: 'iPay88', logo: '💳', sector: 'Finance · Payments', headcount: '250+',
    hires: '~20/yr in tech', retention: 83, culture: 'Payment rail · Reliability-first · SEA-focused',
    hiringShape: 'Distributed-systems engineers', mycolRoles: 5,
    nextDestinations: ['Stripe', 'Fintech', 'Consulting'], sdgs: [8, 9],
    description: 'Regional payments infrastructure. Strong on reliability engineering.' },
];
