/**
 * Company directory — a broad, sector-diverse set of Malaysian employers.
 * Recognisable real employers plus modelled profiles across the whole economy,
 * so the Company Directory reflects the same 16-sector taxonomy as the engine.
 *
 * Modelled, non-authoritative signal (retention/hires/culture are illustrative,
 * not scraped or official). Later replaced by a Supabase `companies` table.
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

/** Compact constructor to keep the directory readable and shape-consistent. */
function c(
  id: number,
  name: string,
  logo: string,
  sector: string,
  headcount: string,
  hires: string,
  retention: number,
  culture: string,
  hiringShape: string,
  mycolRoles: number,
  nextDestinations: string[],
  sdgs: number[],
  description: string,
): CompanyProfile {
  return { id, name, logo, sector, headcount, hires, retention, culture, hiringShape, mycolRoles, nextDestinations, sdgs, description };
}

export const COMPANIES: CompanyProfile[] = [
  // ─────────────── TECH / DIGITAL ───────────────
  c(1, 'Grab MY', '🚗', 'Tech · Ride-hailing', '2,400+', '~120/yr in tech', 87, 'Fast-paced · Data-driven · Ownership', 'Senior ICs + strong PMs', 12, ['ByteDance', 'Shopee', 'Own startup'], [8, 9, 10], 'Regional super-app HQ in Malaysia. Strong on data + growth.'),
  c(2, 'Shopee MY', '🛒', 'Tech · E-commerce', '2,800+', '~140/yr', 71, 'Fast · Intense · Merit-based', 'Ex-startup + junior high-potential', 10, ['Grab', 'Google', 'Founders'], [8, 10], 'Regional e-commerce. Fast-paced, meritocratic, high burn.'),
  c(3, 'Carsome', '🚙', 'Tech · Automotive', '2,000+', '~90/yr', 76, 'Scale-up · Ownership · Data-first', 'Product + growth + ops talent', 7, ['Grab', 'Fintech', 'Founders'], [8, 9], 'Southeast Asia\'s largest used-car platform. KL tech hub.'),
  c(4, 'BigPay', '💸', 'Tech · Fintech', '600+', '~40/yr', 79, 'Mission-driven · Fast · Product-led', 'Fintech engineers + PMs', 8, ['Grab', 'BigTech', 'Founders'], [8, 9, 10], 'Consumer fintech from the Capital A group. Product-led culture.'),
  c(5, 'StoreHub', '🏪', 'Tech · SaaS', '350+', '~30/yr', 74, 'SME-focused · Scrappy · Customer-obsessed', 'Full-stack + growth', 4, ['Fintech', 'BigTech', 'Founders'], [8, 9], 'POS + business SaaS for SMEs across SEA.'),
  c(6, 'Aerodyne', '🛰️', 'Tech · Drone/AI', '900+', '~50/yr', 82, 'Deep-tech · Global · Research-forward', 'Drone/AI + geospatial engineers', 11, ['BigTech AI labs', 'Consulting', 'Founders'], [9, 11, 13], 'Global drone-tech + data analytics leader headquartered in Malaysia.'),
  c(7, 'MoneyLion / MRE', '🦁', 'Tech · Fintech', '500+', '~35/yr', 73, 'Product · Data · US-hours crossover', 'Backend + data engineers', 6, ['BigTech', 'Fintech', 'Founders'], [8, 9], 'Fintech engineering hub serving a US consumer-finance platform.'),
  c(8, 'BoldRise Sdn Bhd', '🚀', 'Tech · SaaS', '65', '~15/yr', 74, 'Startup · Founder-led · Rapid feedback', 'Early product + growth folks', 3, ['Fintech', 'Founders', 'BigTech'], [8, 9], 'Series B SaaS. Founder-led, growing fast. (Modelled)'),
  c(9, 'AirAsia MOVE', '✈️', 'Tech · Travel-tech', '1,200+', '~60/yr', 75, 'Bold · Frugal · Adventurous', 'Multi-disciplinary generalists', 8, ['Grab', 'Fintech', 'Consulting'], [8, 9], 'Travel + lifestyle super-app arm of Capital A.'),
  c(10, 'MIMOS Berhad', '🔬', 'Tech · R&D (Govt-linked)', '900+', '~20/yr', 89, 'Research-first · Publish · Long-form focus', 'PhDs + deep specialists', 8, ['Universities', 'BigTech AI labs', 'Consulting'], [4, 9], 'National R&D institution. Publication + patent culture.'),

  // ─────────────── FINANCE ───────────────
  c(11, 'Maybank', '🏛️', 'Finance · Banking', '43,000+', '~55/yr digital', 88, 'Prestigious · Structured · High-integrity', 'Senior leaders + graduate scheme', 11, ['Government', 'Consulting', 'Board roles'], [8, 5], 'Largest bank by market cap. Structured career progression.'),
  c(12, 'CIMB Group', '🏦', 'Finance · Banking', '32,000+ (group)', '~40/yr digital', 82, 'Regulated · Steady · Digital-first', 'Fintech converts + domain veterans', 6, ['Maybank', 'BigTech', 'Fintech founders'], [8, 5], 'Regional bank building a digital platform + fintech ventures.'),
  c(13, 'Public Bank', '🏢', 'Finance · Banking', '19,000+', '~30/yr', 90, 'Conservative · Stable · Long-tenure', 'Graduate scheme + credit specialists', 4, ['Maybank', 'CIMB', 'Consulting'], [8], 'Malaysia\'s most efficient bank. Very low attrition.'),
  c(14, 'RHB Banking Group', '🟦', 'Finance · Banking', '14,000+', '~35/yr', 84, 'Digital-transforming · Structured', 'Digital + risk + graduate scheme', 5, ['Maybank', 'Fintech', 'Consulting'], [8, 5], 'Top-5 Malaysian bank investing heavily in digital.'),
  c(15, 'Touch \'n Go Digital', '📲', 'Finance · Fintech', '900+', '~50/yr', 77, 'Product-led · Fast · Regulated fintech', 'Product + data + engineers', 7, ['Grab', 'BigPay', 'Founders'], [8, 9, 10], 'Malaysia\'s leading e-wallet, backed by CIMB + Ant Group.'),
  c(16, 'Etiqa Insurance', '🛡️', 'Finance · Insurance', '3,000+', '~40/yr', 85, 'Customer-first · Digital · Steady', 'Actuarial + digital + underwriting', 5, ['Great Eastern', 'Prudential', 'Consulting'], [3, 8], 'Insurance arm of Maybank, strong in digital protection.'),
  c(17, 'Bursa Malaysia', '📈', 'Finance · Exchange', '700+', '~20/yr', 88, 'Regulated · Prestigious · Governance-heavy', 'Markets + tech + risk specialists', 4, ['BNM', 'Banks', 'Consulting'], [8, 16], 'National stock exchange operator. Strong governance culture.'),
  c(18, 'Great Eastern Life', '🌏', 'Finance · Insurance', '2,600+', '~30/yr', 86, 'Established · Agency-strong · Steady', 'Actuarial + bancassurance + digital', 4, ['Prudential', 'AIA', 'Consulting'], [3, 8], 'Leading life insurer, part of the OCBC group.'),

  // ─────────────── MARKETING & CREATIVE ───────────────
  c(19, 'Astro', '📺', 'Media · Broadcasting', '4,200+', '~35/yr in data', 85, 'Creative · Analytics-forward · Family-friendly', 'BI/marketing analysts + content', 4, ['Grab', 'Streaming co', 'MarTech'], [8, 4], 'PayTV + streaming. Strong content + data teams.'),
  c(20, 'Media Prima', '🗞️', 'Media · Integrated', '3,500+', '~25/yr', 78, 'Newsroom · Fast · Multi-platform', 'Journalists + digital + producers', 2, ['Astro', 'Digital media', 'PR firms'], [4, 8, 16], 'Malaysia\'s largest integrated media group.'),
  c(21, 'Naga DDB Tribal', '🎨', 'Marketing · Agency', '250+', '~30/yr', 70, 'Creative · Deadline-driven · Portfolio-led', 'Creatives + account + strategy', 1, ['Leo Burnett', 'In-house brand', 'Founders'], [8, 12], 'Leading creative + digital agency in KL.'),
  c(22, 'REV Media Group', '📱', 'Media · Digital', '400+', '~35/yr', 72, 'Digital-native · Viral · Fast', 'Content + social + growth', 2, ['Astro', 'Brand side', 'Founders'], [4, 8], 'Digital publisher behind SAYS, Juice and more.'),
  c(23, 'Ensemble Brand Co', '✨', 'Marketing · Agency', '90', '~20/yr', 68, 'Boutique · Creative · Client-facing', 'Brand + content + performance', 1, ['Network agencies', 'In-house', 'Founders'], [8, 12], 'Modelled independent brand + performance agency.'),

  // ─────────────── ENERGY & UTILITIES ───────────────
  c(24, 'Petronas', '⛽', 'Energy · Oil & Gas', '48,000+', '~200/yr', 91, 'Long-tenure · High trust · Deep domain', 'Domain-first engineers + graduates', 15, ['Shell', 'Aramco', 'Consulting'], [7, 8, 9], 'National energy company. Long-tenure, deep-domain culture.'),
  c(25, 'Petronas Carigali', '🛢️', 'Energy · Upstream', '10,000+', '~80/yr', 89, 'Technical · Rigorous · Field-driven', 'Reservoir + drilling + subsurface', 12, ['Shell', 'ExxonMobil', 'Consulting'], [7, 8, 9], 'Upstream E&P arm of Petronas.'),
  c(26, 'Tenaga Nasional (TNB)', '⚡', 'Energy · Utilities', '35,000+', '~120/yr', 90, 'Utility-scale · Structured · Public-service', 'Power + grid + renewable engineers', 9, ['Gentari', 'Consulting', 'IPPs'], [7, 9, 13], 'National electricity utility driving the energy transition.'),
  c(27, 'Gentari', '🌱', 'Energy · Renewables', '1,500+', '~90/yr', 80, 'Clean-energy · Mission · Scaling fast', 'Renewables + hydrogen + EV', 10, ['TNB', 'IPPs', 'Consulting'], [7, 9, 13], 'Petronas clean-energy company: renewables, hydrogen, mobility.'),
  c(28, 'Shell Malaysia', '🐚', 'Energy · Oil & Gas', '6,000+', '~70/yr', 87, 'Global · Safety-first · Structured', 'Subsurface + trading + digital', 9, ['Petronas', 'BP', 'Consulting'], [7, 8, 13], 'Integrated energy major with strong Malaysian operations.'),
  c(29, 'Yinson Holdings', '🚢', 'Energy · FPSO/Marine', '2,500+', '~60/yr', 83, 'Engineering-led · Global projects · Growth', 'Marine + FPSO + renewables engineers', 7, ['Petronas', 'Bumi Armada', 'Consulting'], [7, 9, 13], 'Global FPSO leader expanding into renewables + green tech.'),
  c(30, 'Cypark Resources', '☀️', 'Energy · Renewables', '600+', '~30/yr', 78, 'Green-infra · Project-based · Growing', 'Solar + waste-to-energy engineers', 5, ['Gentari', 'TNB', 'EPC firms'], [7, 11, 13], 'Renewable energy + environmental solutions developer.'),

  // ─────────────── CONSULTING ───────────────
  c(31, 'Accenture Malaysia', '🔺', 'Consulting · Tech', '3,000+', '~200/yr', 72, 'Fast-paced · Learning-heavy · Client-driven', 'Consultants + tech + graduate intake', 8, ['BigTech', 'In-house strategy', 'Founders'], [8, 9], 'Global professional-services + technology consulting.'),
  c(32, 'Deloitte Malaysia', '🟢', 'Consulting · Advisory', '2,500+', '~180/yr', 74, 'Prestigious · Structured · Up-or-out', 'Audit + advisory + graduate scheme', 6, ['Industry', 'Banks', 'Founders'], [8, 16], 'Big Four professional services: audit, tax, advisory.'),
  c(33, 'PwC Malaysia', '🔷', 'Consulting · Advisory', '3,000+', '~200/yr', 73, 'Prestigious · Learning · Client-facing', 'Assurance + consulting + graduates', 6, ['Industry CFO track', 'Banks', 'Consulting'], [8, 16], 'Big Four firm strong in assurance + deals advisory.'),
  c(34, 'EY Malaysia', '🟡', 'Consulting · Advisory', '2,800+', '~190/yr', 72, 'Structured · Global · High-performance', 'Assurance + consulting + graduates', 6, ['Industry', 'Banks', 'Founders'], [8, 16], 'Big Four firm with strong consulting + tax practices.'),
  c(35, 'KPMG Malaysia', '🔵', 'Consulting · Advisory', '2,400+', '~170/yr', 73, 'Rigorous · Structured · Client-driven', 'Audit + advisory + graduate scheme', 5, ['Industry', 'Banks', 'Consulting'], [8, 16], 'Big Four firm: audit, tax and management consulting.'),
  c(36, 'Vector Strategy Partners', '📐', 'Consulting · Strategy', '120', '~25/yr', 76, 'Boutique · Analytical · High-ownership', 'Strategy + analytics consultants', 3, ['MBB', 'Industry strategy', 'Founders'], [8, 9], 'Modelled homegrown strategy + analytics consultancy.'),

  // ─────────────── HEALTHCARE ───────────────
  c(37, 'IHH Healthcare', '🏥', 'Healthcare · Hospitals', '30,000+', '~150/yr', 86, 'Clinical excellence · Structured · Caring', 'Doctors + nurses + allied health', 10, ['KPJ', 'Public hospitals', 'MOH'], [3, 8], 'One of the world\'s largest private healthcare groups.'),
  c(38, 'KPJ Healthcare', '➕', 'Healthcare · Hospitals', '15,000+', '~120/yr', 85, 'Patient-first · Network-wide · Steady', 'Nurses + medical officers + specialists', 8, ['IHH', 'MOH', 'Sunway Medical'], [3, 8], 'Largest private hospital network in Malaysia.'),
  c(39, 'Sunway Medical Centre', '💊', 'Healthcare · Hospital', '4,000+', '~90/yr', 87, 'Quality-accredited · Research-friendly', 'Specialists + nurses + allied health', 7, ['IHH', 'KPJ', 'Academia'], [3, 4], 'Leading quaternary private hospital in the Klang Valley.'),
  c(40, 'Pharmaniaga', '🧪', 'Healthcare · Pharma', '3,500+', '~60/yr', 84, 'Regulated · Supply-critical · Steady', 'Pharmacists + QA + supply chain', 6, ['Hospitals', 'MNC pharma', 'Regulators'], [3, 9], 'Largest integrated pharmaceutical group in Malaysia.'),
  c(41, 'Columbia Asia', '🩺', 'Healthcare · Hospitals', '3,000+', '~70/yr', 83, 'Efficient · Community-focused · Standardised', 'Medical officers + nurses', 5, ['IHH', 'KPJ', 'MOH'], [3, 8], 'Regional hospital network known for community hospitals.'),

  // ─────────────── EDUCATION ───────────────
  c(42, 'Sunway University', '🎓', 'Education · Higher Ed', '1,800+', '~80/yr', 84, 'Research-growing · Student-centred · Global', 'Lecturers + researchers + admin', 6, ['UM', 'Overseas universities', 'Industry'], [4, 8, 17], 'Leading private university with strong global partnerships.'),
  c(43, 'Taylor\'s University', '📚', 'Education · Higher Ed', '2,000+', '~85/yr', 82, 'Employability-focused · Industry-linked', 'Lecturers + industry practitioners', 5, ['Sunway', 'INTI', 'Industry'], [4, 8], 'Top-ranked private university in Malaysia.'),
  c(44, 'Universiti Malaya (UM)', '🏛️', 'Education · Public University', '5,000+', '~100/yr', 88, 'Research-intensive · Prestigious · Tenure-track', 'Academics + researchers + PhD supervisors', 8, ['Overseas universities', 'Govt', 'Industry R&D'], [4, 9, 17], 'Malaysia\'s oldest and highest-ranked public university.'),
  c(45, 'Asia Pacific University (APU)', '💻', 'Education · Tech University', '1,000+', '~60/yr', 80, 'Tech-focused · Industry-aligned · Diverse', 'Computing + engineering lecturers', 5, ['Sunway', 'Industry', 'Startups'], [4, 8, 9], 'Technology-focused private university in TPM.'),
  c(46, 'INTI International', '🌐', 'Education · Higher Ed', '1,500+', '~70/yr', 79, 'Employability · Global pathways · Practical', 'Lecturers + student services', 3, ['Taylor\'s', 'Industry', 'Overseas'], [4, 8], 'Private university with strong industry + transfer pathways.'),

  // ─────────────── MANUFACTURING & ENGINEERING ───────────────
  c(47, 'Intel Malaysia', '🔵', 'Manufacturing · Semiconductor', '15,000+', '~250/yr', 85, 'Global · Engineering-deep · Structured', 'Process + design + test engineers', 12, ['Infineon', 'AMD', 'Micron'], [8, 9], 'Intel\'s largest site outside the US, in Penang + Kulim.'),
  c(48, 'Infineon Malaysia', '⚙️', 'Manufacturing · Semiconductor', '14,000+', '~220/yr', 86, 'German-precision · Engineering · Long-tenure', 'Process + automation + R&D engineers', 11, ['Intel', 'STMicro', 'Consulting'], [8, 9, 13], 'Major semiconductor manufacturing + R&D hub in Kulim/Melaka.'),
  c(49, 'Western Digital', '💽', 'Manufacturing · Semiconductor', '10,000+', '~180/yr', 82, 'Data-storage · Automation-heavy · Global', 'Manufacturing + quality + automation', 9, ['Intel', 'Micron', 'Seagate'], [8, 9], 'Storage-device manufacturing with big Penang operations.'),
  c(50, 'Top Glove', '🧤', 'Manufacturing · Rubber Products', '18,000+', '~150/yr', 74, 'High-volume · Efficiency-driven · Structured', 'Production + quality + engineering', 6, ['Hartalega', 'FMCG', 'Consulting'], [8, 9, 12], 'World\'s largest rubber-glove manufacturer.'),
  c(51, 'ViTrox', '📷', 'Manufacturing · Automation', '2,500+', '~90/yr', 87, 'Homegrown · Innovation-led · Values-driven', 'Machine vision + automation + R&D', 8, ['Intel', 'Inari', 'Startups'], [8, 9], 'Malaysian automated vision inspection champion in Penang.'),
  c(52, 'Inari Amertron', '🔌', 'Manufacturing · Semiconductor', '9,000+', '~120/yr', 81, 'OSAT · High-mix · Growth', 'Test + process + packaging engineers', 7, ['Intel', 'Infineon', 'ViTrox'], [8, 9], 'Leading outsourced semiconductor assembly + test player.'),

  // ─────────────── CONSTRUCTION & PROPERTY ───────────────
  c(53, 'Gamuda Berhad', '🏗️', 'Construction · Infrastructure', '5,000+', '~120/yr', 85, 'Engineering-led · Tunnelling-strong · Digital', 'Civil + structural + project engineers', 9, ['IJM', 'MRT Corp', 'Consulting'], [9, 11], 'Leading infrastructure + property group (MRT, tunnelling).'),
  c(54, 'IJM Corporation', '🧱', 'Construction · Diversified', '4,500+', '~100/yr', 83, 'Diversified · Structured · Long-tenure', 'Civil + QS + project managers', 7, ['Gamuda', 'Sunway', 'Consulting'], [9, 11], 'Diversified construction, property, plantation + infra group.'),
  c(55, 'Sunway Construction', '🏢', 'Construction · Building', '3,000+', '~80/yr', 84, 'Integrated · Safety-first · Digital-BIM', 'Civil + BIM + project delivery', 6, ['Gamuda', 'IJM', 'WCT'], [9, 11], 'Construction arm of the Sunway Group.'),
  c(56, 'SP Setia', '🏘️', 'Property · Development', '2,000+', '~60/yr', 82, 'Township-scale · Design-led · Steady', 'Development + planning + sales', 4, ['Mah Sing', 'UEM Sunrise', 'Sime Property'], [11], 'Leading township + property developer.'),
  c(57, 'IJM Meridian Modelled', '📏', 'Construction · Engineering', '400', '~30/yr', 78, 'Project-based · Technical · Growing', 'Structural + QS + site engineers', 3, ['Gamuda', 'IJM', 'Consultancies'], [9, 11], 'Modelled mid-size civil + structural engineering firm.'),

  // ─────────────── HOSPITALITY & TOURISM ───────────────
  c(58, 'Genting Malaysia', '🎰', 'Hospitality · Resorts', '16,000+', '~200/yr', 79, 'Integrated-resort · Service-intense · 24/7', 'Hotel ops + F&B + entertainment', 5, ['Shangri-La', 'Berjaya Hotels', 'MICE'], [8, 12], 'Integrated resort operator (Resorts World Genting).'),
  c(59, 'Shangri-La Hotels MY', '🏨', 'Hospitality · Hotels', '4,000+', '~120/yr', 82, 'Luxury-service · Guest-first · Standards-driven', 'Front office + F&B + culinary', 3, ['Marriott', 'YTL Hotels', 'Genting'], [8, 12], 'Luxury hotel group with flagship KL + resort properties.'),
  c(60, 'YTL Hotels', '🛎️', 'Hospitality · Hotels', '3,000+', '~90/yr', 81, 'Boutique-luxury · Design-led · Service', 'Hotel management + culinary + events', 3, ['Shangri-La', 'Genting', 'Marriott'], [8, 11, 12], 'Owner-operator of luxury boutique resorts + hotels.'),
  c(61, 'Berjaya Hotels & Resorts', '🌴', 'Hospitality · Resorts', '2,500+', '~70/yr', 78, 'Island-resort · Leisure · Service', 'Resort ops + F&B + tour operations', 2, ['Genting', 'Shangri-La', 'Travel agencies'], [8, 12, 14], 'Resort operator across Malaysian islands + city hotels.'),

  // ─────────────── LOGISTICS & SUPPLY CHAIN ───────────────
  c(62, 'Pos Malaysia', '📮', 'Logistics · Postal', '15,000+', '~100/yr', 80, 'National-scale · Transforming · Structured', 'Logistics + operations + digital', 5, ['J&T', 'GDex', 'Ninja Van'], [8, 9], 'National postal + parcel operator undergoing digital transformation.'),
  c(63, 'J&T Express MY', '📦', 'Logistics · Last-mile', '8,000+', '~150/yr', 71, 'Fast-scaling · Operations-intense · Data', 'Fleet + operations + supply chain', 4, ['Ninja Van', 'GDex', 'Shopee'], [8, 9], 'Fast-growing last-mile parcel network across SEA.'),
  c(64, 'Ninja Van MY', '🥷', 'Logistics · E-commerce', '3,500+', '~100/yr', 73, 'Tech-enabled · Ops-heavy · Startup', 'Route optimization + ops + data', 5, ['J&T', 'Shopee', 'Grab'], [8, 9], 'Tech-driven last-mile logistics for e-commerce.'),
  c(65, 'Westports Malaysia', '⚓', 'Logistics · Ports', '2,000+', '~60/yr', 86, 'Port-scale · Engineering · High-safety', 'Port ops + engineering + supply chain', 6, ['MISC', 'MMC', 'Consulting'], [8, 9, 14], 'Major container port operator at Port Klang.'),
  c(66, 'MISC Berhad', '🚢', 'Logistics · Shipping', '9,000+', '~80/yr', 87, 'Maritime · Global · Engineering-deep', 'Marine + logistics + engineering', 7, ['Petronas', 'Yinson', 'Consulting'], [8, 9, 14], 'Global energy-shipping + marine solutions provider (Petronas group).'),

  // ─────────────── PUBLIC SECTOR ───────────────
  c(67, 'Khazanah Nasional', '🏦', 'Public Sector · Sovereign Fund', '600+', '~30/yr', 87, 'Strategic · Analytical · Prestigious', 'Investment + strategy + analysts', 6, ['GLCs', 'Banks', 'Consulting'], [8, 9, 17], 'Malaysia\'s sovereign wealth fund.'),
  c(68, 'MDEC', '💠', 'Public Sector · Digital Economy', '400+', '~25/yr', 82, 'Policy-meets-tech · Mission · Ecosystem', 'Digital policy + programs + analysts', 5, ['MIDA', 'Startups', 'Consulting'], [8, 9, 17], 'Agency driving Malaysia\'s digital economy.'),
  c(69, 'TalentCorp', '🧭', 'Public Sector · Talent', '300+', '~20/yr', 83, 'People-first · Policy · Ecosystem-building', 'Talent programs + research + partnerships', 3, ['MDEC', 'HR consulting', 'Industry'], [4, 8, 17], 'Agency aligning talent supply with industry needs.'),
  c(70, 'EPF (KWSP)', '💰', 'Public Sector · Pension Fund', '6,000+', '~60/yr', 89, 'Steward-of-savings · Analytical · Structured', 'Investment + actuarial + digital', 6, ['Khazanah', 'Banks', 'Asset managers'], [1, 8, 10], 'National retirement savings fund, a major institutional investor.'),
  c(71, 'Department of Statistics (DOSM)', '📊', 'Public Sector · Statistics', '3,000+', '~40/yr', 88, 'Data-first · Rigorous · Public-service', 'Statisticians + data + field officers', 5, ['Central bank', 'Academia', 'Consulting'], [16, 17], 'National statistics agency producing official data.'),

  // ─────────────── LEGAL ───────────────
  c(72, 'Zaid Ibrahim & Co (ZICO)', '⚖️', 'Legal · Corporate Law', '400+', '~40/yr', 78, 'Regional · Corporate-heavy · Up-or-out', 'Corporate + M&A + associates', 4, ['Skrine', 'In-house counsel', 'Regulators'], [16], 'One of Malaysia\'s largest law firms, strong in corporate.'),
  c(73, 'Skrine', '📜', 'Legal · Full-service', '250+', '~30/yr', 80, 'Prestigious · Rigorous · Mentoring', 'Litigation + corporate + IP', 3, ['Shearn Delamore', 'In-house', 'Bar'], [16], 'Leading full-service law firm (dispute + corporate).'),
  c(74, 'Shearn Delamore & Co', '🏛️', 'Legal · Full-service', '250+', '~28/yr', 81, 'Established · High-integrity · Structured', 'Corporate + tax + employment', 3, ['Skrine', 'Rahmat Lim', 'In-house'], [16], 'One of the oldest and largest firms in Malaysia.'),
  c(75, 'Christopher & Lee Ong', '🔖', 'Legal · Corporate Law', '200+', '~25/yr', 79, 'Regional-network · Corporate · Fast-track', 'Corporate + finance + associates', 3, ['Rajah & Tann network', 'In-house', 'Banks'], [16], 'Member of the Rajah & Tann Asia network.'),

  // ─────────────── RETAIL & FMCG ───────────────
  c(76, 'Nestlé Malaysia', '🍫', 'Retail · FMCG', '5,000+', '~120/yr', 86, 'Structured · Brand-led · Graduate-strong', 'Brand + supply chain + sales + graduates', 7, ['Unilever', 'F&N', 'Mondelez'], [2, 3, 12], 'Leading FMCG company with strong graduate programs.'),
  c(77, 'Unilever Malaysia', '🧴', 'Retail · FMCG', '2,500+', '~90/yr', 84, 'Purpose-driven · Marketing-strong · Structured', 'Brand + supply chain + sales', 6, ['Nestlé', 'P&G', 'Reckitt'], [3, 6, 12], 'Global FMCG with strong personal-care + foods brands.'),
  c(78, 'AEON Co (M)', '🛍️', 'Retail · Department/Grocery', '12,000+', '~130/yr', 78, 'Retail-ops · Customer-first · Scale', 'Store ops + merchandising + category', 4, ['Lotus\'s', 'Padini', 'FMCG'], [8, 12], 'Major retailer operating malls + supermarkets.'),
  c(79, 'Mr DIY', '🔧', 'Retail · Home Improvement', '12,000+', '~200/yr', 74, 'Value-retail · Fast-expansion · Lean', 'Store ops + supply chain + expansion', 3, ['AEON', '99 Speedmart', 'FMCG'], [8, 12], 'Malaysia\'s largest home-improvement retailer.'),
  c(80, 'Padini Holdings', '👕', 'Retail · Fashion', '3,000+', '~70/yr', 76, 'Fashion-retail · Brand-portfolio · Ops', 'Retail ops + merchandising + e-commerce', 2, ['AEON', 'Uniqlo', 'E-commerce'], [8, 12], 'Homegrown multi-brand fashion retailer.'),
  c(81, 'Guardian Malaysia', '💊', 'Retail · Health & Beauty', '4,000+', '~80/yr', 77, 'Health-retail · Pharmacy-led · Customer-first', 'Pharmacists + retail ops + category', 3, ['Watsons', 'AEON Wellness', 'FMCG'], [3, 8], 'Leading health + beauty retail chain.'),

  // ─────────────── AGRICULTURE & AGRITECH ───────────────
  c(82, 'Sime Darby Plantation', '🌴', 'Agriculture · Plantation', '30,000+', '~150/yr', 84, 'Sustainability-led · Estate-scale · Structured', 'Agronomists + estate managers + sustainability', 8, ['IOI', 'KLK', 'FGV'], [2, 12, 15], 'One of the world\'s largest certified palm-oil producers.'),
  c(83, 'IOI Corporation', '🌾', 'Agriculture · Plantation', '25,000+', '~120/yr', 83, 'Integrated · Efficient · Long-tenure', 'Plantation + food science + supply chain', 6, ['Sime Darby', 'KLK', 'FMCG'], [2, 12, 15], 'Integrated palm-oil + oleochemicals group.'),
  c(84, 'Kuala Lumpur Kepong (KLK)', '🌱', 'Agriculture · Plantation', '35,000+', '~130/yr', 85, 'Diversified-agri · Steady · Sustainability', 'Agronomists + manufacturing + R&D', 6, ['Sime Darby', 'IOI', 'Oleochem'], [2, 9, 15], 'Diversified plantation + manufacturing conglomerate.'),
  c(85, 'FGV Holdings', '🚜', 'Agriculture · Agribusiness', '20,000+', '~100/yr', 79, 'Agri-scale · Transforming · Smallholder-linked', 'Plantation + logistics + sustainability', 5, ['Sime Darby', 'IOI', 'Food companies'], [1, 2, 15], 'Global agribusiness + one of the largest oil-palm operators.'),
  c(86, 'BoomGrow Modelled', '🥬', 'Agriculture · Agritech', '80', '~15/yr', 76, 'Indoor-farming · Tech-led · Mission', 'Agritech + controlled-environment + data', 3, ['Agri-corporates', 'Startups', 'FMCG'], [2, 9, 12], 'Modelled indoor precision-farming agritech venture.'),

  // ─────────────── TELECOMMUNICATIONS ───────────────
  c(87, 'Maxis', '📶', 'Telecommunications · Mobile', '3,500+', '~90/yr', 84, 'Network-scale · Digital-transforming · Structured', 'Network + digital + data engineers', 8, ['CelcomDigi', 'TM', 'Grab'], [8, 9], 'Leading mobile + converged telco driving 5G + enterprise.'),
  c(88, 'CelcomDigi', '📡', 'Telecommunications · Mobile', '5,000+', '~110/yr', 80, 'Post-merger · Fast-transforming · Engineering-deep', 'RF + core network + digital', 9, ['Maxis', 'TM', 'Tech'], [8, 9], 'Malaysia\'s largest mobile operator after the Celcom-Digi merger.'),
  c(89, 'Telekom Malaysia (TM)', '☎️', 'Telecommunications · Fixed/Fibre', '18,000+', '~120/yr', 86, 'National-infra · Fibre-led · Long-tenure', 'Network + fibre + cloud engineers', 7, ['Maxis', 'CelcomDigi', 'Consulting'], [8, 9], 'National connectivity + fibre broadband (Unifi) provider.'),
  c(90, 'U Mobile', '📱', 'Telecommunications · Mobile', '1,500+', '~50/yr', 77, 'Challenger · Agile · Growth', 'Network + digital + product', 4, ['Maxis', 'CelcomDigi', 'Fintech'], [8, 9], 'Challenger mobile operator investing in 5G rollout.'),

  // ─────────────── AVIATION ───────────────
  c(91, 'Malaysia Airlines', '🛫', 'Aviation · Airline', '13,000+', '~150/yr', 81, 'Flag-carrier · Safety-first · Service', 'Pilots + cabin crew + AME + ops', 6, ['AirAsia', 'Singapore Airlines', 'Emirates'], [8, 9], 'National flag carrier under Malaysia Aviation Group.'),
  c(92, 'AirAsia', '✈️', 'Aviation · Low-cost Airline', '18,000+', '~200/yr', 76, 'Bold · Frugal · Fast', 'Cabin crew + pilots + engineering + ops', 7, ['Malaysia Airlines', 'Batik Air', 'Fintech'], [8, 9], 'Leading low-cost carrier and the core of Capital A.'),
  c(93, 'Malaysia Airports (MAHB)', '🛬', 'Aviation · Airports', '10,000+', '~90/yr', 85, 'Infrastructure · Ops-critical · Structured', 'Airport ops + engineering + safety', 5, ['Airlines', 'Ground handlers', 'GLCs'], [8, 9, 11], 'Operator of KLIA + a network of Malaysian airports.'),
  c(94, 'AME Aerospace (MRO)', '🛩️', 'Aviation · MRO', '1,200+', '~60/yr', 82, 'Engineering-deep · Compliance-heavy · Technical', 'Aircraft maintenance + avionics + quality', 6, ['Malaysia Airlines', 'AirAsia', 'Airlines'], [8, 9], 'Modelled aircraft maintenance, repair + overhaul provider.'),

  // ─────────────── AUTOMOTIVE ───────────────
  c(95, 'Perodua', '🚗', 'Automotive · Manufacturer', '11,000+', '~130/yr', 87, 'Volume-manufacturing · Engineering · Long-tenure', 'Automotive + production + quality engineers', 7, ['Proton', 'UMW Toyota', 'Manufacturing'], [8, 9], 'Malaysia\'s best-selling car manufacturer.'),
  c(96, 'Proton', '🚙', 'Automotive · Manufacturer', '9,000+', '~110/yr', 82, 'National-brand · Reviving · Engineering', 'R&D + production + EV engineers', 6, ['Perodua', 'Geely', 'Manufacturing'], [8, 9, 13], 'National carmaker, now Geely-partnered and export-growing.'),
  c(97, 'UMW Toyota Motor', '🚘', 'Automotive · Distributor', '4,000+', '~70/yr', 84, 'Quality-driven · Service-strong · Structured', 'Service + after-sales + engineering', 4, ['Perodua', 'Sime Darby Motors', 'Honda'], [8, 9], 'Assembler + distributor of Toyota vehicles in Malaysia.'),
  c(98, 'Sime Darby Motors', '🏎️', 'Automotive · Retail/After-sales', '6,000+', '~80/yr', 80, 'Multi-brand · Retail-led · Service', 'Service advisors + technicians + sales', 3, ['UMW Toyota', 'BMW', 'Auto retail'], [8, 9], 'Multi-brand automotive retail + after-sales group.'),

  // ─────────────── INSURANCE & TAKAFUL ───────────────
  c(99, 'Prudential Malaysia', '🛡️', 'Insurance · Life', '2,500+', '~70/yr', 85, 'Agency-strong · Structured · Customer-first', 'Actuarial + underwriting + agency', 6, ['AIA', 'Great Eastern', 'Allianz'], [3, 8], 'Leading life insurer with a large agency force.'),
  c(100, 'AIA Malaysia', '🌐', 'Insurance · Life & Health', '3,000+', '~80/yr', 84, 'Wellness-led · Digital · Agency-driven', 'Actuarial + health + digital + agency', 6, ['Prudential', 'Great Eastern', 'Allianz'], [3, 8], 'Major life + health insurer with a wellness focus.'),
  c(101, 'Allianz Malaysia', '🔷', 'Insurance · General & Life', '2,000+', '~60/yr', 86, 'Global-standard · Data-driven · Structured', 'Underwriting + actuarial + claims', 5, ['AIA', 'Zurich', 'Etiqa'], [3, 8], 'Composite insurer strong in general + life segments.'),
  c(102, 'Syarikat Takaful Malaysia', '☪️', 'Insurance · Takaful', '1,200+', '~40/yr', 85, 'Shariah-compliant · Steady · Community', 'Takaful + actuarial + agency', 4, ['Etiqa Takaful', 'Prudential BSN', 'Banks'], [3, 8, 10], 'Pioneer Takaful operator in Malaysia.'),

  // ─────────────── PHARMA & LIFE SCIENCES ───────────────
  c(103, 'Duopharma Biotech', '🧬', 'Pharma · Manufacturing', '1,500+', '~55/yr', 84, 'GMP · R&D-growing · Regulated', 'Formulation + QA/QC + regulatory', 6, ['Pharmaniaga', 'CCM', 'MNC pharma'], [3, 9], 'Leading homegrown generic + biosimilar manufacturer.'),
  c(104, 'Pfizer Malaysia', '💊', 'Pharma · MNC', '600+', '~40/yr', 83, 'Global-standard · Science-led · Structured', 'Medical + regulatory + commercial', 5, ['Novartis', 'GSK', 'Duopharma'], [3, 9], 'Malaysian affiliate of a global pharmaceutical leader.'),
  c(105, 'Kotra Pharma', '🧪', 'Pharma · Manufacturing', '900+', '~35/yr', 82, 'Brand-led · Manufacturing · Growing', 'QA/QC + production + medical reps', 4, ['Duopharma', 'YSP', 'FMCG health'], [3, 9], 'Manufacturer of Appeton + consumer-health brands in Melaka.'),

  // ─────────────── ENVIRONMENTAL & ESG ───────────────
  c(106, 'Cenviro', '♻️', 'Environmental · Waste Management', '1,000+', '~35/yr', 81, 'Sustainability-led · Compliance-heavy · Mission', 'Environmental + EHS + engineering', 5, ['ERM', 'SWM', 'Consulting'], [11, 12, 13], 'Integrated environmental + hazardous-waste solutions provider.'),
  c(107, 'ERM Malaysia', '🌍', 'Environmental · Consultancy', '150+', '~25/yr', 80, 'Advisory · Global-network · ESG-forward', 'ESG + environmental consultants', 4, ['Cenviro', 'Big Four ESG', 'Industry'], [12, 13, 17], 'Global sustainability consultancy advising on ESG + climate.'),

  // ─────────────── NON-PROFIT / SOCIAL IMPACT ───────────────
  c(108, 'MERCY Malaysia', '⛑️', 'Non-profit · Humanitarian', '300+', '~25/yr', 82, 'Mission-driven · Field-focused · Resilient', 'Program + field + fundraising', 2, ['UN agencies', 'Yayasan Hasanah', 'NGOs'], [1, 3, 17], 'Humanitarian NGO delivering medical relief + resilience programs.'),
  c(109, 'Yayasan Hasanah', '🤝', 'Non-profit · Foundation', '150+', '~20/yr', 84, 'Impact-led · Grant-making · Strategic', 'Program + grants + M&E', 3, ['Khazanah', 'NGOs', 'Consulting'], [1, 4, 17], 'Impact foundation of Khazanah across education, environment + community.'),
  c(110, 'WWF-Malaysia', '🐯', 'Non-profit · Conservation', '200+', '~20/yr', 83, 'Conservation-led · Science-based · Advocacy', 'Conservation + policy + fundraising', 2, ['Yayasan Hasanah', 'Govt', 'NGOs'], [13, 14, 15], 'Conservation NGO protecting Malaysia\'s biodiversity.'),

  // ─────────────── SPORTS & FITNESS ───────────────
  c(111, 'Fitness First Malaysia', '🏋️', 'Sports & Fitness · Gyms', '1,200+', '~60/yr', 74, 'Wellness · Service-led · Membership', 'Trainers + fitness + operations', 2, ['Celebrity Fitness', 'Boutique gyms', 'Wellness'], [3, 8], 'Premium fitness-club chain across the Klang Valley.'),
  c(112, 'PurpleVibe Sports Modelled', '💪', 'Sports & Fitness · Performance', '120', '~20/yr', 76, 'Athlete-focused · Data-led · Community', 'Coaches + sports science + physio', 2, ['National Sports Institute', 'Clubs', 'Gyms'], [3, 4], 'Modelled sports-performance + athlete-development centre.'),

  // ─────────────── MARITIME & PORTS ───────────────
  c(113, 'Bintulu Port', '⚓', 'Maritime · Ports', '1,200+', '~40/yr', 85, 'Port-scale · Energy-linked · Engineering', 'Port ops + marine + engineering', 5, ['Westports', 'Northport', 'MISC'], [8, 9, 14], 'Strategic LNG + bulk port operator in Sarawak.'),
  c(114, 'Northport Malaysia', '🚢', 'Maritime · Ports', '2,500+', '~50/yr', 83, 'Container-ops · High-throughput · Safety', 'Port ops + marine + logistics', 5, ['Westports', 'Bintulu Port', 'MISC'], [8, 9, 14], 'Major multipurpose port operator at Port Klang.'),

  // ─────────────── HUMAN RESOURCES / RECRUITMENT ───────────────
  c(115, 'Randstad Malaysia', '🧭', 'Human Resources · Recruitment', '200+', '~40/yr', 76, 'Client-facing · Targets · Fast', 'Recruiters + consultants + talent advisory', 2, ['Hays', 'Michael Page', 'In-house TA'], [8, 5], 'Global recruitment + HR services firm.'),
  c(116, 'JobStreet by SEEK', '💼', 'Human Resources · HR Tech', '400+', '~45/yr', 79, 'Product-led · Data · Talent-marketplace', 'Product + data + talent-solutions', 4, ['LinkedIn', 'Tech', 'HR consulting'], [8, 9], 'Malaysia\'s largest job + talent marketplace.'),

  // ─────────────── CUSTOMER SERVICE / BPO ───────────────
  c(117, 'Scicom (MSC)', '🎧', 'Customer Service · BPO', '3,000+', '~200/yr', 72, 'High-volume · Service-led · Shift-based', 'Agents + team leads + CX', 3, ['Teleperformance', 'Concentrix', 'In-house CX'], [8, 9], 'Homegrown business-process outsourcing + CX provider.'),
  c(118, 'Teleperformance Malaysia', '☎️', 'Customer Service · BPO', '5,000+', '~300/yr', 70, 'Global-BPO · Multilingual · Scale', 'Agents + support + operations', 3, ['Scicom', 'Concentrix', 'Tech support'], [8, 9], 'Global CX outsourcing hub with large Malaysian operations.'),

  // ─────────────── BEAUTY & WELLNESS · SKILLED TRADES · PUBLIC SAFETY ───────────────
  c(119, 'Bloom Beauty & Wellness Modelled', '💅', 'Beauty & Wellness · Salon Chain', '450', '~50/yr', 71, 'Service-led · Franchise · Customer-first', 'Stylists + therapists + salon managers', 1, ['Independent salons', 'Spa chains', 'Retail beauty'], [3, 8], 'Modelled salon + wellness chain across urban malls.'),
  c(120, 'BuildRight Trades Modelled', '🔧', 'Skilled Trades · Contracting', '600', '~70/yr', 73, 'Project-based · Hands-on · Safety-first', 'Electricians + welders + trade foremen', 2, ['Construction firms', 'M&E contractors', 'Facilities'], [8, 9], 'Modelled M&E + trades contractor serving construction + facilities.'),
  c(121, 'Certis / Secure Modelled', '🛡️', 'Public Safety & Defence · Security', '4,000+', '~150/yr', 72, 'Uniformed · Shift-based · Discipline', 'Security officers + supervisors + managers', 2, ['In-house security', 'Facilities', 'Enforcement'], [8, 16], 'Modelled integrated security + guarding services provider.'),
];
