/**
 * Occupation taxonomy — an economy-wide slice of MASCO (Malaysia Standard
 * Classification of Occupations, aligned to ISCO-08) cross-referenced with
 * ESCO + O*NET. Spans all major MASCO groups so trajectory generation and the
 * marketplace cover the whole formal Malaysian economy, not just white-collar
 * tech/finance.
 *
 * Salary anchors are p25–p75 monthly MYR ranges, calibrated to DOSM 2024
 * Salaries & Wages Survey headline bands, MEF/JobStreet recruiter guides, and
 * sector norms. Synthetic — no scraped or personal data.
 *
 * Talentbank replacement: swap this file with a real ESCO/O*NET/MASCO import.
 */

export type Seniority = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'exec';

export interface Occupation {
  role: string;
  esco_code?: string;
  masco_code?: string;
  sector: string;
  seniority: Seniority;
  is_mycol_critical?: boolean;
  typical_skills: string[];
  salary_anchor_myr: [number, number]; // p25, p75 range (DOSM/recruiter guide calibrated)
}

/** Compact constructor to keep the (large) table readable and shape-consistent. */
function o(
  role: string,
  sector: string,
  seniority: Seniority,
  typical_skills: string[],
  salary_anchor_myr: [number, number],
  opts: { esco?: string; masco?: string; mycol?: boolean } = {},
): Occupation {
  return {
    role,
    sector,
    seniority,
    typical_skills,
    salary_anchor_myr,
    esco_code: opts.esco,
    masco_code: opts.masco,
    is_mycol_critical: opts.mycol,
  };
}

export const OCCUPATIONS: Occupation[] = [
  // ─────────────────────────── TECH / DIGITAL ───────────────────────────
  o('Junior Data Analyst', 'Tech', 'entry', ['SQL', 'Excel', 'Python basics', 'Tableau'], [3200, 4800], { esco: '2511.2', masco: '2120' }),
  o('Data Analyst', 'Tech', 'junior', ['SQL', 'Python', 'Tableau', 'ETL'], [4500, 7000], { esco: '2511.2' }),
  o('BI Specialist', 'Tech', 'junior', ['Power BI', 'DAX', 'SQL', 'Data Warehousing'], [5000, 7500], { esco: '2511.3' }),
  o('Data Scientist', 'Tech', 'mid', ['Python', 'ML', 'Statistics', 'A/B Testing'], [7500, 12000], { esco: '2511.1', mycol: true }),
  o('Senior Data Scientist', 'Tech', 'senior', ['Deep Learning', 'MLOps', 'PyTorch', 'Statistical Modeling'], [12000, 18000], { esco: '2511.1', mycol: true }),
  o('ML Engineer', 'Tech', 'mid', ['PyTorch', 'Kubernetes', 'Model Serving', 'CI/CD'], [9500, 14000], { esco: '2512.4', mycol: true }),
  o('Analytics Engineer', 'Tech', 'mid', ['dbt', 'SQL', 'Python', 'Snowflake'], [10000, 15000], { mycol: true }),
  o('Data Engineer', 'Tech', 'mid', ['Spark', 'Airflow', 'Kafka', 'AWS'], [9000, 14000], { esco: '2512.5', mycol: true }),
  o('Analytics Manager', 'Tech', 'lead', ['People Management', 'Stakeholder Comms', 'Budget Planning'], [12000, 18000], { esco: '1330.1' }),
  o('Head of Data', 'Tech', 'exec', ['Executive Presence', 'Strategy', 'Board Reporting'], [18000, 28000]),
  o('Principal Data Scientist', 'Tech', 'exec', ['Research Publication', 'Architecture', 'Mentoring'], [22000, 32000], { mycol: true }),
  o('Junior Software Engineer', 'Tech', 'entry', ['JavaScript', 'Git', 'HTML/CSS', 'REST'], [3500, 5500], { esco: '2512.1' }),
  o('Software Engineer', 'Tech', 'junior', ['TypeScript', 'React', 'Node.js', 'AWS'], [5500, 9000], { esco: '2512.1', mycol: true }),
  o('Senior Software Engineer', 'Tech', 'senior', ['System Design', 'Distributed Systems', 'Leadership'], [11000, 18000], { esco: '2512.1', mycol: true }),
  o('Tech Lead', 'Tech', 'lead', ['Team Leadership', 'Architecture', 'Roadmap'], [14000, 22000]),
  o('Engineering Manager', 'Tech', 'lead', ['People Management', 'Delivery', 'Hiring'], [16000, 25000]),
  o('Director of Engineering', 'Tech', 'exec', ['Executive Comms', 'Org Design', 'Strategy'], [22000, 38000]),
  o('DevOps Engineer', 'Tech', 'mid', ['Terraform', 'Kubernetes', 'CI/CD', 'AWS'], [8000, 13000], { mycol: true }),
  o('Site Reliability Engineer', 'Tech', 'senior', ['Observability', 'Incident Response', 'Kubernetes', 'Go'], [12000, 19000], { mycol: true }),
  o('Cybersecurity Analyst', 'Tech', 'junior', ['SIEM', 'Threat Detection', 'Networking', 'Incident Response'], [5000, 8500], { mycol: true }),
  o('Security Engineer', 'Tech', 'senior', ['AppSec', 'Cloud Security', 'Pen Testing', 'IAM'], [12000, 20000], { mycol: true }),
  o('QA Engineer', 'Tech', 'junior', ['Test Automation', 'Selenium', 'API Testing', 'CI/CD'], [4500, 7500]),
  o('UI/UX Designer', 'Tech', 'junior', ['Figma', 'Design Systems', 'Wireframing', 'User Research'], [4500, 8000]),
  o('Senior Product Designer', 'Tech', 'senior', ['Design Systems', 'Prototyping', 'Design Leadership'], [10000, 16000]),
  o('Product Manager', 'Tech', 'mid', ['User Research', 'Roadmapping', 'Stakeholder Mgmt', 'Metrics'], [8000, 13000], { esco: '1213.1' }),
  o('Senior Product Manager', 'Tech', 'senior', ['Strategy', 'Cross-functional Leadership', 'Metrics'], [12000, 20000]),
  o('Head of Product', 'Tech', 'exec', ['Product Vision', 'Executive Presence', 'Team Building'], [20000, 32000]),

  // ─────────────────────────── FINANCE ───────────────────────────
  o('Accounts Executive', 'Finance', 'entry', ['Bookkeeping', 'Excel', 'SQL', 'AutoCount'], [2800, 4200], { masco: '4311' }),
  o('Accountant', 'Finance', 'junior', ['Financial Reporting', 'MFRS', 'Excel', 'Taxation'], [4500, 7000], { esco: '2411.2', masco: '2411' }),
  o('Senior Accountant', 'Finance', 'mid', ['Consolidation', 'Audit Liaison', 'MFRS', 'Team Lead'], [7000, 11000], { esco: '2411.2' }),
  o('Financial Analyst', 'Finance', 'junior', ['Excel', 'Financial Modeling', 'Bloomberg', 'SQL'], [4500, 7000], { esco: '2411.1' }),
  o('Investment Analyst', 'Finance', 'mid', ['Valuation', 'Modeling', 'Sector Research'], [7000, 11000], { esco: '2412.1' }),
  o('Auditor', 'Finance', 'junior', ['ISA', 'Risk Assessment', 'Sampling', 'Excel'], [4200, 6800], { esco: '2411.3' }),
  o('Risk Analyst', 'Finance', 'junior', ['Statistics', 'SAS', 'Regulatory Reporting'], [4800, 7500]),
  o('Actuarial Analyst', 'Finance', 'mid', ['Actuarial Modeling', 'R', 'IFRS 17', 'Probability'], [6500, 11000], { mycol: true }),
  o('Quantitative Analyst', 'Finance', 'senior', ['Python', 'Statistics', 'C++', 'Derivatives'], [12000, 22000], { mycol: true }),
  o('Tax Consultant', 'Finance', 'mid', ['Corporate Tax', 'Transfer Pricing', 'SST', 'Advisory'], [6000, 10000]),
  o('Finance Manager', 'Finance', 'lead', ['FP&A', 'Budgeting', 'People Management', 'Controls'], [11000, 17000], { esco: '1211.1' }),
  o('Financial Controller', 'Finance', 'lead', ['Consolidation', 'Compliance', 'Treasury', 'Governance'], [14000, 22000]),
  o('VP of Finance', 'Finance', 'exec', ['FP&A', 'Board Reporting', 'M&A'], [22000, 40000]),
  o('Chief Financial Officer', 'Finance', 'exec', ['Corporate Strategy', 'Investor Relations', 'M&A', 'Governance'], [35000, 65000]),
  o('Relationship Manager (Banking)', 'Finance', 'mid', ['Credit Analysis', 'Client Mgmt', 'Cross-sell', 'KYC'], [6000, 11000]),

  // ─────────────────────────── MARKETING / COMMS ───────────────────────────
  o('Digital Marketing Executive', 'Marketing', 'entry', ['Google Ads', 'Meta Ads', 'SEO', 'Copywriting'], [3200, 5000], { masco: '2431' }),
  o('Content Marketer', 'Marketing', 'junior', ['SEO', 'Content Strategy', 'Copywriting', 'Analytics'], [4000, 6500]),
  o('Social Media Manager', 'Marketing', 'junior', ['Community Mgmt', 'Content Calendar', 'Paid Social', 'Analytics'], [4200, 7000]),
  o('SEO Specialist', 'Marketing', 'mid', ['Technical SEO', 'Link Building', 'GA4', 'Keyword Research'], [5000, 9000]),
  o('Growth Marketer', 'Marketing', 'mid', ['Growth Loops', 'Analytics', 'Experimentation'], [6000, 10000]),
  o('Brand Manager', 'Marketing', 'senior', ['Brand Strategy', 'Campaign Mgmt', 'Market Research'], [9000, 15000], { esco: '1221.1' }),
  o('PR & Communications Lead', 'Marketing', 'senior', ['Media Relations', 'Crisis Comms', 'Copywriting'], [9000, 14000]),
  o('Marketing Manager', 'Marketing', 'lead', ['Team Leadership', 'Budgeting', 'Multi-channel Strategy'], [11000, 18000]),
  o('Head of Marketing', 'Marketing', 'exec', ['Brand', 'Strategy', 'Executive Comms'], [15000, 26000]),
  o('Chief Marketing Officer', 'Marketing', 'exec', ['Growth Strategy', 'Brand Portfolio', 'Board Reporting'], [24000, 45000]),

  // ─────────────────────────── ENERGY & UTILITIES ───────────────────────────
  o('Field Engineer (Oil & Gas)', 'Energy', 'entry', ['Field Operations', 'HSE', 'Equipment', 'Reporting'], [4000, 6500], { mycol: true }),
  o('Reservoir Engineer', 'Energy', 'mid', ['Petrel', 'Simulation', 'Geology'], [9000, 14000], { mycol: true }),
  o('Senior Reservoir Engineer', 'Energy', 'senior', ['Field Development', 'Modeling', 'Team Leadership'], [14000, 22000], { mycol: true }),
  o('Drilling Engineer', 'Energy', 'mid', ['Well Planning', 'Drilling Ops', 'Risk Assessment'], [10000, 16000], { mycol: true }),
  o('Process Engineer', 'Energy', 'junior', ['Process Simulation', 'HYSYS', 'P&ID', 'HSE'], [5000, 8500]),
  o('HSE Officer', 'Energy', 'junior', ['ISO 45001', 'Risk Assessment', 'Auditing', 'Compliance'], [4500, 7500]),
  o('Renewable Energy Engineer', 'Energy', 'mid', ['Solar PV', 'Grid Integration', 'Energy Modeling'], [7000, 12000], { mycol: true }),
  o('Energy Analyst', 'Energy', 'junior', ['Energy Markets', 'Excel', 'Forecasting', 'Policy'], [5000, 8000]),
  o('Plant Manager (Energy)', 'Energy', 'lead', ['Operations Mgmt', 'Maintenance', 'HSE Leadership', 'P&L'], [15000, 24000]),
  o('Head of Upstream', 'Energy', 'exec', ['Asset Strategy', 'Portfolio Mgmt', 'Executive Leadership'], [25000, 45000]),

  // ─────────────────────────── CONSULTING & STRATEGY ───────────────────────────
  o('Business Analyst', 'Consulting', 'junior', ['Excel', 'PowerPoint', 'Stakeholder Interviews'], [4500, 7000], { esco: '2421.1' }),
  o('Consultant', 'Consulting', 'mid', ['Structured Problem Solving', 'Client Mgmt', 'Presentations'], [8000, 13000]),
  o('Senior Consultant', 'Consulting', 'senior', ['Practice Development', 'Sales', 'Delivery'], [13000, 22000]),
  o('Engagement Manager', 'Consulting', 'lead', ['Project Leadership', 'Client Relationships', 'Team Mgmt'], [18000, 28000]),
  o('Consulting Partner', 'Consulting', 'exec', ['Business Development', 'P&L', 'Rainmaker'], [30000, 55000]),
  o('Management Trainee', 'Consulting', 'entry', ['Analysis', 'Communication', 'Adaptability'], [3500, 5500]),

  // ─────────────────────────── HEALTHCARE ───────────────────────────
  o('Staff Nurse', 'Healthcare', 'junior', ['Patient Care', 'Clinical Procedures', 'Documentation', 'BLS'], [3000, 4800], { esco: '2221', masco: '2221', mycol: true }),
  o('Senior Staff Nurse', 'Healthcare', 'mid', ['Ward Management', 'Mentoring', 'Critical Care', 'Triage'], [4500, 7000], { mycol: true }),
  o('Medical Officer', 'Healthcare', 'mid', ['Clinical Diagnosis', 'Patient Mgmt', 'Emergency Care'], [6000, 10000], { esco: '2211', masco: '2211', mycol: true }),
  o('Medical Specialist', 'Healthcare', 'senior', ['Specialist Practice', 'Surgery', 'Clinical Research'], [15000, 35000], { esco: '2212', mycol: true }),
  o('Pharmacist', 'Healthcare', 'junior', ['Dispensing', 'Clinical Pharmacy', 'Drug Safety', 'Counseling'], [4500, 7500], { esco: '2262', masco: '2262', mycol: true }),
  o('Physiotherapist', 'Healthcare', 'junior', ['Rehabilitation', 'Manual Therapy', 'Assessment'], [3500, 6000], { esco: '2264' }),
  o('Medical Lab Technologist', 'Healthcare', 'junior', ['Lab Testing', 'Sample Analysis', 'QC', 'Instrumentation'], [3200, 5500], { masco: '3212' }),
  o('Clinical Research Associate', 'Healthcare', 'mid', ['GCP', 'Trial Monitoring', 'Regulatory', 'Data'], [6000, 10000], { mycol: true }),
  o('Hospital Administrator', 'Healthcare', 'lead', ['Operations Mgmt', 'Compliance', 'Budgeting', 'Staffing'], [10000, 17000]),
  o('Chief Medical Officer', 'Healthcare', 'exec', ['Clinical Governance', 'Strategy', 'Quality & Safety'], [25000, 45000]),

  // ─────────────────────────── EDUCATION ───────────────────────────
  o('Primary School Teacher', 'Education', 'junior', ['Lesson Planning', 'Classroom Mgmt', 'Assessment', 'KSSR'], [3000, 5000], { esco: '2341', masco: '2341' }),
  o('Secondary School Teacher', 'Education', 'junior', ['Subject Expertise', 'Pedagogy', 'Assessment', 'KSSM'], [3200, 5500], { esco: '2330', masco: '2330' }),
  o('Head of Department (School)', 'Education', 'mid', ['Curriculum Leadership', 'Mentoring', 'Assessment Design'], [5000, 8000]),
  o('University Lecturer', 'Education', 'mid', ['Teaching', 'Research', 'Publication', 'Supervision'], [6000, 11000], { esco: '2310', masco: '2310' }),
  o('Senior Lecturer', 'Education', 'senior', ['Research Grants', 'PhD Supervision', 'Curriculum'], [9000, 15000]),
  o('Associate Professor', 'Education', 'lead', ['Research Leadership', 'Grant Writing', 'Academic Strategy'], [12000, 20000]),
  o('Instructional Designer', 'Education', 'mid', ['e-Learning', 'LMS', 'Curriculum Design', 'Storyboarding'], [5000, 9000]),
  o('Training & Development Executive', 'Education', 'junior', ['Facilitation', 'TNA', 'Content Development'], [3800, 6500]),
  o('School Principal', 'Education', 'exec', ['School Leadership', 'Governance', 'Community Relations'], [8000, 14000]),
  o('Dean of Faculty', 'Education', 'exec', ['Academic Strategy', 'Faculty Leadership', 'Accreditation'], [18000, 30000]),

  // ─────────────────────────── MANUFACTURING & ENGINEERING ───────────────────────────
  o('Production Operator', 'Manufacturing', 'entry', ['Machine Operation', 'Quality Checks', 'Safety', '5S'], [2000, 3200], { masco: '8100' }),
  o('Production Supervisor', 'Manufacturing', 'junior', ['Line Management', 'Scheduling', 'Lean', 'Safety'], [4000, 6500], { masco: '3122' }),
  o('Quality Engineer', 'Manufacturing', 'junior', ['SPC', 'Six Sigma', 'Root Cause Analysis', 'ISO 9001'], [4500, 7500]),
  o('Process/Industrial Engineer', 'Manufacturing', 'mid', ['Lean Manufacturing', 'Time Study', 'Automation', 'Kaizen'], [5500, 9500], { mycol: true }),
  o('Manufacturing Engineer', 'Manufacturing', 'mid', ['Process Design', 'Tooling', 'DFM', 'Automation'], [6000, 10000], { mycol: true }),
  o('Maintenance Engineer', 'Manufacturing', 'junior', ['Preventive Maintenance', 'PLC', 'Troubleshooting'], [4500, 8000]),
  o('R&D Engineer', 'Manufacturing', 'mid', ['Product Development', 'Prototyping', 'Testing', 'CAD'], [6000, 11000], { mycol: true }),
  o('Plant Manager', 'Manufacturing', 'lead', ['Operations Mgmt', 'P&L', 'Lean Leadership', 'Safety'], [14000, 22000], { esco: '1321' }),
  o('Operations Director', 'Manufacturing', 'exec', ['Manufacturing Strategy', 'Supply Chain', 'Executive Leadership'], [22000, 40000]),
  o('Automation Engineer', 'Manufacturing', 'mid', ['PLC', 'SCADA', 'Robotics', 'Industry 4.0'], [6500, 11000], { mycol: true }),

  // ─────────────────────────── CONSTRUCTION & PROPERTY ───────────────────────────
  o('Site Supervisor', 'Construction', 'junior', ['Site Coordination', 'Safety', 'Scheduling', 'Subcontractor Mgmt'], [3800, 6500]),
  o('Civil Engineer', 'Construction', 'junior', ['Structural Design', 'AutoCAD', 'Site Supervision', 'BQ'], [4500, 7500], { esco: '2142', masco: '2142' }),
  o('Structural Engineer', 'Construction', 'mid', ['Structural Analysis', 'ETABS', 'Reinforced Concrete', 'Codes'], [6500, 11000], { mycol: true }),
  o('Quantity Surveyor', 'Construction', 'junior', ['Cost Estimation', 'BQ', 'Contract Admin', 'Valuation'], [4200, 7000], { esco: '2149' }),
  o('Architect', 'Construction', 'mid', ['Design', 'Revit', 'BIM', 'Planning Approvals'], [5500, 11000], { esco: '2161', masco: '2161' }),
  o('Project Manager (Construction)', 'Construction', 'senior', ['Project Delivery', 'Cost Control', 'Stakeholder Mgmt', 'Scheduling'], [10000, 17000]),
  o('Property Executive', 'Construction', 'junior', ['Property Mgmt', 'Tenancy', 'Facilities', 'Client Relations'], [3500, 6000]),
  o('Property Development Manager', 'Construction', 'lead', ['Feasibility', 'Land Acquisition', 'P&L', 'Approvals'], [12000, 20000]),
  o('Construction Director', 'Construction', 'exec', ['Portfolio Delivery', 'P&L', 'Executive Leadership'], [22000, 38000]),
  o('BIM Coordinator', 'Construction', 'mid', ['Revit', 'Navisworks', 'Clash Detection', 'BIM Standards'], [5500, 9500]),

  // ─────────────────────────── HOSPITALITY & TOURISM ───────────────────────────
  o('Guest Service Associate', 'Hospitality', 'entry', ['Front Desk', 'Customer Service', 'PMS', 'Communication'], [2000, 3200], { masco: '4224' }),
  o('Food & Beverage Executive', 'Hospitality', 'junior', ['Service Standards', 'Inventory', 'Team Coordination'], [2800, 4500]),
  o('Commis Chef', 'Hospitality', 'entry', ['Food Preparation', 'Kitchen Hygiene', 'Knife Skills'], [2000, 3200], { masco: '5120' }),
  o('Chef de Partie', 'Hospitality', 'junior', ['Station Management', 'Menu Execution', 'Food Safety'], [3200, 5500]),
  o('Executive Chef', 'Hospitality', 'senior', ['Menu Development', 'Kitchen Leadership', 'Cost Control'], [8000, 15000]),
  o('Events Coordinator', 'Hospitality', 'junior', ['Event Planning', 'Vendor Mgmt', 'Budgeting', 'Logistics'], [3200, 5500]),
  o('Front Office Manager', 'Hospitality', 'mid', ['Guest Experience', 'Team Leadership', 'Revenue', 'PMS'], [5000, 8500]),
  o('Hotel General Manager', 'Hospitality', 'exec', ['Hotel Operations', 'P&L', 'Brand Standards', 'Leadership'], [15000, 28000], { esco: '1411' }),
  o('Tour Operations Executive', 'Hospitality', 'junior', ['Itinerary Planning', 'Bookings', 'Customer Service'], [3000, 5000]),
  o('Revenue Manager (Hotel)', 'Hospitality', 'mid', ['Yield Management', 'Forecasting', 'OTA', 'Pricing'], [6000, 11000]),

  // ─────────────────────────── LOGISTICS & SUPPLY CHAIN ───────────────────────────
  o('Warehouse Executive', 'Logistics', 'entry', ['Inventory', 'WMS', 'Stock Control', 'Dispatch'], [2500, 4000], { masco: '4321' }),
  o('Logistics Coordinator', 'Logistics', 'junior', ['Freight', 'Documentation', 'Scheduling', 'Vendor Mgmt'], [3500, 5800]),
  o('Supply Chain Analyst', 'Logistics', 'junior', ['Demand Planning', 'Excel', 'SAP', 'Forecasting'], [4500, 7500]),
  o('Procurement Executive', 'Logistics', 'junior', ['Sourcing', 'Negotiation', 'Vendor Mgmt', 'PO'], [4000, 6800]),
  o('Supply Chain Manager', 'Logistics', 'senior', ['S&OP', 'Network Optimization', 'People Mgmt', 'Cost'], [10000, 17000], { mycol: true }),
  o('Import/Export Executive', 'Logistics', 'junior', ['Customs', 'Incoterms', 'Documentation', 'Compliance'], [3500, 6000]),
  o('Fleet Manager', 'Logistics', 'mid', ['Fleet Operations', 'Route Optimization', 'Maintenance', 'Compliance'], [6000, 10000]),
  o('Warehouse Operations Manager', 'Logistics', 'lead', ['Warehouse Leadership', 'WMS', 'Lean', 'Safety'], [9000, 15000]),
  o('Head of Supply Chain', 'Logistics', 'exec', ['Supply Chain Strategy', 'P&L', 'Digital Transformation'], [18000, 32000]),
  o('Category Buyer', 'Logistics', 'mid', ['Category Strategy', 'Supplier Mgmt', 'Cost Analysis', 'Negotiation'], [6000, 10000]),

  // ─────────────────────────── PUBLIC SECTOR & GOVERNMENT ───────────────────────────
  o('Administrative Officer', 'Public Sector', 'junior', ['Public Administration', 'Correspondence', 'Records', 'Compliance'], [2800, 4800], { masco: '3343' }),
  o('Policy Analyst', 'Public Sector', 'mid', ['Policy Research', 'Data Analysis', 'Stakeholder Engagement', 'Writing'], [5000, 9000]),
  o('Enforcement Officer', 'Public Sector', 'junior', ['Regulatory Enforcement', 'Investigation', 'Reporting'], [3000, 5000]),
  o('Statistician (Government)', 'Public Sector', 'mid', ['Survey Design', 'R', 'Data Analysis', 'DOSM Methods'], [5500, 9500], { mycol: true }),
  o('Urban Planner', 'Public Sector', 'mid', ['Town Planning', 'GIS', 'Zoning', 'Development Control'], [5000, 9000], { esco: '2164' }),
  o('Diplomatic Officer', 'Public Sector', 'mid', ['International Relations', 'Negotiation', 'Protocol', 'Languages'], [5000, 9500]),
  o('Senior Assistant Director', 'Public Sector', 'senior', ['Program Management', 'Policy Implementation', 'Team Leadership'], [8000, 14000]),
  o('Director (Government Agency)', 'Public Sector', 'exec', ['Public Governance', 'Strategy', 'Stakeholder Leadership'], [14000, 24000]),

  // ─────────────────────────── LEGAL ───────────────────────────
  o('Legal Executive', 'Legal', 'entry', ['Legal Research', 'Documentation', 'Drafting', 'Case Management'], [3000, 5000]),
  o('Associate Lawyer', 'Legal', 'junior', ['Litigation', 'Legal Drafting', 'Client Advisory', 'Research'], [4500, 8000], { esco: '2611', masco: '2611' }),
  o('Corporate Counsel', 'Legal', 'senior', ['Contract Law', 'Corporate Governance', 'Compliance', 'M&A'], [12000, 22000], { mycol: true }),
  o('Compliance Officer', 'Legal', 'mid', ['Regulatory Compliance', 'AML/KYC', 'Risk', 'Audit'], [6000, 11000], { mycol: true }),
  o('Paralegal', 'Legal', 'junior', ['Legal Research', 'Case Preparation', 'Filing', 'Drafting'], [3200, 5500]),
  o('Senior Legal Counsel', 'Legal', 'lead', ['Legal Strategy', 'Negotiation', 'Board Advisory', 'Governance'], [16000, 28000]),
  o('Partner (Law Firm)', 'Legal', 'exec', ['Practice Leadership', 'Business Development', 'P&L'], [25000, 55000]),
  o('Company Secretary', 'Legal', 'mid', ['Corporate Secretarial', 'Companies Act', 'Board Support', 'Compliance'], [5500, 10000]),

  // ─────────────────────────── CREATIVE & MEDIA ───────────────────────────
  o('Junior Graphic Designer', 'Creative', 'entry', ['Photoshop', 'Illustrator', 'Layout', 'Branding'], [2800, 4500], { masco: '2166' }),
  o('Graphic Designer', 'Creative', 'junior', ['Adobe Suite', 'Branding', 'Motion Basics', 'Typography'], [3800, 6500], { esco: '2166' }),
  o('Content Writer', 'Creative', 'junior', ['Copywriting', 'SEO', 'Editing', 'Research'], [3200, 5500]),
  o('Video Editor', 'Creative', 'junior', ['Premiere Pro', 'After Effects', 'Colour Grading', 'Storytelling'], [3500, 6500]),
  o('Journalist', 'Creative', 'junior', ['Reporting', 'Interviewing', 'Writing', 'Fact-checking'], [3000, 5500], { esco: '2642', masco: '2642' }),
  o('Art Director', 'Creative', 'senior', ['Creative Direction', 'Campaign Concepts', 'Team Leadership'], [9000, 15000]),
  o('Producer (Media)', 'Creative', 'mid', ['Production Mgmt', 'Budgeting', 'Scheduling', 'Coordination'], [6000, 11000]),
  o('Creative Director', 'Creative', 'exec', ['Brand Vision', 'Creative Strategy', 'Team Building'], [16000, 30000]),
  o('UX Writer', 'Creative', 'mid', ['Microcopy', 'Content Design', 'UX', 'Voice & Tone'], [5500, 9500]),

  // ─────────────────────────── RETAIL & FMCG ───────────────────────────
  o('Retail Associate', 'Retail', 'entry', ['Customer Service', 'POS', 'Merchandising', 'Sales'], [1800, 3000], { masco: '5223' }),
  o('Store Supervisor', 'Retail', 'junior', ['Team Coordination', 'Inventory', 'Sales Targets', 'Visual Merch'], [3000, 5000]),
  o('Store Manager', 'Retail', 'mid', ['Store Operations', 'P&L', 'Team Leadership', 'Customer Experience'], [5000, 9000], { esco: '1420' }),
  o('Merchandiser', 'Retail', 'junior', ['Assortment Planning', 'OTB', 'Vendor Mgmt', 'Trend Analysis'], [3500, 6000]),
  o('Category Manager (FMCG)', 'Retail', 'senior', ['Category Strategy', 'Trade Marketing', 'P&L', 'Analytics'], [9000, 15000]),
  o('Key Account Manager', 'Retail', 'mid', ['Account Management', 'Negotiation', 'Sales Planning', 'Forecasting'], [6000, 11000]),
  o('E-commerce Executive', 'Retail', 'junior', ['Marketplace Ops', 'Product Listing', 'Campaigns', 'Analytics'], [3500, 6000]),
  o('E-commerce Manager', 'Retail', 'senior', ['Online Strategy', 'Marketplace', 'Performance Marketing', 'P&L'], [9000, 15000]),
  o('Regional Sales Manager', 'Retail', 'lead', ['Sales Leadership', 'Territory Mgmt', 'Distribution', 'Targets'], [11000, 18000]),
  o('Retail Operations Director', 'Retail', 'exec', ['Multi-store Strategy', 'P&L', 'Expansion', 'Leadership'], [18000, 32000]),

  // ─────────────────────────── AGRICULTURE & AGRITECH ───────────────────────────
  o('Agronomist', 'Agriculture', 'junior', ['Crop Science', 'Soil Analysis', 'Field Trials', 'Advisory'], [3500, 6000], { esco: '2132', masco: '2132' }),
  o('Plantation Executive', 'Agriculture', 'junior', ['Estate Management', 'Harvest Planning', 'Labour Coordination'], [3200, 5500]),
  o('Estate Manager', 'Agriculture', 'senior', ['Plantation Operations', 'Yield Optimization', 'P&L', 'Sustainability'], [8000, 14000]),
  o('Food Technologist', 'Agriculture', 'junior', ['Food Safety', 'HACCP', 'Product Development', 'QA'], [3800, 6500], { masco: '2131' }),
  o('Agritech Field Specialist', 'Agriculture', 'mid', ['Precision Agriculture', 'IoT Sensors', 'Drone Mapping', 'Data'], [5000, 9000], { mycol: true }),
  o('Aquaculture Technician', 'Agriculture', 'junior', ['Fish Farming', 'Water Quality', 'Feed Management'], [2800, 4800]),
  o('Sustainability Officer (Agri)', 'Agriculture', 'mid', ['MSPO/RSPO', 'ESG Reporting', 'Certification', 'Auditing'], [5000, 9000], { mycol: true }),
  o('Head of Plantation', 'Agriculture', 'exec', ['Agribusiness Strategy', 'Operations', 'P&L', 'Sustainability'], [16000, 28000]),

  // ═══════════════════ DEEPENED EXISTING SECTORS ═══════════════════

  // ─ Tech (added) ─
  o('IT Support Specialist', 'Tech', 'entry', ['Helpdesk', 'Troubleshooting', 'Windows', 'Networking Basics'], [3000, 4800]),
  o('Frontend Engineer', 'Tech', 'junior', ['React', 'TypeScript', 'CSS', 'Accessibility'], [5000, 8500], { mycol: true }),
  o('Network Engineer', 'Tech', 'junior', ['Cisco', 'Routing & Switching', 'Firewalls', 'TCP/IP'], [4800, 8000]),
  o('Mobile Engineer', 'Tech', 'mid', ['Swift', 'Kotlin', 'React Native', 'REST'], [7000, 12000], { mycol: true }),
  o('Full-stack Engineer', 'Tech', 'mid', ['React', 'Node.js', 'PostgreSQL', 'AWS'], [7500, 13000], { mycol: true }),
  o('Database Administrator', 'Tech', 'mid', ['PostgreSQL', 'Oracle', 'Backup & Recovery', 'Tuning'], [6500, 11000]),
  o('Systems Analyst', 'Tech', 'mid', ['Requirements', 'UML', 'SQL', 'Process Mapping'], [6000, 10000]),
  o('Scrum Master', 'Tech', 'mid', ['Agile', 'Scrum', 'Jira', 'Facilitation'], [7000, 12000]),
  o('AI Engineer', 'Tech', 'senior', ['LLMs', 'RAG', 'Python', 'Vector Databases'], [13000, 20000], { mycol: true }),
  o('Cloud Architect', 'Tech', 'senior', ['AWS', 'Azure', 'Terraform', 'Solution Design'], [15000, 23000], { mycol: true }),
  o('Solutions Architect', 'Tech', 'senior', ['System Design', 'Integration', 'Cloud', 'Stakeholder Mgmt'], [15000, 24000], { mycol: true }),
  o('Developer Advocate', 'Tech', 'mid', ['Public Speaking', 'Technical Writing', 'Community', 'Demos'], [8000, 14000]),
  o('Chief Technology Officer', 'Tech', 'exec', ['Tech Strategy', 'Org Design', 'Executive Leadership', 'Architecture'], [28000, 55000]),

  // ─ Finance (added) ─
  o('Payroll Executive', 'Finance', 'entry', ['Payroll', 'EPF/SOCSO', 'Excel', 'HR Systems'], [2800, 4500]),
  o('Credit Analyst', 'Finance', 'junior', ['Credit Assessment', 'Financial Modeling', 'Risk', 'Excel'], [4500, 7500]),
  o('Financial Planner', 'Finance', 'junior', ['Financial Planning', 'Unit Trust', 'Advisory', 'Client Mgmt'], [3800, 7000]),
  o('Cost Accountant', 'Finance', 'junior', ['Cost Accounting', 'Standard Costing', 'Variance Analysis', 'ERP'], [4500, 7500]),
  o('Treasury Analyst', 'Finance', 'mid', ['Cash Management', 'FX', 'Liquidity', 'Hedging'], [6000, 10000]),
  o('Internal Auditor', 'Finance', 'mid', ['Internal Controls', 'Risk-based Audit', 'COSO', 'Reporting'], [6000, 10000]),
  o('Trader', 'Finance', 'mid', ['Market Making', 'Execution', 'Risk', 'Derivatives'], [8000, 16000], { mycol: true }),
  o('Islamic Finance Specialist', 'Finance', 'mid', ['Shariah Compliance', 'Sukuk', 'Takaful', 'Islamic Banking'], [6000, 11000]),
  o('Wealth Manager', 'Finance', 'senior', ['Portfolio Advisory', 'HNW Clients', 'Estate Planning', 'Investments'], [10000, 20000]),
  o('Fund Manager', 'Finance', 'senior', ['Portfolio Management', 'Asset Allocation', 'Research', 'Risk'], [14000, 28000], { mycol: true }),

  // ─ Marketing (added) ─
  o('Marketing Analyst', 'Marketing', 'junior', ['GA4', 'Attribution', 'SQL', 'Dashboards'], [4200, 7000]),
  o('Copywriter', 'Marketing', 'junior', ['Copywriting', 'Brand Voice', 'Editing', 'Campaigns'], [3500, 6000]),
  o('Trade Marketing Executive', 'Marketing', 'junior', ['Trade Promotions', 'Category', 'POSM', 'Channel'], [4000, 6800]),
  o('Performance Marketing Specialist', 'Marketing', 'mid', ['Paid Media', 'ROAS', 'Google/Meta Ads', 'Attribution'], [6000, 10000]),
  o('CRM & Lifecycle Marketer', 'Marketing', 'mid', ['CRM', 'Email Automation', 'Segmentation', 'Retention'], [6000, 10000]),
  o('Marketing Automation Specialist', 'Marketing', 'mid', ['HubSpot', 'Marketo', 'Workflows', 'Lead Scoring'], [6500, 11000]),
  o('Product Marketing Manager', 'Marketing', 'senior', ['Positioning', 'GTM', 'Messaging', 'Launches'], [10000, 16000]),

  // ─ Energy (added) ─
  o('Instrumentation Engineer', 'Energy', 'junior', ['Instrumentation', 'Control Systems', 'Calibration', 'HSE'], [5000, 8500]),
  o('Geologist / Geophysicist', 'Energy', 'mid', ['Seismic Interpretation', 'Geology', 'Petrel', 'Mapping'], [8000, 14000], { mycol: true }),
  o('Petroleum Engineer', 'Energy', 'mid', ['Production Optimization', 'Well Testing', 'Reservoir', 'Nodal Analysis'], [9000, 15000], { mycol: true }),
  o('Pipeline Engineer', 'Energy', 'mid', ['Pipeline Design', 'Integrity Mgmt', 'Corrosion', 'Codes'], [8500, 14000]),
  o('Power Systems Engineer', 'Energy', 'mid', ['Grid Design', 'Load Flow', 'Protection', 'ETAP'], [7000, 12000], { mycol: true }),
  o('Commissioning Engineer', 'Energy', 'mid', ['Commissioning', 'Testing', 'Handover', 'HSE'], [8000, 13000]),
  o('Energy Trader', 'Energy', 'senior', ['Energy Markets', 'Trading', 'Risk', 'Forecasting'], [12000, 22000], { mycol: true }),

  // ─ Consulting (added) ─
  o('Associate Consultant', 'Consulting', 'entry', ['Analysis', 'Research', 'Excel', 'Communication'], [4000, 6000]),
  o('Technology Consultant', 'Consulting', 'mid', ['Digital Transformation', 'Architecture', 'Advisory', 'Delivery'], [8000, 14000], { mycol: true }),
  o('HR Consultant', 'Consulting', 'mid', ['Org Design', 'Talent Strategy', 'Change Mgmt', 'Advisory'], [7500, 13000]),
  o('Risk Consultant', 'Consulting', 'mid', ['Enterprise Risk', 'Controls', 'Compliance', 'Advisory'], [8000, 14000]),
  o('ESG / Sustainability Consultant', 'Consulting', 'senior', ['ESG Frameworks', 'Carbon Accounting', 'Reporting', 'Advisory'], [12000, 20000], { mycol: true }),
  o('Principal Consultant', 'Consulting', 'lead', ['Practice Leadership', 'Client Portfolio', 'Delivery', 'Sales'], [20000, 32000]),

  // ─ Healthcare (added) ─
  o('Paramedic', 'Healthcare', 'entry', ['Emergency Care', 'BLS/ACLS', 'Patient Transport', 'Triage'], [2800, 4500]),
  o('Radiographer', 'Healthcare', 'junior', ['Imaging', 'X-ray/CT', 'Radiation Safety', 'PACS'], [3500, 6000]),
  o('Occupational Therapist', 'Healthcare', 'junior', ['Rehabilitation', 'Assessment', 'Care Planning'], [3500, 6000]),
  o('Dietitian', 'Healthcare', 'junior', ['Clinical Nutrition', 'Diet Planning', 'Counseling'], [3500, 6000]),
  o('Optometrist', 'Healthcare', 'junior', ['Eye Examination', 'Refraction', 'Dispensing', 'Screening'], [4000, 6500]),
  o('General Practitioner', 'Healthcare', 'mid', ['Primary Care', 'Diagnosis', 'Chronic Disease Mgmt'], [7000, 12000], { mycol: true }),
  o('Dentist', 'Healthcare', 'mid', ['Dentistry', 'Oral Surgery', 'Patient Care', 'Diagnosis'], [7000, 13000], { mycol: true }),
  o('Clinical Psychologist', 'Healthcare', 'mid', ['Assessment', 'Therapy', 'Diagnosis', 'Counseling'], [6000, 11000]),
  o('Biomedical Engineer', 'Healthcare', 'mid', ['Medical Devices', 'Maintenance', 'Compliance', 'Calibration'], [5500, 9500], { mycol: true }),
  o('Public Health Officer', 'Healthcare', 'mid', ['Epidemiology', 'Health Promotion', 'Surveillance', 'Policy'], [5000, 9000]),
  o('Anaesthetist', 'Healthcare', 'senior', ['Anaesthesia', 'Critical Care', 'Perioperative', 'Patient Safety'], [16000, 32000], { mycol: true }),
  o('Surgeon', 'Healthcare', 'senior', ['Surgery', 'Perioperative Care', 'Clinical Judgement'], [18000, 40000], { mycol: true }),

  // ─ Education (added) ─
  o('Early Childhood Educator', 'Education', 'entry', ['Early Learning', 'Child Development', 'Classroom Care'], [2200, 3800]),
  o('Special Education Teacher', 'Education', 'junior', ['Special Needs', 'IEP', 'Inclusive Pedagogy', 'Assessment'], [3200, 5500]),
  o('TVET / Vocational Instructor', 'Education', 'junior', ['Vocational Training', 'Practical Assessment', 'Industry Skills'], [3500, 6000]),
  o('Librarian', 'Education', 'junior', ['Cataloguing', 'Information Literacy', 'Reference', 'Archives'], [3200, 5500]),
  o('Corporate Trainer', 'Education', 'mid', ['Facilitation', 'TNA', 'Instructional Delivery', 'Assessment'], [5000, 9000]),
  o('Academic Advisor', 'Education', 'mid', ['Student Advising', 'Curriculum Guidance', 'Counseling'], [4500, 8000]),
  o('EdTech Specialist', 'Education', 'mid', ['LMS', 'Learning Analytics', 'e-Learning', 'Digital Pedagogy'], [5500, 9500]),
  o('Research Fellow', 'Education', 'senior', ['Research', 'Grant Writing', 'Publication', 'Analysis'], [7000, 12000]),
  o('Professor', 'Education', 'exec', ['Research Leadership', 'Academic Strategy', 'PhD Supervision', 'Grants'], [15000, 26000]),

  // ─ Manufacturing (added) ─
  o('Mechanical Engineer', 'Manufacturing', 'junior', ['CAD', 'GD&T', 'Mechanical Design', 'FEA'], [4500, 8000]),
  o('Electrical Engineer', 'Manufacturing', 'junior', ['Circuit Design', 'PLC', 'Power', 'Schematics'], [4500, 8000]),
  o('Test Engineer', 'Manufacturing', 'junior', ['Test Development', 'ATE', 'Debug', 'Yield'], [5000, 8500]),
  o('Production Planner', 'Manufacturing', 'junior', ['MRP', 'Scheduling', 'Capacity Planning', 'ERP'], [4500, 7500]),
  o('Chemical Engineer', 'Manufacturing', 'mid', ['Process Design', 'Unit Operations', 'Safety', 'Optimization'], [6000, 10000], { mycol: true }),
  o('Materials Engineer', 'Manufacturing', 'mid', ['Materials Science', 'Failure Analysis', 'Metallurgy', 'Testing'], [6000, 10000]),
  o('EHS Manager', 'Manufacturing', 'mid', ['ISO 45001', 'Safety Leadership', 'Compliance', 'Auditing'], [7000, 12000]),
  o('Quality Manager', 'Manufacturing', 'lead', ['QMS', 'ISO 9001', 'Continuous Improvement', 'Team Leadership'], [10000, 16000]),

  // ─ Construction (added) ─
  o('Estimator', 'Construction', 'junior', ['Cost Estimation', 'Tendering', 'Take-off', 'Pricing'], [4000, 6800]),
  o('Land Surveyor', 'Construction', 'junior', ['Surveying', 'GPS/GNSS', 'Total Station', 'Mapping'], [4000, 7000]),
  o('Interior Designer', 'Construction', 'junior', ['Space Planning', 'SketchUp', '3D Rendering', 'FF&E'], [3800, 7000]),
  o('Real Estate Negotiator', 'Construction', 'junior', ['Sales', 'Client Relations', 'Market Knowledge', 'Negotiation'], [3000, 8000]),
  o('M&E Engineer', 'Construction', 'mid', ['Mechanical & Electrical', 'HVAC', 'Building Services', 'Codes'], [6000, 10000]),
  o('Property Valuer', 'Construction', 'mid', ['Valuation', 'Market Analysis', 'Reporting', 'Compliance'], [5000, 9000]),
  o('Building Inspector', 'Construction', 'mid', ['Building Codes', 'Inspection', 'Compliance', 'Reporting'], [5000, 8500]),
  o('Facilities Manager', 'Construction', 'mid', ['Facilities Ops', 'Maintenance', 'Vendor Mgmt', 'Safety'], [6000, 11000]),
  o('Contracts Manager', 'Construction', 'senior', ['Contract Admin', 'Claims', 'Procurement', 'Negotiation'], [10000, 16000]),

  // ─ Hospitality (added) ─
  o('Bartender', 'Hospitality', 'entry', ['Mixology', 'Customer Service', 'POS', 'Inventory'], [2000, 3500]),
  o('Housekeeping Supervisor', 'Hospitality', 'junior', ['Housekeeping', 'Team Coordination', 'Quality', 'Inventory'], [2800, 4800]),
  o('Travel Consultant', 'Hospitality', 'junior', ['Bookings', 'Itineraries', 'GDS', 'Customer Service'], [3000, 5200]),
  o('Restaurant Manager', 'Hospitality', 'mid', ['F&B Operations', 'Team Leadership', 'Cost Control', 'Service'], [5000, 8500]),
  o('Banquet & Events Manager', 'Hospitality', 'mid', ['Event Operations', 'Banqueting', 'Vendor Mgmt', 'Budgeting'], [5000, 9000]),
  o('Spa Manager', 'Hospitality', 'mid', ['Spa Operations', 'Team Leadership', 'Wellness Programs', 'Revenue'], [5000, 9000]),
  o('MICE Manager', 'Hospitality', 'senior', ['MICE', 'Sales', 'Event Production', 'Client Mgmt'], [8000, 14000]),

  // ─ Logistics (added) ─
  o('Customs Broker', 'Logistics', 'junior', ['Customs Clearance', 'HS Codes', 'Compliance', 'Documentation'], [3800, 6500]),
  o('Freight Forwarder', 'Logistics', 'junior', ['Freight', 'Incoterms', 'Carrier Mgmt', 'Documentation'], [3800, 6500]),
  o('Demand Planner', 'Logistics', 'mid', ['Demand Forecasting', 'S&OP', 'Statistical Models', 'ERP'], [6000, 10000]),
  o('Cold-Chain Specialist', 'Logistics', 'mid', ['Cold Chain', 'Temperature Control', 'Compliance', 'Quality'], [5500, 9500]),
  o('Transport Manager', 'Logistics', 'mid', ['Transport Ops', 'Route Planning', 'Compliance', 'Cost'], [6000, 10500]),
  o('Distribution Manager', 'Logistics', 'senior', ['Distribution Strategy', 'Network', 'Team Leadership', 'Cost'], [9000, 15000]),
  o('S&OP Manager', 'Logistics', 'lead', ['S&OP Leadership', 'Planning', 'Cross-functional', 'Analytics'], [12000, 19000]),

  // ─ Public Sector (added) ─
  o('Immigration Officer', 'Public Sector', 'junior', ['Border Control', 'Documentation', 'Enforcement', 'Compliance'], [2800, 4800]),
  o('Customs Officer', 'Public Sector', 'junior', ['Customs Enforcement', 'Inspection', 'Duties Assessment', 'Compliance'], [2800, 4800]),
  o('Tax Officer (LHDN)', 'Public Sector', 'junior', ['Tax Assessment', 'Audit', 'Compliance', 'Investigation'], [3200, 5500]),
  o('Social Welfare Officer', 'Public Sector', 'junior', ['Case Management', 'Community Support', 'Assessment', 'Referral'], [3000, 5200]),
  o('Public Health Inspector', 'Public Sector', 'mid', ['Health Inspection', 'Food Safety', 'Enforcement', 'Sanitation'], [4000, 7000]),
  o('Labour Officer', 'Public Sector', 'mid', ['Employment Law', 'Dispute Resolution', 'Inspection', 'Compliance'], [4500, 8000]),
  o('Foreign Service Officer', 'Public Sector', 'mid', ['Diplomacy', 'International Relations', 'Consular', 'Protocol'], [5000, 9500]),

  // ─ Legal (added) ─
  o('Legal Secretary', 'Legal', 'entry', ['Legal Admin', 'Filing', 'Diary Mgmt', 'Documentation'], [2800, 4500]),
  o('Conveyancing Lawyer', 'Legal', 'junior', ['Property Law', 'Conveyancing', 'SPA', 'Due Diligence'], [4500, 8000]),
  o('Litigation Lawyer', 'Legal', 'mid', ['Litigation', 'Advocacy', 'Drafting', 'Case Strategy'], [6000, 12000]),
  o('Syariah Lawyer', 'Legal', 'mid', ['Syariah Law', 'Family Law', 'Advocacy', 'Drafting'], [5000, 9500]),
  o('Legal Operations Manager', 'Legal', 'mid', ['Legal Ops', 'Matter Mgmt', 'Vendor Mgmt', 'Process'], [8000, 14000]),
  o('IP Lawyer', 'Legal', 'senior', ['Intellectual Property', 'Patents', 'Trademarks', 'Licensing'], [12000, 22000], { mycol: true }),

  // ─ Creative (added) ─
  o('Content Creator', 'Creative', 'entry', ['Short-form Video', 'Social Media', 'Editing', 'Storytelling'], [2500, 4800]),
  o('3D Artist', 'Creative', 'junior', ['Blender', 'Maya', 'Texturing', 'Modelling'], [3500, 6500]),
  o('Animator', 'Creative', 'junior', ['Animation', 'After Effects', 'Rigging', 'Motion'], [3500, 6500]),
  o('Photographer', 'Creative', 'junior', ['Photography', 'Lightroom', 'Composition', 'Retouching'], [3000, 6000]),
  o('Sound Engineer', 'Creative', 'junior', ['Audio Mixing', 'Mastering', 'Pro Tools', 'Recording'], [3500, 6500]),
  o('Motion Designer', 'Creative', 'mid', ['Motion Graphics', 'After Effects', 'Cinema 4D', 'Branding'], [5500, 9500]),
  o('Game Designer', 'Creative', 'mid', ['Game Design', 'Level Design', 'Unity', 'Prototyping'], [5500, 10000]),
  o('Scriptwriter', 'Creative', 'mid', ['Scriptwriting', 'Storyboarding', 'Narrative', 'Editing'], [4500, 8500]),
  o('Fashion Designer', 'Creative', 'mid', ['Fashion Design', 'Pattern Making', 'Textiles', 'Trend Forecasting'], [4000, 8000]),

  // ─ Retail (added) ─
  o('Retail Analyst', 'Retail', 'junior', ['Sales Analytics', 'Excel', 'Inventory Analysis', 'Reporting'], [4000, 6800]),
  o('Visual Merchandiser', 'Retail', 'junior', ['Visual Merchandising', 'Store Layout', 'Displays', 'Branding'], [3200, 5500]),
  o('Loss Prevention Officer', 'Retail', 'junior', ['Loss Prevention', 'Surveillance', 'Investigation', 'Compliance'], [3000, 5200]),
  o('Buyer', 'Retail', 'mid', ['Buying', 'Assortment', 'Vendor Negotiation', 'OTB'], [5500, 9500]),
  o('Customer Experience Manager', 'Retail', 'mid', ['CX Strategy', 'Journey Mapping', 'Service Design', 'Analytics'], [6500, 11000]),
  o('Area Manager', 'Retail', 'senior', ['Multi-store Ops', 'Team Leadership', 'P&L', 'Targets'], [9000, 15000]),

  // ─ Agriculture (added) ─
  o('Horticulturist', 'Agriculture', 'junior', ['Horticulture', 'Plant Care', 'Nursery', 'Pest Management'], [3000, 5200]),
  o('Fisheries Officer', 'Agriculture', 'junior', ['Fisheries Mgmt', 'Aquaculture', 'Compliance', 'Field Work'], [3200, 5500]),
  o('Farm Manager', 'Agriculture', 'mid', ['Farm Operations', 'Crop Planning', 'Labour Mgmt', 'Budgeting'], [4500, 8500]),
  o('Livestock Manager', 'Agriculture', 'mid', ['Animal Husbandry', 'Herd Health', 'Feed Mgmt', 'Operations'], [4500, 8000]),
  o('Soil Scientist', 'Agriculture', 'mid', ['Soil Science', 'Nutrient Mgmt', 'Field Trials', 'Analysis'], [5000, 9000]),
  o('Agricultural Economist', 'Agriculture', 'mid', ['Agri Economics', 'Market Analysis', 'Policy', 'Data'], [5500, 9500]),
  o('Mill Manager', 'Agriculture', 'senior', ['Mill Operations', 'Processing', 'Quality', 'P&L'], [8000, 14000]),

  // ═══════════════════ NEW SECTORS ═══════════════════

  // ─ Human Resources ─
  o('HR Assistant', 'Human Resources', 'entry', ['HR Admin', 'Filing', 'Onboarding Support', 'HRIS'], [2800, 4500], { masco: '4416' }),
  o('HR Executive', 'Human Resources', 'junior', ['Recruitment', 'Employee Relations', 'Payroll', 'HR Policy'], [3800, 6500], { masco: '2423' }),
  o('Talent Acquisition Specialist', 'Human Resources', 'junior', ['Sourcing', 'Interviewing', 'ATS', 'Employer Branding'], [4200, 7500]),
  o('HR Business Partner', 'Human Resources', 'mid', ['Org Development', 'Stakeholder Mgmt', 'Employee Relations', 'Advisory'], [7000, 12000]),
  o('Learning & Development Specialist', 'Human Resources', 'mid', ['Training Design', 'TNA', 'Facilitation', 'LMS'], [6000, 10000]),
  o('Compensation & Benefits Analyst', 'Human Resources', 'mid', ['Comp & Ben', 'Job Evaluation', 'Benchmarking', 'Analytics'], [6000, 10500]),
  o('Industrial Relations Specialist', 'Human Resources', 'mid', ['Employment Law', 'Union Relations', 'Dispute Resolution', 'Compliance'], [6500, 11000]),
  o('HR Manager', 'Human Resources', 'lead', ['People Strategy', 'Team Leadership', 'HR Operations', 'Culture'], [10000, 17000], { esco: '1212' }),
  o('Head of Talent Acquisition', 'Human Resources', 'lead', ['Recruitment Strategy', 'Team Leadership', 'Workforce Planning'], [12000, 20000]),
  o('Chief Human Resources Officer', 'Human Resources', 'exec', ['People Strategy', 'Org Design', 'Executive Leadership', 'Culture'], [22000, 42000]),

  // ─ Sales ─
  o('Sales Executive', 'Sales', 'entry', ['Prospecting', 'CRM', 'Presentations', 'Closing'], [3000, 5500], { masco: '3322' }),
  o('Inside Sales Representative', 'Sales', 'junior', ['Lead Qualification', 'CRM', 'Cold Outreach', 'Pipeline'], [3800, 6500]),
  o('Account Executive', 'Sales', 'junior', ['Account Management', 'Upsell', 'Negotiation', 'CRM'], [4500, 8000]),
  o('Sales Engineer', 'Sales', 'mid', ['Technical Sales', 'Solution Demos', 'Pre-sales', 'Proposals'], [7000, 12000], { mycol: true }),
  o('Business Development Manager', 'Sales', 'senior', ['Business Development', 'Partnerships', 'Deal Origination', 'Strategy'], [9000, 16000]),
  o('Sales Manager', 'Sales', 'lead', ['Sales Leadership', 'Forecasting', 'Team Coaching', 'Targets'], [11000, 18000]),
  o('Regional Sales Director', 'Sales', 'exec', ['Regional Strategy', 'P&L', 'Team Leadership', 'Key Accounts'], [18000, 32000]),
  o('VP of Sales', 'Sales', 'exec', ['Revenue Strategy', 'GTM', 'Executive Leadership', 'Scaling'], [22000, 40000]),

  // ─ Customer Service ─
  o('Contact Centre Agent', 'Customer Service', 'entry', ['Call Handling', 'CRM', 'Problem Solving', 'Empathy'], [2200, 3600], { masco: '4222' }),
  o('Customer Service Executive', 'Customer Service', 'junior', ['Customer Support', 'Ticketing', 'Complaint Handling', 'CRM'], [3000, 5000]),
  o('Technical Support Specialist', 'Customer Service', 'junior', ['Troubleshooting', 'Product Knowledge', 'Ticketing', 'Escalation'], [3500, 6000]),
  o('Customer Experience Specialist', 'Customer Service', 'mid', ['CX', 'Journey Mapping', 'Feedback Analysis', 'Process'], [5000, 8500]),
  o('Contact Centre Team Leader', 'Customer Service', 'mid', ['Team Leadership', 'QA', 'Coaching', 'SLA Management'], [5000, 8500]),
  o('Customer Success Manager', 'Customer Service', 'senior', ['Account Retention', 'Onboarding', 'Upsell', 'Relationship Mgmt'], [8000, 14000]),
  o('BPO Operations Manager', 'Customer Service', 'lead', ['Operations Mgmt', 'Workforce Planning', 'SLA', 'P&L'], [10000, 17000]),
  o('Head of Customer Experience', 'Customer Service', 'exec', ['CX Strategy', 'Executive Leadership', 'NPS', 'Transformation'], [16000, 28000]),

  // ─ Administration ─
  o('Administrative Assistant', 'Administration', 'entry', ['Office Admin', 'Scheduling', 'Correspondence', 'MS Office'], [2200, 3600], { masco: '4110' }),
  o('Data Entry Clerk', 'Administration', 'entry', ['Data Entry', 'Accuracy', 'Excel', 'Records'], [1800, 3000], { masco: '4132' }),
  o('Receptionist', 'Administration', 'entry', ['Front Desk', 'Call Handling', 'Scheduling', 'Hospitality'], [2000, 3200], { masco: '4226' }),
  o('Personal Assistant', 'Administration', 'junior', ['Diary Mgmt', 'Travel Coordination', 'Confidentiality', 'Communication'], [3200, 5500]),
  o('Executive Secretary', 'Administration', 'junior', ['Executive Support', 'Minutes', 'Coordination', 'Documentation'], [3500, 6000], { masco: '3341' }),
  o('Operations Administrator', 'Administration', 'junior', ['Process Admin', 'Coordination', 'Reporting', 'Systems'], [3200, 5500]),
  o('Office Manager', 'Administration', 'mid', ['Office Operations', 'Vendor Mgmt', 'Budgeting', 'Team Coordination'], [5000, 8500]),
  o('Administrative Manager', 'Administration', 'lead', ['Admin Leadership', 'Process Improvement', 'Facilities', 'Team Mgmt'], [7000, 12000]),

  // ─ Telecommunications ─
  o('Telecom Technician', 'Telecommunications', 'entry', ['Cabling', 'Installation', 'Troubleshooting', 'Field Work'], [2500, 4200], { masco: '7422' }),
  o('Network Engineer (Telecom)', 'Telecommunications', 'junior', ['IP Networking', 'Routing', 'Transmission', 'Monitoring'], [4500, 8000]),
  o('Network Operations Engineer', 'Telecommunications', 'mid', ['NOC', 'Incident Mgmt', 'Monitoring', 'Escalation'], [6000, 10000]),
  o('RF Engineer', 'Telecommunications', 'mid', ['RF Planning', 'Optimization', 'Drive Testing', 'Coverage'], [6500, 11000], { mycol: true }),
  o('5G / Core Network Engineer', 'Telecommunications', 'senior', ['5G', 'Core Network', 'SDN/NFV', 'Architecture'], [12000, 20000], { mycol: true }),
  o('Telecom Project Manager', 'Telecommunications', 'senior', ['Rollout Mgmt', 'Vendor Mgmt', 'Scheduling', 'Delivery'], [10000, 17000]),
  o('Head of Network', 'Telecommunications', 'exec', ['Network Strategy', 'Executive Leadership', 'Capex', 'Architecture'], [20000, 36000]),

  // ─ Aviation ─
  o('Ground Operations Officer', 'Aviation', 'entry', ['Ground Handling', 'Ramp Ops', 'Safety', 'Coordination'], [2500, 4200]),
  o('Cabin Crew', 'Aviation', 'entry', ['In-flight Service', 'Safety Procedures', 'First Aid', 'Customer Service'], [3000, 5500], { masco: '5111' }),
  o('Avionics Technician', 'Aviation', 'junior', ['Avionics', 'Electrical Systems', 'Diagnostics', 'Compliance'], [4000, 7500]),
  o('Aircraft Maintenance Engineer', 'Aviation', 'junior', ['Aircraft Maintenance', 'MRO', 'Airworthiness', 'Safety'], [5000, 9500], { mycol: true }),
  o('Air Traffic Controller', 'Aviation', 'mid', ['Air Traffic Control', 'Radar', 'Coordination', 'Safety'], [7000, 13000], { mycol: true }),
  o('First Officer (Pilot)', 'Aviation', 'mid', ['Flight Operations', 'Navigation', 'Crew Coordination', 'Safety'], [10000, 18000], { mycol: true }),
  o('Captain (Pilot)', 'Aviation', 'senior', ['Command', 'Flight Operations', 'Decision-making', 'Safety Leadership'], [22000, 40000], { mycol: true }),
  o('Flight Operations Manager', 'Aviation', 'lead', ['Ops Leadership', 'Crew Scheduling', 'Compliance', 'Safety'], [14000, 24000]),

  // ─ Automotive ─
  o('Automotive Technician', 'Automotive', 'entry', ['Vehicle Repair', 'Diagnostics', 'Servicing', 'Tools'], [2200, 4000], { masco: '7231' }),
  o('Service Advisor', 'Automotive', 'junior', ['Customer Service', 'Service Estimation', 'Scheduling', 'Upsell'], [3000, 5500]),
  o('Spare Parts Executive', 'Automotive', 'junior', ['Parts Inventory', 'Cataloguing', 'Ordering', 'Customer Service'], [2800, 5000]),
  o('Automotive Engineer', 'Automotive', 'mid', ['Vehicle Systems', 'Testing', 'CAD', 'Quality'], [5500, 9500]),
  o('Workshop Supervisor', 'Automotive', 'mid', ['Workshop Ops', 'Team Coordination', 'Quality', 'Scheduling'], [4500, 7500]),
  o('EV Systems Engineer', 'Automotive', 'senior', ['EV Powertrain', 'Battery Systems', 'Charging', 'Diagnostics'], [9000, 16000], { mycol: true }),
  o('After-Sales Manager', 'Automotive', 'lead', ['After-Sales', 'Service Ops', 'P&L', 'Customer Retention'], [9000, 15000]),

  // ─ Insurance ─
  o('Insurance Agent', 'Insurance', 'entry', ['Sales', 'Product Knowledge', 'Client Advisory', 'Prospecting'], [2500, 6000]),
  o('Claims Executive', 'Insurance', 'junior', ['Claims Processing', 'Assessment', 'Documentation', 'Customer Service'], [3200, 5500]),
  o('Bancassurance Specialist', 'Insurance', 'junior', ['Bancassurance', 'Cross-sell', 'Advisory', 'Compliance'], [4000, 7000]),
  o('Underwriter', 'Insurance', 'mid', ['Risk Assessment', 'Underwriting', 'Pricing', 'Policy'], [5500, 9500]),
  o('Loss Adjuster', 'Insurance', 'mid', ['Claims Investigation', 'Loss Assessment', 'Negotiation', 'Reporting'], [5500, 9500]),
  o('Takaful Specialist', 'Insurance', 'mid', ['Takaful', 'Shariah Compliance', 'Advisory', 'Product'], [5000, 9000]),
  o('Actuary', 'Insurance', 'senior', ['Actuarial Modeling', 'Pricing', 'Reserving', 'IFRS 17'], [12000, 24000], { mycol: true }),
  o('Agency Manager', 'Insurance', 'lead', ['Agency Leadership', 'Recruitment', 'Sales Coaching', 'Targets'], [10000, 18000]),
  o('Chief Actuary', 'Insurance', 'exec', ['Actuarial Leadership', 'Risk Strategy', 'Governance', 'Reserving'], [25000, 45000], { mycol: true }),

  // ─ Pharma / Life Sciences ─
  o('Medical Representative', 'Pharma', 'junior', ['Detailing', 'Product Knowledge', 'Relationship Mgmt', 'Sales'], [4000, 7500]),
  o('Quality Control Analyst (Pharma)', 'Pharma', 'junior', ['GMP', 'Lab Testing', 'HPLC', 'Documentation'], [4000, 7000]),
  o('Regulatory Affairs Executive', 'Pharma', 'mid', ['Regulatory Submissions', 'NPRA', 'Compliance', 'Dossiers'], [6000, 10500], { mycol: true }),
  o('Pharmacovigilance Officer', 'Pharma', 'mid', ['Drug Safety', 'Adverse Events', 'Reporting', 'Compliance'], [6000, 10000]),
  o('Formulation Scientist', 'Pharma', 'mid', ['Formulation', 'R&D', 'Stability Studies', 'Analytical'], [6500, 11000], { mycol: true }),
  o('Product Manager (Pharma)', 'Pharma', 'senior', ['Brand Strategy', 'Market Access', 'Launches', 'KOL Engagement'], [10000, 17000]),
  o('R&D Director (Pharma)', 'Pharma', 'exec', ['R&D Leadership', 'Pipeline Strategy', 'Regulatory', 'Innovation'], [20000, 38000], { mycol: true }),

  // ─ Environmental & ESG ─
  o('Sustainability Executive', 'Environmental', 'junior', ['ESG Reporting', 'Data Collection', 'Stakeholder Engagement'], [4000, 7000]),
  o('Environmental Officer', 'Environmental', 'junior', ['EIA', 'Compliance', 'Monitoring', 'Reporting'], [4000, 7000]),
  o('ESG Analyst', 'Environmental', 'mid', ['ESG Frameworks', 'GRI/SASB', 'Data Analysis', 'Reporting'], [6000, 10500], { mycol: true }),
  o('Environmental Consultant', 'Environmental', 'mid', ['Environmental Assessment', 'Advisory', 'Compliance', 'Remediation'], [6000, 11000]),
  o('EHS Specialist', 'Environmental', 'mid', ['Environment/Health/Safety', 'Auditing', 'ISO 14001', 'Compliance'], [5500, 9500]),
  o('Carbon / Climate Specialist', 'Environmental', 'senior', ['Carbon Accounting', 'Net Zero', 'Climate Risk', 'Scope 1-3'], [10000, 18000], { mycol: true }),
  o('Head of Sustainability', 'Environmental', 'exec', ['ESG Strategy', 'Executive Leadership', 'Reporting', 'Governance'], [16000, 30000], { mycol: true }),

  // ─ Non-profit / Social Impact ─
  o('Program Coordinator (NGO)', 'Non-profit', 'entry', ['Program Support', 'Coordination', 'Community', 'Reporting'], [2800, 4500]),
  o('Community Development Officer', 'Non-profit', 'junior', ['Community Engagement', 'Fieldwork', 'Program Delivery', 'Reporting'], [3200, 5500]),
  o('Grants & Fundraising Officer', 'Non-profit', 'junior', ['Grant Writing', 'Fundraising', 'Donor Relations', 'Reporting'], [3500, 6000]),
  o('Program Manager (NGO)', 'Non-profit', 'mid', ['Program Management', 'M&E', 'Budgeting', 'Stakeholders'], [5500, 9500]),
  o('Advocacy Manager', 'Non-profit', 'mid', ['Advocacy', 'Policy', 'Campaigns', 'Stakeholder Engagement'], [6000, 10000]),
  o('Executive Director (NGO)', 'Non-profit', 'exec', ['Organisational Leadership', 'Fundraising', 'Governance', 'Strategy'], [10000, 20000]),

  // ─ Sports & Fitness ─
  o('Fitness Instructor', 'Sports & Fitness', 'entry', ['Group Fitness', 'Coaching', 'Client Motivation', 'Safety'], [2200, 4000]),
  o('Personal Trainer', 'Sports & Fitness', 'junior', ['Program Design', 'Coaching', 'Nutrition Basics', 'Client Mgmt'], [3000, 6000]),
  o('Sports Coach', 'Sports & Fitness', 'junior', ['Coaching', 'Training Plans', 'Athlete Development', 'Tactics'], [3000, 6500]),
  o('Physiotherapist (Sports)', 'Sports & Fitness', 'mid', ['Sports Rehab', 'Injury Prevention', 'Assessment', 'Recovery'], [4500, 8500]),
  o('Sports Scientist', 'Sports & Fitness', 'mid', ['Performance Analysis', 'Biomechanics', 'Data', 'Conditioning'], [5000, 9000]),
  o('Athlete Development Manager', 'Sports & Fitness', 'senior', ['Talent Development', 'Program Leadership', 'Performance', 'Coaching'], [7000, 13000]),
  o('Sports Facility Manager', 'Sports & Fitness', 'lead', ['Facility Ops', 'Team Leadership', 'Programming', 'P&L'], [7000, 12000]),

  // ─ Maritime ─
  o('Deck Cadet', 'Maritime', 'entry', ['Seamanship', 'Navigation Basics', 'Safety', 'Watchkeeping'], [2500, 4500]),
  o('Port Operations Executive', 'Maritime', 'junior', ['Port Ops', 'Vessel Coordination', 'Documentation', 'Safety'], [3500, 6000]),
  o('Marine Engineer', 'Maritime', 'junior', ['Marine Engineering', 'Machinery', 'Maintenance', 'Safety'], [5000, 9500], { mycol: true }),
  o('Navigation Officer', 'Maritime', 'mid', ['Navigation', 'Watchkeeping', 'Cargo Ops', 'Safety'], [7000, 13000], { mycol: true }),
  o('Ship Captain', 'Maritime', 'senior', ['Command', 'Navigation', 'Crew Leadership', 'Safety'], [18000, 34000], { mycol: true }),
  o('Marine Superintendent', 'Maritime', 'lead', ['Fleet Oversight', 'Technical Mgmt', 'Compliance', 'Vetting'], [14000, 24000]),
  o('Harbour Master', 'Maritime', 'exec', ['Port Authority', 'Navigation Safety', 'Regulation', 'Leadership'], [16000, 28000]),

  // ─ Skilled Trades (MASCO group 7) ─
  o('Electrician', 'Skilled Trades', 'junior', ['Electrical Wiring', 'Installation', 'Fault Finding', 'Safety'], [2500, 4800], { masco: '7411' }),
  o('Plumber', 'Skilled Trades', 'junior', ['Plumbing', 'Pipe Fitting', 'Installation', 'Maintenance'], [2400, 4500], { masco: '7126' }),
  o('Welder', 'Skilled Trades', 'junior', ['Welding', 'MIG/TIG', 'Fabrication', 'Blueprint Reading'], [2600, 5000], { masco: '7212' }),
  o('Carpenter', 'Skilled Trades', 'junior', ['Carpentry', 'Joinery', 'Measuring', 'Finishing'], [2400, 4500], { masco: '7115' }),
  o('Automotive Mechanic', 'Skilled Trades', 'junior', ['Engine Repair', 'Diagnostics', 'Servicing', 'Brakes'], [2400, 4600], { masco: '7231' }),
  o('HVAC Technician', 'Skilled Trades', 'mid', ['HVAC', 'Refrigeration', 'Installation', 'Troubleshooting'], [3200, 6000], { masco: '7127' }),
  o('Machinist', 'Skilled Trades', 'mid', ['CNC', 'Lathe/Milling', 'Precision', 'Blueprint Reading'], [3200, 6000], { masco: '7223' }),
  o('Chargeman / Wireman', 'Skilled Trades', 'mid', ['Electrical Supervision', 'ST Compliance', 'Switchgear', 'Safety'], [4000, 7500], { mycol: true }),
  o('Master Electrician', 'Skilled Trades', 'senior', ['Electrical Systems', 'Compliance', 'Supervision', 'Testing'], [5500, 9500]),
  o('Trade Foreman', 'Skilled Trades', 'lead', ['Crew Supervision', 'Scheduling', 'Quality', 'Safety'], [6000, 10000]),

  // ─ Transport & Operators (MASCO group 8) ─
  o('Delivery Rider', 'Transport & Operators', 'entry', ['Navigation', 'Time Management', 'Customer Service', 'Safety'], [1800, 3500], { masco: '9331' }),
  o('Machine Operator', 'Transport & Operators', 'entry', ['Machine Operation', 'Safety', 'Quality Checks', '5S'], [1800, 3200], { masco: '8100' }),
  o('Lorry / Truck Driver', 'Transport & Operators', 'entry', ['Heavy Vehicle', 'Route Planning', 'Safety', 'Logbook'], [2200, 4200], { masco: '8332' }),
  o('Bus Driver', 'Transport & Operators', 'entry', ['Passenger Transport', 'Safety', 'Route Adherence', 'Service'], [2200, 3800], { masco: '8331' }),
  o('Forklift Operator', 'Transport & Operators', 'entry', ['Forklift', 'Warehouse Safety', 'Loading', 'Inventory'], [2000, 3600], { masco: '8344' }),
  o('Crane Operator', 'Transport & Operators', 'junior', ['Crane Operation', 'Rigging', 'Load Charts', 'Safety'], [3000, 5500], { masco: '8343' }),
  o('Heavy Equipment Operator', 'Transport & Operators', 'junior', ['Excavator/Loader', 'Site Safety', 'Maintenance', 'Precision'], [2800, 5200]),
  o('Fleet Supervisor', 'Transport & Operators', 'mid', ['Fleet Coordination', 'Scheduling', 'Compliance', 'Driver Mgmt'], [4500, 7500]),

  // ─ Personal & Community Services (MASCO groups 5, 9) ─
  o('Cleaner / Housekeeping Attendant', 'Personal & Community Services', 'entry', ['Cleaning', 'Sanitation', 'Safety', 'Time Management'], [1700, 2800], { masco: '9112' }),
  o('Caregiver', 'Personal & Community Services', 'entry', ['Elderly Care', 'Daily Assistance', 'Compassion', 'First Aid'], [1800, 3200], { masco: '5322' }),
  o('Childcare Worker', 'Personal & Community Services', 'entry', ['Child Supervision', 'Early Learning', 'Safety', 'Patience'], [1800, 3200], { masco: '5311' }),
  o('Community Health Worker', 'Personal & Community Services', 'junior', ['Health Outreach', 'Education', 'Screening', 'Referral'], [2400, 4000]),
  o('Domestic Services Supervisor', 'Personal & Community Services', 'junior', ['Team Coordination', 'Scheduling', 'Quality', 'Training'], [2800, 4800]),
  o('Social Worker', 'Personal & Community Services', 'mid', ['Case Management', 'Counseling', 'Community Resources', 'Advocacy'], [3800, 6800], { masco: '2635' }),
  o('Elderly Care Manager', 'Personal & Community Services', 'mid', ['Care Home Ops', 'Care Planning', 'Staffing', 'Compliance'], [5000, 8500]),

  // ─ Beauty & Wellness ─
  o('Beauty Advisor', 'Beauty & Wellness', 'entry', ['Product Advisory', 'Skincare', 'Sales', 'Customer Service'], [2000, 3500]),
  o('Hairstylist', 'Beauty & Wellness', 'junior', ['Hair Styling', 'Cutting', 'Colouring', 'Client Care'], [2200, 4500], { masco: '5141' }),
  o('Beautician / Aesthetician', 'Beauty & Wellness', 'junior', ['Facials', 'Skincare Treatments', 'Client Care', 'Hygiene'], [2200, 4500], { masco: '5142' }),
  o('Spa Therapist', 'Beauty & Wellness', 'junior', ['Massage', 'Body Treatments', 'Client Care', 'Wellness'], [2200, 4200]),
  o('Makeup Artist', 'Beauty & Wellness', 'junior', ['Makeup Artistry', 'Bridal', 'Editorial', 'Client Care'], [2500, 5500]),
  o('Salon Manager', 'Beauty & Wellness', 'mid', ['Salon Operations', 'Team Leadership', 'Sales', 'Inventory'], [4000, 7000]),
  o('Wellness Centre Manager', 'Beauty & Wellness', 'senior', ['Wellness Ops', 'Programming', 'P&L', 'Team Leadership'], [6000, 11000]),

  // ─ Public Safety & Defence (MASCO group 0) ─
  o('Security Officer', 'Public Safety & Defence', 'entry', ['Surveillance', 'Access Control', 'Patrolling', 'Reporting'], [1800, 3200], { masco: '5414' }),
  o('Police Constable', 'Public Safety & Defence', 'entry', ['Law Enforcement', 'Patrol', 'Investigation Basics', 'Public Safety'], [2500, 4200], { masco: '5412' }),
  o('Armed Forces Personnel', 'Public Safety & Defence', 'entry', ['Military Training', 'Discipline', 'Operations', 'Teamwork'], [2200, 4000], { masco: '0110' }),
  o('Firefighter', 'Public Safety & Defence', 'junior', ['Fire Suppression', 'Rescue', 'Emergency Response', 'Safety'], [2600, 4500], { masco: '5411' }),
  o('Emergency Response Officer', 'Public Safety & Defence', 'mid', ['Emergency Management', 'Coordination', 'Risk Assessment', 'Response'], [4000, 7500]),
  o('Fire Safety Officer', 'Public Safety & Defence', 'mid', ['Fire Safety', 'Inspection', 'Compliance', 'Training'], [4000, 7000]),
  o('Security Manager', 'Public Safety & Defence', 'lead', ['Security Operations', 'Team Leadership', 'Risk', 'Systems'], [7000, 12000]),
  o('Police Inspector', 'Public Safety & Defence', 'senior', ['Investigation', 'Command', 'Case Management', 'Leadership'], [6000, 11000]),
];

export const SECTORS = [
  // Professional / white-collar
  'Tech',
  'Finance',
  'Marketing',
  'Energy',
  'Consulting',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Construction',
  'Hospitality',
  'Logistics',
  'Public Sector',
  'Legal',
  'Creative',
  'Retail',
  'Agriculture',
  // Cross-cutting functions + additional industries
  'Human Resources',
  'Sales',
  'Customer Service',
  'Administration',
  'Telecommunications',
  'Aviation',
  'Automotive',
  'Insurance',
  'Pharma',
  'Environmental',
  'Non-profit',
  'Sports & Fitness',
  'Maritime',
  // Skilled-trades, service + frontline economy (MASCO groups 0,5,7,8,9)
  'Skilled Trades',
  'Transport & Operators',
  'Personal & Community Services',
  'Beauty & Wellness',
  'Public Safety & Defence',
] as const;

export const MY_STATES = [
  'Kuala Lumpur',
  'Selangor',
  'Penang',
  'Johor',
  'Sarawak',
  'Sabah',
  'Perak',
  'Kedah',
  'Kelantan',
  'Terengganu',
  'Pahang',
  'Negeri Sembilan',
  'Melaka',
  'Perlis',
  'Putrajaya',
  'Labuan',
] as const;

export type Sector = (typeof SECTORS)[number];
export type MyState = (typeof MY_STATES)[number];

export function occupationsBySector(sector: string): Occupation[] {
  return OCCUPATIONS.filter((occ) => occ.sector === sector);
}
export function findOccupation(role: string): Occupation | undefined {
  return OCCUPATIONS.find((occ) => occ.role.toLowerCase() === role.toLowerCase());
}
