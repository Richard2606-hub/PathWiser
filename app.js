/* ═══════════════════════════════════════════════════════════════
   PathWiser · Career OS — app.js
   Full application logic for all 16 modules
   ═══════════════════════════════════════════════════════════════ */

// ─── STATE ───────────────────────────────────────────────────
const state = {
  persona: 'candidate',
  module: 'path_navigator',
  onboardStep: 0,
  onboardRole: null,
  outcomeHorizon: 'first',
  shape: { technical: 65, domain: 50, leadership: 30, analytics: 75, communication: 45 },
  // judgeMode === false → production view: user only sees their own audience surface.
  // judgeMode === true  → demo view: all three audiences visible, persona switcher active.
  judgeMode: false,
  // Identity shown in the locked-mode pill (set by quickLaunch or onboarding).
  identity: { name: 'You', role: 'Candidate' },
  demoPersona: null
};

const ROLE_LABEL = { candidate: 'Candidate', employer: 'Employer', university: 'University' };
const ROLE_ICON  = { candidate: '👤', employer: '🏢', university: '🎓' };

// ─── MODULE REGISTRY ─────────────────────────────────────────
// `desc` answers "what decision does this help the user make?" — not "what tech does it use?"
// `cap` is the capability row: Navigation / Intelligence / Valuation (matches the proposal's 3×3 map)
// `purpose` is a one-line line shown under the screen title — the user-facing job-to-be-done
const MODULES = {
  // ─ Engine Layer ─ (how the system works, visible to system-curious judges)
  user_profile:         { title: 'User Profile & Trajectory Shape', abbr: 'UP',  badge: 'Engine · Shape',      cap: 'Engine', persona: 'engine', layer: 'engine',
    desc: 'The structured representation of who you are — skills, education, prior roles, geography, life stage. Embedded as a 768-d vector for retrieval.',
    purpose: 'How the engine knows who you are.' },
  trajectory_retrieval: { title: 'Trajectory Retrieval Engine',     abbr: 'TR',  badge: 'Engine · Retrieval',  cap: 'Engine', persona: 'engine', layer: 'engine',
    desc: 'pgvector HNSW similarity search over the trajectory corpus. Returns the cohort of anonymised paths whose shape resembles yours.',
    purpose: 'How the engine finds people like you.' },
  outcomes_aggregation: { title: 'Range-of-Outcomes Aggregation',   abbr: 'OA',  badge: 'Engine · Aggregation',cap: 'Engine', persona: 'engine', layer: 'engine',
    desc: 'Deterministic computation of the distribution within the cohort — salary percentiles, time-in-role, skill bridges. The numbers come from here, not the LLM.',
    purpose: 'How the engine computes the numbers honestly.' },
  ai_explanation:       { title: 'Honest Narrative Layer',          abbr: 'AI',  badge: 'Engine · Narrative',  cap: 'Engine', persona: 'engine', layer: 'engine',
    desc: 'Structured aggregates → hedged narrative. The LLM only explains. A validator rejects predictive verbs before output reaches the user.',
    purpose: 'How the engine turns evidence into honest language.' },

  // ─ Candidate Surface ─ (3 modules · Navigation / Intelligence / Valuation)
  path_navigator:       { title: 'Career Path Navigator',           abbr: 'CPN', badge: 'For Candidates · Navigation', cap: 'Navigation', persona: 'candidate', layer: 'nav',
    desc: 'See 4–5 realistic next moves from where you are — with cohort size, salary range, time-in-role, and the trade-offs of each.',
    purpose: 'Decide your next move with evidence, not gut feel.' },
  ai_coach:             { title: 'AI Career Coach',                 abbr: 'ACC', badge: 'For Candidates · Intelligence', cap: 'Intelligence', persona: 'candidate', layer: 'intel',
    desc: 'Ask the questions you can\'t ask anyone else — pivots, salary, skill gaps, timelines. Every answer cites the cohort it draws on. Never a prediction.',
    purpose: 'Get a senior mentor\'s answer to the question you\'re afraid to ask.' },
  fair_pay:             { title: 'Fair Pay Engine',                 abbr: 'FPE', badge: 'For Candidates · Valuation', cap: 'Valuation', persona: 'candidate', layer: 'val',
    desc: 'Find out if you\'re paid what you\'re worth. DOSM-calibrated percentile for your role, location, and experience — with the gap to median spelled out.',
    purpose: 'Walk into your next salary conversation with evidence.' },

  // ─ Employer Surface ─ (3 modules · Navigation / Intelligence / Valuation)
  talent_matching:      { title: 'Smart Talent Matching',           abbr: 'STM', badge: 'For Employers · Navigation', cap: 'Navigation', persona: 'employer', layer: 'nav',
    desc: 'Surface candidates whose trajectory direction fits the role — including adjacent ones a keyword search would miss. Each match shows reasoning, not a black-box score.',
    purpose: 'Find the right person, including the ones you\'d never have searched for.' },
  retention_signals:    { title: 'Talent Retention Signals',        abbr: 'TRS', badge: 'For Employers · Intelligence', cap: 'Intelligence', persona: 'employer', layer: 'intel',
    desc: 'Spot disengagement patterns before they become resignation letters. Cohort-based comparison flags risk early enough to have the retention conversation.',
    purpose: 'Have the conversation before the letter arrives.' },
  onboarding_predictor: { title: 'Onboarding Success Predictor',    abbr: 'OSP', badge: 'For Employers · Valuation', cap: 'Valuation', persona: 'employer', layer: 'val',
    desc: 'See which new hires are likely to thrive and which need support — based on the cohort of past hires with similar shapes who went through this role.',
    purpose: 'Focus your onboarding effort where it actually makes a difference.' },

  // ─ University Surface ─ (3 modules · Navigation / Intelligence / Valuation)
  outcome_loop:         { title: 'Lifelong Outcome Loop',           abbr: 'LOL', badge: 'For Universities · Navigation', cap: 'Navigation', persona: 'university', layer: 'nav',
    desc: 'Track where your graduates actually land at 1, 5, and 10 years out — not just first jobs. Honest distributions of where each programme\'s cohort ends up.',
    purpose: 'Stop losing sight of your graduates after the diploma.' },
  curriculum_engine:    { title: 'Future-State Curriculum Engine',  abbr: 'FCE', badge: 'For Universities · Intelligence', cap: 'Intelligence', persona: 'university', layer: 'intel',
    desc: 'See the gap between what employers are hiring for and what you\'re teaching. Cohort-evidenced curriculum recommendations with implementation lead time.',
    purpose: 'Teach what will still be useful when this cohort graduates.' },
  readiness_profile:    { title: 'Alumni Readiness Profile',        abbr: 'ARP', badge: 'For Universities · Valuation', cap: 'Valuation', persona: 'university', layer: 'val',
    desc: 'A live capability profile that grows with the student — replaces the static degree certificate with a dynamic, employer-facing readiness signal.',
    purpose: 'Show employers what your student can actually do — right now, not what they did at 22.' },

  // ─ Support Layer ─
  feedback:             { title: 'Feedback & Reflection Surface',   abbr: 'F&R', badge: 'Support · Loop',      cap: 'Support', persona: 'all', layer: 'support',
    desc: 'Capture your reactions to engine outputs. Feedback flows into the corpus curation queue — the loop closes.',
    purpose: 'Help the engine get better, see your past sessions.' },
  analytics:            { title: 'System Analytics & Monitoring',   abbr: 'SAM', badge: 'Support · Operations',cap: 'Support', persona: 'all', layer: 'support',
    desc: 'Internal engineering dashboard — latency by stage, validation rejection rate, citation coverage, k-anonymity compliance. End users do not see this.',
    purpose: 'Visible to the engineering team only.' },
  security:             { title: 'Security, Privacy & Access',      abbr: 'SPA', badge: 'Support · Trust',     cap: 'Support', persona: 'all', layer: 'support',
    desc: 'Row-level security in Postgres, revocable consent flows, k-anonymity (k≥5) enforced before any cohort surfaces. The trust layer underneath everything.',
    purpose: 'How the system stays trustworthy.' },

  // ─ Meta / Overview ─
  architecture:         { title: 'Architecture & Vision',           abbr: '🏗️', badge: 'System Overview',     cap: 'Overview', persona: 'all', layer: 'meta',
    desc: 'The Career Signal Loop architecture, the 9-module map, data strategy, tech stack, judging alignment, and 28-day plan in one view.',
    purpose: 'The whole vision on one screen — start here.' }
};

// ─── SAMPLE DATA ─────────────────────────────────────────────
const PATHS = [
  // Salary anchors calibrated against DOSM Salaries & Wages Survey 2024 (median RM 2,793, graduate median RM 4,521)
  // and recruiter guide headline figures (Michael Page MY, Hays Asia, Robert Walters MY 2025/26).
  { id: 'current',  label: 'Junior Data Analyst',    x: 80,  y: 260, type: 'current',  salary: 'RM 4,200/m', cohort: 2840, tenure: '1.2 yrs', prob: '—',   mycol: false },
  { id: 'mid1',     label: 'Data Analyst',            x: 200, y: 200, type: 'primary',  salary: 'RM 5,400/m', cohort: 3120, tenure: '2.1 yrs', prob: '72%', mycol: true  },
  { id: 'mid2',     label: 'BI Specialist',           x: 200, y: 310, type: 'adjacent', salary: 'RM 5,800/m', cohort: 1860, tenure: '2.4 yrs', prob: '35%', mycol: false },
  { id: 'sr1',      label: 'Senior Data Scientist',   x: 370, y: 140, type: 'primary',  salary: 'RM 9,500/m', cohort: 1240, tenure: '2.8 yrs', prob: '48%', mycol: true  },
  { id: 'sr2',      label: 'Analytics Manager',       x: 370, y: 240, type: 'primary',  salary: 'RM 10,200/m',cohort: 980,  tenure: '3.1 yrs', prob: '38%', mycol: false },
  { id: 'sr3',      label: 'ML Engineer',             x: 370, y: 340, type: 'adjacent', salary: 'RM 11,000/m',cohort: 720,  tenure: '2.2 yrs', prob: '22%', mycol: true  },
  { id: 'lead1',    label: 'Head of Data',            x: 540, y: 180, type: 'primary',  salary: 'RM 16,500/m',cohort: 380,  tenure: '3.8 yrs', prob: '18%', mycol: false },
  { id: 'lead2',    label: 'Principal DS',            x: 540, y: 300, type: 'adjacent', salary: 'RM 18,000/m',cohort: 210,  tenure: '4.2 yrs', prob: '12%', mycol: true  }
];
const EDGES = [
  ['current','mid1'],['current','mid2'],['mid1','sr1'],['mid1','sr2'],['mid2','sr2'],['mid2','sr3'],['sr1','lead1'],['sr2','lead1'],['sr1','lead2'],['sr3','lead2']
];
const SKILL_PILLS = {
  sr1: ['Advanced ML','Deep Learning','MLOps','Statistical Modeling'],
  sr2: ['People Management','Stakeholder Comms','Budget Planning'],
  sr3: ['PyTorch','Kubernetes','Model Serving','CI/CD'],
  lead1: ['Executive Presence','Strategy','Board Reporting'],
  lead2: ['Research Publication','Architecture','Mentoring'],
  mid1: ['SQL Optimization','Dashboard Design','ETL Pipelines'],
  mid2: ['Power BI','DAX','Data Warehousing']
};

const TALENT_CANDIDATES = [
  { name: 'Nurul Aisyah', role: 'Data Engineer @ Grab MY', match: 94, skills: ['Python','Spark','Airflow','SQL'], exp: '4 yrs', shape: [80,60,40,90,55], flag: null },
  { name: 'Raj Vikram', role: 'ML Scientist @ AirAsia', match: 89, skills: ['TensorFlow','Python','Statistics','MLOps'], exp: '5 yrs', shape: [90,55,35,85,40], flag: 'retention_risk' },
  { name: 'Chen Wei Lin', role: 'Analytics Lead @ Maybank', match: 82, skills: ['R','Tableau','SQL','Forecasting'], exp: '6 yrs', shape: [70,75,60,80,65], flag: null },
  { name: 'Amirah Zainal', role: 'BI Analyst @ PETRONAS', match: 78, skills: ['Power BI','DAX','Azure','Python'], exp: '3 yrs', shape: [65,80,30,70,50], flag: 'upskill_needed' }
];

const RETENTION_DATA = [
  { name: 'Dept: Engineering', risk: 'High', score: 78, drivers: ['Below-median compensation','Limited growth paths','Manager turnover'], count: 42 },
  { name: 'Dept: Data Science', risk: 'Medium', score: 55, drivers: ['Market demand pressure','Skill ceiling perception'], count: 18 },
  { name: 'Dept: Product', risk: 'Low', score: 25, drivers: ['Strong culture fit','Clear progression'], count: 8 },
  { name: 'Dept: Marketing', risk: 'Medium', score: 48, drivers: ['Role ambiguity','Cross-functional friction'], count: 14 }
];

const CHAT_RESPONSES = {
  'pivot': "Based on 1,240 cohort trajectories, **Engineering → PM transitions** typically take 18–24 months. Key bridging skills: stakeholder management, roadmap planning, and user research. 62% of successful pivots involved an internal lateral move first, rather than an external jump.\n\n⚠️ *Honest note: This reflects cohort aggregates, not a prediction of your individual outcome.*",
  'salary': "For **Senior Data Scientists in Kuala Lumpur** (3–5 yrs exp), here's the DOSM-calibrated range from a cohort of 1,240 similar trajectories:\n• P25: RM 7,800/m\n• Median: RM 9,500/m\n• P75: RM 12,200/m\n\n**Context anchors:**\n• DOSM 2024 graduate median (KL): RM 5,888/m\n• MASCO 2511 (Professionals) median: RM 5,821/m\n• Robert Walters MY 2025 senior software dev: RM 12,000–18,000/m\n\nYour current shape positions you near the **55th percentile** of this cohort.\n\n📊 *Calibration sources: DOSM Salaries & Wages Survey 2024 (CC-BY-4.0) + Michael Page MY, Hays Asia, Robert Walters MY headline figures. The LLM never invented these numbers — they're computed deterministically over the cohort.*",
  'skills': "For **machine learning** career paths, the top bridging skills from your current shape are:\n1. **Deep Learning Frameworks** (PyTorch/TensorFlow) — 89% of ML roles require this\n2. **MLOps & Model Serving** — Growing 34% YoY in Malaysian job postings\n3. **Statistical Modeling** — Foundation skill, 72% coverage needed\n\nRecommended learning path: 6–9 months of structured upskilling.",
  'timeline': "Mid-career transitions in the Malaysian tech market typically follow this pattern:\n• **Lateral (same level, new domain):** 3–6 months\n• **Diagonal (level up + new domain):** 12–18 months\n• **Vertical (same domain, level up):** 6–12 months\n\nBased on 2,840 trajectories, the median transition includes 2.3 months of active job searching.",
  'tradeoff': "**Technical IC vs. Management** — a classic fork:\n\n| Factor | Technical IC | Management |\n|--------|-------------|------------|\n| Salary ceiling (MY) | RM 18–25K/m | RM 20–35K/m |\n| Cohort size | Smaller (210) | Larger (980) |\n| Skill decay risk | Higher | Lower |\n| Autonomy | Higher | Lower |\n\n68% of cohort members who chose management reported satisfaction, vs 74% for IC path.\n\n⚖️ *Trade-off note: Management offers higher ceiling but requires giving up deep technical work.*"
};

const ONBOARD_HIRES = [
  { name: 'Ahmad Faizal', role: 'Full-Stack Developer', shapeMatch: 87, eta: '4.2 weeks', risk: 'Low', interventions: ['Buddy system','Code review pairing','Architecture walkthrough'], similar: 145 },
  { name: 'Siti Aminah', role: 'Data Analyst', shapeMatch: 72, eta: '6.8 weeks', risk: 'Medium', interventions: ['SQL bootcamp','Domain immersion','Stakeholder intro series'], similar: 98 },
  { name: 'Lee Mei Ling', role: 'Product Designer', shapeMatch: 64, eta: '8.1 weeks', risk: 'High', interventions: ['Design system onboarding','User research shadowing','Cross-functional sprint'], similar: 62 }
];

// ─── HERO CANVAS ─────────────────────────────────────────────
function initHeroCanvas() {
  const c = document.getElementById('hero-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, particles = [];
  function resize() { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i = 0; i < 60; i++) particles.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*2+0.5, dx: (Math.random()-0.5)*0.4, dy: (Math.random()-0.5)*0.4, o: Math.random()*0.5+0.2 });
  function draw() {
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(250,204,21,${p.o})`; ctx.fill();
    });
    for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
      const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
      if (d<120) { ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.strokeStyle=`rgba(250,204,21,${0.08*(1-d/120)})`; ctx.stroke(); }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ─── ENTER DASHBOARD ─────────────────────────────────────────
function enterDashboard() {
  document.getElementById('hero-section').style.display = 'none';
  document.getElementById('onboarding-overlay').classList.add('active');
  renderOnboardStep();
}

// ─── DEMO PERSONAS (skip onboarding for judges) ─────────────
const DEMO_PERSONAS = {
  candidate: {
    name: 'Aisyah binti Rahman',
    role: 'Junior Data Analyst',
    org: 'TM ONE · Kuala Lumpur',
    shape: { technical: 68, domain: 55, leadership: 32, analytics: 78, communication: 48 },
    landingModule: 'path_navigator'
  },
  employer: {
    name: 'Mei Lin Tan',
    role: 'Talent Acquisition Lead',
    org: 'BoldRise Sdn Bhd · KL Sentral',
    shape: { technical: 35, domain: 70, leadership: 75, analytics: 60, communication: 80 },
    landingModule: 'talent_matching'
  },
  university: {
    name: 'Dr. Hafiz Mustafa',
    role: 'Programme Director · Faculty of Computing',
    org: 'Universiti Teknologi Malaysia',
    shape: { technical: 75, domain: 85, leadership: 70, analytics: 70, communication: 75 },
    landingModule: 'outcome_loop'
  }
};

function quickLaunch(personaKey) {
  const p = DEMO_PERSONAS[personaKey];
  if (!p) return;
  // Apply pre-seeded shape
  Object.assign(state.shape, p.shape);
  state.demoPersona = p;
  state.identity = { name: p.name, role: p.role };
  // Production-default: locked to the chosen audience.
  setJudgeMode(false);
  // Hide hero, skip onboarding entirely, jump straight to dashboard
  document.getElementById('hero-section').style.display = 'none';
  document.getElementById('onboarding-overlay').classList.remove('active');
  document.getElementById('dashboard-section').classList.add('active');
  bootDashboard();
  switchPersona(personaKey);
  refreshIdentity(personaKey, state.identity);
  selectModule(p.landingModule);
  // Surface a small "welcome as <persona>" toast so judges know which seat they're in
  showDemoToast(p);
}

function showDemoToast(p) {
  let t = document.getElementById('demo-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'demo-toast';
    t.className = 'demo-toast';
    document.body.appendChild(t);
  }
  const personaColor = state.persona === 'candidate' ? 'var(--yellow)' :
                       state.persona === 'employer' ? 'var(--teal)' : 'var(--violet)';
  t.innerHTML = `
    <div class="demo-toast-bar" style="background:${personaColor};"></div>
    <div class="demo-toast-body">
      <span class="demo-toast-label">Demo Persona Loaded</span>
      <span class="demo-toast-name">${p.name}</span>
      <span class="demo-toast-sub">${p.role} · ${p.org}</span>
      <span class="demo-toast-hint">Shape pre-seeded. This is what a real ${ROLE_LABEL[state.persona] || 'user'} sees in production — toggle 🎬 Judge view to compare audiences.</span>
    </div>
    <button class="demo-toast-close" onclick="document.getElementById('demo-toast').classList.remove('visible')">✕</button>
  `;
  t.classList.add('visible');
  clearTimeout(window._demoToastTimer);
  window._demoToastTimer = setTimeout(() => t.classList.remove('visible'), 6000);
}

// ─── ONBOARDING ──────────────────────────────────────────────
function setOnboardRole(role) {
  state.onboardRole = role;
  document.querySelectorAll('#onboard-step-0 .btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('onboard-next').style.visibility = 'visible';
  if (role === 'employer' || role === 'university') {
    document.getElementById('onboard-next').textContent = 'Launch Dashboard →';
  } else {
    document.getElementById('onboard-next').textContent = 'Next →';
  }
}

function renderOnboardStep() {
  const steps = document.querySelectorAll('.onboard-step');
  steps.forEach((s,i) => s.classList.toggle('active', i === state.onboardStep));
  document.getElementById('onboard-back').style.visibility = state.onboardStep > 0 ? 'visible' : 'hidden';
  document.getElementById('onboard-next').style.visibility = state.onboardStep === 0 && !state.onboardRole ? 'hidden' : 'visible';
  document.getElementById('onboard-step-label').textContent = `Step ${state.onboardStep+1} of 4`;

  let titles = ['Welcome to PathWiser','Profile Intake','ESCO Normalization','Your Career Shape'];
  let subs = ['Select your audience role.','Tell us about your career.','Standardizing your profile.','Your career profile is ready.'];

  if (state.onboardRole === 'employer') {
    titles = ['Welcome to PathWiser', 'Organization Intake', 'ISIC/ESCO Normalization', 'Your Talent Demand Shape'];
    subs = ['Select your audience role.', 'Tell us about your hiring needs.', 'Standardizing your target profile.', 'Your talent demand profile is ready.'];
  } else if (state.onboardRole === 'university') {
    titles = ['Welcome to PathWiser', 'Programme Intake', 'ISCED Normalization', 'Your Curriculum Shape'];
    subs = ['Select your audience role.', 'Tell us about your degree programme.', 'Standardizing your curriculum.', 'Your curriculum capability profile is ready.'];
  }

  document.getElementById('onboard-title').textContent = titles[state.onboardStep];
  document.getElementById('onboard-subtitle').textContent = subs[state.onboardStep];

  if (state.onboardStep === 1) renderIntakeForm();
  if (state.onboardStep === 2) renderEscoPreview();
  if (state.onboardStep === 3) { renderShapeRadar(); renderShapeMetrics(); document.getElementById('onboard-next').textContent = 'Launch Dashboard →'; }
  else { 
    if (state.onboardStep === 0 && (state.onboardRole === 'employer' || state.onboardRole === 'university')) {
      document.getElementById('onboard-next').textContent = 'Launch Dashboard →';
    } else {
      document.getElementById('onboard-next').textContent = 'Next →'; 
    }
  }

  // Step dots
  let dots = '';
  for (let i=0;i<4;i++) dots += `<span class="step-dot ${i===state.onboardStep?'active':''} ${i<state.onboardStep?'done':''}"></span>`;
  document.getElementById('step-dots').innerHTML = dots;
}

function renderIntakeForm() {
  const container = document.getElementById('onboard-step-1');
  if (state.onboardRole === 'employer') {
    container.innerHTML = `
      <div class="form-group"><span class="form-label">Company Name</span><input type="text" class="form-input" id="onboard-role" placeholder="e.g. BoldRise Sdn Bhd" value="BoldRise Sdn Bhd"></div>
      <div class="form-group"><span class="form-label">Target Hiring Role</span><input type="text" class="form-input" placeholder="e.g. Data Scientist" value="Data Scientist"></div>
      <div class="form-group"><span class="form-label">Hiring Volume</span>
        <select class="form-select"><option>1–5 hires</option><option selected>6–20 hires</option><option>20+ hires</option></select>
      </div>
      <div class="form-group"><span class="form-label">Location</span>
        <select class="form-select"><option>Kuala Lumpur</option><option>Selangor</option><option>Penang</option><option>Johor</option></select>
      </div>
      <div class="form-group"><span class="form-label">Target Skills (comma-separated)</span><input type="text" class="form-input" id="onboard-skills" placeholder="e.g. Python, SQL" value="Python, SQL, Machine Learning"></div>
    `;
  } else if (state.onboardRole === 'university') {
    container.innerHTML = `
      <div class="form-group"><span class="form-label">University Name</span><input type="text" class="form-input" id="onboard-role" placeholder="e.g. Universiti Teknologi Malaysia" value="Universiti Teknologi Malaysia"></div>
      <div class="form-group"><span class="form-label">Faculty / Department</span><input type="text" class="form-input" placeholder="e.g. Faculty of Computing" value="Faculty of Computing"></div>
      <div class="form-group"><span class="form-label">Programme Name</span><input type="text" class="form-input" placeholder="e.g. BSc Computer Science" value="BSc Computer Science"></div>
      <div class="form-group"><span class="form-label">Annual Cohort Size</span>
        <select class="form-select"><option>50–100</option><option selected>100–300</option><option>300+</option></select>
      </div>
      <div class="form-group"><span class="form-label">Core Curriculum Skills</span><input type="text" class="form-input" id="onboard-skills" placeholder="e.g. Java, Algorithms" value="Java, Algorithms, Data Structures, SQL"></div>
    `;
  } else {
    // Default Candidate
    container.innerHTML = `
      <div class="form-group"><span class="form-label">Current Role / Title</span><input type="text" class="form-input" id="onboard-role" placeholder="e.g. Junior Data Analyst" value="Junior Data Analyst"></div>
      <div class="form-group"><span class="form-label">Education</span>
        <select class="form-select"><option>Bachelor's in Computer Science</option><option>Bachelor's in Information Technology</option><option>Master's in Data Science</option></select>
      </div>
      <div class="form-group"><span class="form-label">Years of Experience</span>
        <select class="form-select"><option value="1">1–2 years</option><option value="3" selected>3–5 years</option><option value="6">6–10 years</option></select>
      </div>
      <div class="form-group"><span class="form-label">State / Region</span>
        <select class="form-select"><option>Kuala Lumpur</option><option>Selangor</option><option>Penang</option></select>
      </div>
      <div class="form-group"><span class="form-label">Core Skills (comma-separated)</span><input type="text" class="form-input" id="onboard-skills" placeholder="e.g. Python, SQL, Tableau" value="Python, SQL, Tableau, Excel"></div>
    `;
  }
}

function onboardNext() {
  const role = state.onboardRole || 'candidate';

  // Fast-track bypass for Employer & University
  if (state.onboardStep === 0 && (role === 'employer' || role === 'university')) {
    const enteredTitle = role === 'employer' ? 'BoldRise Sdn Bhd' : 'Universiti Teknologi Malaysia';
    state.identity = { name: enteredTitle, role: ROLE_LABEL[role] };
    setJudgeMode(false);
    document.getElementById('onboarding-overlay').classList.remove('active');
    document.getElementById('dashboard-section').classList.add('active');
    bootDashboard();
    switchPersona(role);
    refreshIdentity(role, state.identity);
    const landingMap = { candidate: 'path_navigator', employer: 'talent_matching', university: 'outcome_loop' };
    selectModule(landingMap[role]);
    return;
  }

  if (state.onboardStep < 3) { state.onboardStep++; renderOnboardStep(); }
  else {
    // Capture the chosen role + entered title; land in locked production view for that audience.
    const titleInput = document.getElementById('onboard-role');
    const enteredTitle = titleInput?.value?.trim() || ROLE_LABEL[role];
    state.identity = { name: enteredTitle, role: ROLE_LABEL[role] };
    setJudgeMode(false);
    document.getElementById('onboarding-overlay').classList.remove('active');
    document.getElementById('dashboard-section').classList.add('active');
    bootDashboard();
    switchPersona(role);
    refreshIdentity(role, state.identity);
    const landingMap = { candidate: 'path_navigator', employer: 'talent_matching', university: 'outcome_loop' };
    selectModule(landingMap[role]);
  }
}
function onboardBack() { if (state.onboardStep > 0) { state.onboardStep--; renderOnboardStep(); } }

function renderEscoPreview() {
  const role = document.getElementById('onboard-role')?.value || 'Junior Data Analyst';
  const skills = (document.getElementById('onboard-skills')?.value || 'Python, SQL, Tableau, Excel').split(',').map(s=>s.trim());
  let html = '';

  if (state.onboardRole === 'employer') {
    html = `
      <div class="detail-header"><span class="detail-tag">Normalized Target</span><h3 class="detail-heading">Demand: Data Scientist</h3></div>
      <div class="metrics">
        <div class="metric"><span class="metric-label">Industry ISIC</span><span class="metric-val">J62</span></div>
        <div class="metric"><span class="metric-label">Target ESCO</span><span class="metric-val">2511.2</span></div>
        <div class="metric"><span class="metric-label">O*NET Match</span><span class="metric-val">15-2051.00</span></div>
        <div class="metric"><span class="metric-label">Confidence</span><span class="metric-val">96.5%</span></div>
      </div>
      <div style="margin-top:8px;"><span class="detail-tag">Normalized Skills</span>
      <div class="pills" style="margin-top:4px;">${skills.map(s=>`<span class="pill acquired">${s} ✓</span>`).join('')}</div></div>
    `;
  } else if (state.onboardRole === 'university') {
    html = `
      <div class="detail-header"><span class="detail-tag">Normalized Programme</span><h3 class="detail-heading">BSc Computer Science</h3></div>
      <div class="metrics">
        <div class="metric"><span class="metric-label">ISCED Code</span><span class="metric-val">0613</span></div>
        <div class="metric"><span class="metric-label">ESCO Match</span><span class="metric-val">2511, 2512</span></div>
        <div class="metric"><span class="metric-label">MQA Level</span><span class="metric-val">Level 6</span></div>
        <div class="metric"><span class="metric-label">Confidence</span><span class="metric-val">92.1%</span></div>
      </div>
      <div style="margin-top:8px;"><span class="detail-tag">Curriculum Skills</span>
      <div class="pills" style="margin-top:4px;">${skills.map(s=>`<span class="pill acquired">${s} ✓</span>`).join('')}</div></div>
    `;
  } else {
    html = `
      <div class="detail-header"><span class="detail-tag">Normalized Profile</span><h3 class="detail-heading">${role}</h3></div>
      <div class="metrics">
        <div class="metric"><span class="metric-label">ESCO Code</span><span class="metric-val">2511.2</span></div>
        <div class="metric"><span class="metric-label">O*NET Match</span><span class="metric-val">15-2051.00</span></div>
        <div class="metric"><span class="metric-label">MASCO Code</span><span class="metric-val">2120.0</span></div>
        <div class="metric"><span class="metric-label">Confidence</span><span class="metric-val">94.2%</span></div>
      </div>
      <div style="margin-top:8px;"><span class="detail-tag">Normalized Skills</span>
      <div class="pills" style="margin-top:4px;">${skills.map(s=>`<span class="pill acquired">${s} ✓</span>`).join('')}</div></div>
    `;
  }
  document.getElementById('esco-preview').innerHTML = html;
}

function renderShapeRadar() {
  const svg = document.getElementById('shape-radar');
  if (!svg) return;
  const cx=140, cy=140, r=100;
  const dims = ['Technical','Domain','Leadership','Analytics','Communication'];
  const vals = [state.shape.technical, state.shape.domain, state.shape.leadership, state.shape.analytics, state.shape.communication];
  let html = '';
  // Grid rings
  for (let ring=1;ring<=4;ring++) {
    const rr = r*ring/4;
    let pts = dims.map((_,i) => { const a = (Math.PI*2*i/5)-Math.PI/2; return `${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`; }).join(' ');
    html += `<polygon points="${pts}" fill="none" stroke="rgba(250,204,21,0.1)" stroke-width="1"/>`;
  }
  // Axes
  dims.forEach((_,i) => { const a=(Math.PI*2*i/5)-Math.PI/2; html += `<line x1="${cx}" y1="${cy}" x2="${cx+r*Math.cos(a)}" y2="${cy+r*Math.sin(a)}" stroke="rgba(250,204,21,0.15)" stroke-width="1"/>`; });
  // Data polygon
  let dataPts = vals.map((v,i) => { const a=(Math.PI*2*i/5)-Math.PI/2; const rr=r*v/100; return `${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`; }).join(' ');
  html += `<polygon points="${dataPts}" fill="rgba(250,204,21,0.15)" stroke="var(--yellow)" stroke-width="2"/>`;
  // Dots & labels
  vals.forEach((v,i) => {
    const a=(Math.PI*2*i/5)-Math.PI/2; const rr=r*v/100;
    html += `<circle cx="${cx+rr*Math.cos(a)}" cy="${cy+rr*Math.sin(a)}" r="4" fill="var(--yellow)"/>`;
    const lr = r+20;
    html += `<text x="${cx+lr*Math.cos(a)}" y="${cy+lr*Math.sin(a)}" fill="var(--text-2)" font-size="9" text-anchor="middle" dominant-baseline="middle" font-family="var(--sans)">${dims[i]}</text>`;
  });
  svg.innerHTML = html;
}

function renderShapeMetrics() {
  let cohortLabel = 'Similar Profiles Found';
  let cohortVal = '2,840';
  if (state.onboardRole === 'employer') {
    cohortLabel = 'Relevant Candidates Found';
    cohortVal = '1,420';
  } else if (state.onboardRole === 'university') {
    cohortLabel = 'Baseline Curriculum Matches';
    cohortVal = '850';
  }

  document.getElementById('shape-metrics').innerHTML = `
    <div class="metric"><span class="metric-label">Profile Depth</span><span class="metric-val">768 Data Points</span></div>
    <div class="metric"><span class="metric-label">AI Engine</span><span class="metric-val">Google AI</span></div>
    <div class="metric"><span class="metric-label">${cohortLabel}</span><span class="metric-val">${cohortVal}</span></div>
    <div class="metric"><span class="metric-label">Match Accuracy</span><span class="metric-val">89%</span></div>
  `;
}

// ─── BOOT DASHBOARD ──────────────────────────────────────────
function bootDashboard() {
  animateEnginePipeline();
  selectModule('path_navigator');
}

// ─── ENGINE PIPELINE ANIMATION ───────────────────────────────
function animateEnginePipeline() {
  const stages = ['pipe-shape','pipe-retrieval','pipe-aggregation','pipe-narrative','pipe-validation','pipe-delivery'];
  stages.forEach((id, i) => {
    setTimeout(() => document.getElementById(id).classList.add('active'), i * 400);
  });
}

// ─── PERSONA SWITCHER ────────────────────────────────────────
function switchPersona(p, opts = {}) {
  state.persona = p;
  document.querySelectorAll('.persona-btn').forEach(b => b.classList.toggle('active', b.dataset.persona === p));
  // Sidebar: expand the active persona's surface card, collapse the others
  document.querySelectorAll('.persona-card').forEach(card => {
    card.classList.toggle('active', card.dataset.persona === p);
  });
  // Auto-select first module for persona unless explicitly suppressed
  if (!opts.skipModuleJump) {
    const map = { candidate: 'path_navigator', employer: 'talent_matching', university: 'outcome_loop' };
    selectModule(map[p]);
  }
}

// Click on a persona-card header — if it's the active one, do nothing.
// If it's collapsed, switch persona to that audience (which expands it).
// In locked (non-judge) mode this should never fire because other cards are hidden.
function onPersonaCardHeadClick(p) {
  if (state.persona === p) return;
  if (!state.judgeMode) return;
  switchPersona(p);
}

// Click on the identity pill — in locked mode, opens a small explainer.
function onIdentityClick() {
  if (state.judgeMode) return;
  showLockedExplainer(null);
}

// ─── JUDGE MODE TOGGLE ───────────────────────────────────────
function toggleJudgeMode() {
  setJudgeMode(!state.judgeMode);
}

function setJudgeMode(on) {
  state.judgeMode = !!on;
  document.body.classList.toggle('judge-mode-on', state.judgeMode);
  document.body.classList.toggle('judge-mode-off', !state.judgeMode);
  const btn = document.getElementById('judge-toggle');
  const lbl = document.getElementById('judge-toggle-label');
  if (btn) btn.classList.toggle('active', state.judgeMode);
  if (lbl) lbl.textContent = state.judgeMode ? 'Lock to one view' : 'Judge view';
}

// Refresh the identity pill — name, role, icon, color theme.
function refreshIdentity(persona, identity) {
  if (identity) state.identity = identity;
  state.persona = persona;
  const icon = document.getElementById('id-icon');
  const name = document.getElementById('id-name');
  const role = document.getElementById('id-role');
  if (icon) icon.textContent = ROLE_ICON[persona] || '👤';
  if (name) name.textContent = state.identity.name || ROLE_LABEL[persona];
  if (role) role.textContent = ROLE_LABEL[persona];
  const pill = document.getElementById('identity-pill');
  if (pill) {
    pill.classList.remove('pill-candidate','pill-employer','pill-university');
    pill.classList.add('pill-' + persona);
  }
}

// Locked-mode explainer — small modal-like notice shown when a locked user
// clicks a Signal Loop node or the identity pill.
function showLockedExplainer(targetPersona) {
  let m = document.getElementById('locked-explainer');
  if (!m) {
    m = document.createElement('div');
    m.id = 'locked-explainer';
    m.className = 'locked-explainer';
    document.body.appendChild(m);
  }
  const youAre = ROLE_LABEL[state.persona];
  const note = targetPersona
    ? `In production, the <strong>${ROLE_LABEL[targetPersona]}</strong> surface is a separate account — you cannot see it as a ${youAre}. The Signal Loop here shows how <em>data</em> flows between audiences in the backend (the Career Twin Engine learns from all three), not how users navigate.`
    : `You're signed in as a <strong>${youAre}</strong>. In production, that's the only surface you see. The other audiences have their own accounts and dashboards.`;
  m.innerHTML = `
    <div class="locked-card">
      <div class="locked-card-head">
        <span class="locked-card-tag">🔒 Production view · single audience</span>
        <button class="locked-card-close" onclick="closeLockedExplainer()">✕</button>
      </div>
      <p class="locked-card-body">${note}</p>
      <div class="locked-card-actions">
        <button class="btn btn-sm" onclick="setJudgeMode(true); closeLockedExplainer();">🎬 Switch to Judge view</button>
        <button class="btn btn-ghost btn-sm" onclick="closeLockedExplainer()">Stay in production view</button>
      </div>
    </div>
  `;
  m.classList.add('visible');
}
function closeLockedExplainer() {
  document.getElementById('locked-explainer')?.classList.remove('visible');
}

// ─── MODULE SELECTOR ─────────────────────────────────────────
function selectModule(mod) {
  state.module = mod;
  const m = MODULES[mod];
  // Auto-switch persona if the selected module belongs to a different audience
  // (so cap-row clicks in a non-active card still feel coherent — only relevant
  // in judge mode, since locked mode hides other audience cards entirely).
  if (m.persona && m.persona !== 'all' && m.persona !== 'engine' && m.persona !== state.persona) {
    state.persona = m.persona;
    document.querySelectorAll('.persona-btn').forEach(b => b.classList.toggle('active', b.dataset.persona === m.persona));
    document.querySelectorAll('.persona-card').forEach(card => card.classList.toggle('active', card.dataset.persona === m.persona));
    refreshIdentity(m.persona, state.identity);
  }
  // Update sidebar highlights — both .mini-card (engine/support/overview) AND .cap-row (audience surfaces)
  document.querySelectorAll('.mini-card, .cap-row').forEach(c => c.classList.toggle('active', c.dataset.module === mod));
  // Update panel header
  document.getElementById('module-badge').textContent = m.badge;
  document.getElementById('module-title').textContent = m.title;
  // Show purpose (user-value line) prominently above the technical description
  const subtitle = document.getElementById('module-desc');
  if (m.purpose) {
    subtitle.innerHTML = `<span class="purpose-line">${m.purpose}</span><span class="desc-line">${m.desc}</span>`;
  } else {
    subtitle.textContent = m.desc;
  }
  // Show correct screen
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + mod);
  if (screen) screen.classList.add('active');
  // Render module content
  renderModule(mod);
}

function renderModule(mod) {
  switch(mod) {
    // Engine
    case 'user_profile': /* static UI mostly */ break;
    case 'trajectory_retrieval': drawVectorSpace(); break;
    case 'outcomes_aggregation': /* static UI mostly */ break;
    case 'ai_explanation': /* static UI mostly */ break;
    // Candidate
    case 'path_navigator': renderPathNavigator(); break;
    case 'ai_coach': /* already has initial content */ break;
    case 'fair_pay': renderFairPay(); break;
    // Employer
    case 'talent_matching': renderTalentMatching(); break;
    case 'retention_signals': renderRetention(); break;
    case 'onboarding_predictor': renderOnboarding(); break;
    // University
    case 'outcome_loop': renderOutcomeLoop(); break;
    case 'curriculum_engine': renderCurriculum(); break;
    case 'readiness_profile': renderReadiness(); break;
    // Support
    case 'feedback': renderFeedback(); break;
    case 'analytics': renderAnalytics(); break;
    case 'security': renderSecurity(); break;
    // Meta / Overview
    case 'architecture': renderArchSections(); break;
  }
}

// ─── M1: PROFILE SIMULATOR ──────────────────────────────────
function simulateShapeUpdate() {
  const input = document.getElementById('profile-skill-input');
  if(!input.value) return;
  input.value = '';
  const poly = document.getElementById('shape-polygon');
  if(poly) {
    // randomly shift shape a bit to simulate vector change
    poly.setAttribute('points', '100,10 190,50 170,150 120,190 10,130 30,70');
  }
}

// ─── M2: RETRIEVAL SIMULATOR — live vector space + typed log ─
function simulateRetrieval() {
  drawVectorSpace(); // initial scatter
  const log = document.getElementById('retrieval-log');
  const status = document.getElementById('retrieval-status');
  const handoff = document.getElementById('retrieval-handoff');
  if (handoff) handoff.style.display = 'none';
  if (!log) return;
  log.innerHTML = '';
  status.textContent = 'Running…'; status.style.color = 'var(--amber)';

  const lines = [
    { txt: '$ pathwiser.engine.retrieve --query=user_shape --k=1200', color: 'var(--text-2)' },
    { txt: '> Loading user shape embedding (768-d, text-embedding-004)', color: 'var(--text-2)' },
    { txt: '  query_vec = [0.124, -0.453, 0.881, 0.211, -0.092, …, 0.405]', color: 'var(--text-3)' },
    { txt: '> Connecting to Postgres + pgvector …', color: 'var(--text-2)' },
    { txt: '  pgvector v0.7.0 · HNSW index (m=16, ef_search=64)', color: 'var(--text-3)' },
    { txt: '> Running cosine similarity over corpus (42,850 trajectories)', color: 'var(--text-2)' },
    { txt: '  [████████████████████] 100% · 42ms', color: 'var(--teal)' },
    { txt: '> Applying audience filters: life_stage=Early Career, geography=MY-KL', color: 'var(--text-2)' },
    { txt: '> Cohort size check: 1,240 ≥ k_min (50) ✓', color: 'var(--teal)' },
    { txt: '> Top-K retrieved · mean cosine_distance = 0.142 · sd = 0.063', color: 'var(--teal)' },
    { txt: '> Anonymisation gate passed (k-anonymity ≥ 5) ✓', color: 'var(--teal)' },
    { txt: '✓ Retrieval complete — passing cohort to deterministic Aggregator', color: 'var(--emerald)' }
  ];

  let i = 0;
  function step() {
    if (i >= lines.length) {
      status.textContent = 'Complete'; status.style.color = 'var(--emerald)';
      // animate retrieved subset highlighting in the vector space
      highlightTopKInVectorSpace();
      if (handoff) handoff.style.display = 'inline-flex';
      return;
    }
    const div = document.createElement('div');
    div.style.color = lines[i].color;
    div.textContent = lines[i].txt;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    i++;
    setTimeout(step, i === 6 ? 380 : i === 9 ? 220 : 120);
  }
  step();
}

function drawVectorSpace() {
  const svg = document.getElementById('vec-space-svg');
  if (!svg) return;
  if (!window._vecPts) {
    // deterministic-ish scatter so the same dots appear each time
    window._vecPts = [];
    let seed = 1337;
    const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 320; i++) {
      const cx = 200 + (rng() - 0.5) * 360;
      const cy = 140 + (rng() - 0.5) * 240;
      // distance from query (200,140) determines whether it'll be top-K
      const d = Math.hypot(cx - 200, cy - 140);
      window._vecPts.push({ x: cx, y: cy, d });
    }
  }
  const pts = window._vecPts;
  let html = '';
  // background grid
  html += '<defs><pattern id="vgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></pattern></defs>';
  html += '<rect width="400" height="280" fill="url(#vgrid)"/>';
  // axes labels (subtle)
  html += '<text x="8" y="14" font-family="monospace" font-size="9" fill="rgba(148,163,184,0.5)">embedding · UMAP-2D</text>';
  // corpus dots
  pts.forEach((p, i) => {
    html += `<circle cx="${p.x}" cy="${p.y}" r="2" fill="rgba(148,163,184,0.4)" data-d="${p.d}"/>`;
  });
  // query (centered + accent)
  html += '<circle cx="200" cy="140" r="7" fill="var(--teal)" stroke="var(--bg-base)" stroke-width="2"/>';
  html += '<text x="200" y="124" font-family="monospace" font-size="9" fill="var(--teal)" text-anchor="middle">your shape</text>';
  svg.innerHTML = html;
}

function highlightTopKInVectorSpace() {
  const svg = document.getElementById('vec-space-svg');
  if (!svg || !window._vecPts) return;
  const sorted = [...window._vecPts].sort((a, b) => a.d - b.d);
  const topK = sorted.slice(0, 90); // top 90 of 320 to look visually like ~28%
  const topSet = new Set(topK);
  let html = '';
  html += '<defs><pattern id="vgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/></pattern></defs>';
  html += '<rect width="400" height="280" fill="url(#vgrid)"/>';
  // search radius ring
  const maxD = topK[topK.length - 1].d;
  html += `<circle cx="200" cy="140" r="${maxD}" fill="rgba(250,204,21,0.04)" stroke="rgba(250,204,21,0.45)" stroke-dasharray="4,3" stroke-width="1.2"/>`;
  html += '<text x="8" y="14" font-family="monospace" font-size="9" fill="rgba(148,163,184,0.5)">embedding · UMAP-2D · top-K highlighted</text>';
  // dots — animated stagger using CSS-style attribute on each
  window._vecPts.forEach((p) => {
    if (topSet.has(p)) {
      html += `<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="var(--yellow)" opacity="0.95"><animate attributeName="r" values="2;4;2.5" dur="0.6s" begin="${Math.random()*0.4}s" fill="freeze"/></circle>`;
    } else {
      html += `<circle cx="${p.x}" cy="${p.y}" r="2" fill="rgba(148,163,184,0.25)"/>`;
    }
  });
  html += '<circle cx="200" cy="140" r="7" fill="var(--teal)" stroke="var(--bg-base)" stroke-width="2"/>';
  html += '<text x="200" y="124" font-family="monospace" font-size="9" fill="var(--teal)" text-anchor="middle">your shape</text>';
  svg.innerHTML = html;
}

// ─── M5: PATH NAVIGATOR ─────────────────────────────────────
function renderPathNavigator() {
  // Stats
  document.getElementById('nav-stats').innerHTML = statCards([
    { label: 'Trajectory Corpus', val: '42,850' },
    { label: 'Active Cohort', val: '2,840' },
    { label: 'Path Branches', val: '8' },
    { label: 'Median Confidence', val: '72%' }
  ]);
  // Path graph
  drawPathGraph();
  // Default node skills
  selectPathNode('sr1');
}

function drawPathGraph() {
  const svg = document.getElementById('path-svg');
  if (!svg) return;
  const w = svg.parentElement.offsetWidth || 640;
  const h = 380;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  let html = '';
  // Edges
  EDGES.forEach(([a,b]) => {
    const na = PATHS.find(p=>p.id===a), nb = PATHS.find(p=>p.id===b);
    if(na&&nb) {
      const sx = na.x * w/640, sy = na.y * h/380, ex = nb.x * w/640, ey = nb.y * h/380;
      html += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="rgba(250,204,21,0.15)" stroke-width="2" stroke-dasharray="4,4"/>`;
    }
  });
  // Nodes
  PATHS.forEach(p => {
    const nx = p.x * w/640, ny = p.y * h/380;
    const colors = { current: 'var(--yellow)', primary: 'var(--yellow)', adjacent: 'var(--text-3)' };
    const r = p.type === 'current' ? 18 : 14;
    // MyCOL critical-occupation ring — sky blue outer halo
    if (p.mycol) {
      html += `<circle cx="${nx}" cy="${ny}" r="${r + 5}" fill="none" stroke="var(--sky)" stroke-width="1.5" stroke-dasharray="2,2" opacity="0.7" style="pointer-events:none;"><animate attributeName="stroke-dashoffset" values="0;-12" dur="3s" repeatCount="indefinite"/></circle>`;
    }
    html += `<circle cx="${nx}" cy="${ny}" r="${r}" fill="${colors[p.type]||'var(--text-3)'}" opacity="${p.type==='adjacent'?0.4:0.85}" style="cursor:pointer;" onclick="selectPathNode('${p.id}')"/>`;
    html += `<text x="${nx}" y="${ny + r + 14}" fill="var(--text-2)" font-size="9" text-anchor="middle" font-family="var(--sans)" style="pointer-events:none;">${p.label}</text>`;
    if (p.type === 'current') html += `<text x="${nx}" y="${ny+3}" fill="var(--bg-base)" font-size="8" font-weight="800" text-anchor="middle" font-family="var(--mono)" style="pointer-events:none;">YOU</text>`;
    if (p.mycol && p.type !== 'current') {
      html += `<text x="${nx}" y="${ny + r + 25}" fill="var(--sky)" font-size="7" font-family="var(--mono)" text-anchor="middle" style="pointer-events:none;letter-spacing:0.06em;">MyCOL ✦</text>`;
    }
  });
  // Legend addition — append MyCOL note
  svg.innerHTML = html;
}

function selectPathNode(id) {
  const p = PATHS.find(n=>n.id===id);
  if (!p) return;
  // Update header with MyCOL flag
  const nameEl = document.getElementById('node-name');
  nameEl.innerHTML = p.label + (p.mycol && p.type !== 'current' ? ' <span class="mycol-badge" title="On Malaysia\'s Critical Occupations List 2024/25">MyCOL ✦</span>' : '');
  document.getElementById('node-salary').textContent = p.salary;
  document.getElementById('node-cohort').textContent = p.cohort.toLocaleString();
  document.getElementById('node-tenure').textContent = p.tenure;
  document.getElementById('node-prob').textContent = p.prob;
  const pills = SKILL_PILLS[id] || [];
  document.getElementById('node-skills').innerHTML = pills.map(s => `<span class="pill bridge">${s} ⟶</span>`).join('');
  // Narrative — explicitly cohort-anchored, no predictive verbs
  const probText = p.prob === '—'
    ? 'This is your current position.'
    : `Within this cohort, <strong>${p.prob}</strong> reached the <strong>${p.label}</strong> role over a median <strong>${p.tenure}</strong>.`;
  const myColText = p.mycol && p.type !== 'current'
    ? ` This role appears on Malaysia's <strong>Critical Occupations List 2024/25</strong> (TalentCorp MyMahir) — a national priority occupation.`
    : '';
  document.getElementById('node-narrative').innerHTML = `
    <strong>📊 Honest Narrative · cohort of ${p.cohort.toLocaleString()}</strong>
    <p style="margin-top:4px;">${probText}${myColText} The salary anchor (<strong>${p.salary}</strong>) is calibrated against DOSM Salaries & Wages Survey 2024 and recruiter guide headline figures.</p>
    <p style="margin-top:6px;font-size:11px;color:var(--text-3);font-style:italic;">Cohort aggregate. Not a prediction of your individual outcome. The LLM never invented these numbers — they come from deterministic aggregation over the retrieved cohort.</p>
  `;
  // Tradeoff callout
  const tradeoff = document.getElementById('node-tradeoff');
  const tradeoffs = {
    sr2:  { title: 'Manager vs IC fork', body: 'Analytics Manager has higher salary ceiling (+15%) but the technical-skill curve flattens; 68% of this cohort report satisfaction vs 74% on the IC track.' },
    sr3:  { title: 'Adjacent path — bridge needed', body: 'ML Engineer is one bridge away from your current shape — typically 6–9 months of upskilling in PyTorch, Kubernetes, and model serving. Smaller cohort (720) means lower-confidence range.' },
    lead1:{ title: 'Higher ceiling, narrower entry', body: 'Head of Data: top decile salary outcome but only 380 in cohort reached it. Median tenure to arrive: 3.8 yrs. Filter by sector before reading the range too tightly.' },
    lead2:{ title: 'Specialist track', body: 'Principal DS is the deep-IC ceiling. Smallest cohort (210) — surface this with caution. Publications and architecture portfolio dominate the bridge requirements.' }
  };
  if (tradeoffs[id]) {
    tradeoff.style.display = 'block';
    tradeoff.innerHTML = `<strong>⚖️ Trade-off · ${tradeoffs[id].title}</strong><p style="margin-top:3px;">${tradeoffs[id].body}</p>`;
  } else { tradeoff.style.display = 'none'; }
}

function adjustShape(el) {
  el.nextElementSibling.textContent = el.value;
  const sliders = document.querySelectorAll('#shape-sliders input[type=range]');
  const keys = ['technical','domain','leadership','analytics','communication'];
  sliders.forEach((s,i) => state.shape[keys[i]] = parseInt(s.value));
}

// ─── M8: TALENT MATCHING ────────────────────────────────────
function renderTalentMatching() {
  const roleInput = document.getElementById('match-role-input')?.value || 'Data Scientist';
  const skillsInput = document.getElementById('match-skills-input')?.value || 'Python, SQL';

  document.getElementById('match-stats').innerHTML = statCards([
    { label: 'Candidate Pool', val: '12,480' },
    { label: 'Shape Matches', val: '4' },
    { label: 'Avg Match Score', val: '86%' },
    { label: 'Retrieval Time', val: '120ms' }
  ]);
  // ESCO preview
  const ep = document.getElementById('match-esco-preview');
  ep.style.display = 'block';
  ep.innerHTML = `<span class="detail-tag">Inverse Retrieval for: ${roleInput}</span><p style="font-size:10px;color:var(--text-2);margin-top:4px;">Role shape embedded → pgvector HNSW search → top candidates ranked by cosine similarity against required skills: ${skillsInput}.</p>`;
  // Results
  const results = document.getElementById('match-results');
  results.innerHTML = TALENT_CANDIDATES.map((c,i) => `
    <div class="detail" style="cursor:pointer;" onclick="openTalentDetail(${i})">
      <div class="detail-header">
        <div><span class="detail-tag">${c.exp} experience${c.flag ? ' · <span style="color:var(--rose);">⚠ '+c.flag.replace('_',' ')+'</span>' : ''}</span><h3 class="detail-heading">${c.name}</h3><span style="font-size:10px;color:var(--text-3);">${c.role}</span></div>
        <div class="match-score" style="font-size:22px;font-weight:800;color:var(--${c.match>=90?'teal':c.match>=80?'yellow':'text-2'});">${c.match}%</div>
      </div>
      <div class="pills" style="margin-top:6px;">${c.skills.map(s=>`<span class="pill acquired">${s}</span>`).join('')}</div>
    </div>
  `).join('');
}

function openTalentDetail(i) {
  const c = TALENT_CANDIDATES[i];
  openModal('talent');
  document.getElementById('modal-title').textContent = c.name + ' — Candidate Detail';
  document.getElementById('modal-body').innerHTML = `
    <div class="detail"><div class="detail-header"><span class="detail-tag">${c.role}</span><h3 class="detail-heading">${c.name}</h3></div>
    <div class="metrics">
      <div class="metric"><span class="metric-label">Match Score</span><span class="metric-val">${c.match}%</span></div>
      <div class="metric"><span class="metric-label">Experience</span><span class="metric-val">${c.exp}</span></div>
      <div class="metric"><span class="metric-label">Shape Similarity</span><span class="metric-val">cosine ${(c.match/100).toFixed(2)}</span></div>
    </div>
    <div style="margin-top:8px;"><span class="detail-tag">Skills</span><div class="pills" style="margin-top:4px;">${c.skills.map(s=>`<span class="pill acquired">${s} ✓</span>`).join('')}</div></div>
    ${c.flag ? `<div class="callout" style="margin-top:8px;border-color:var(--rose);"><strong>⚠️ Flag:</strong> ${c.flag.replace('_',' ')} — cohort patterns suggest monitoring.</div>` : ''}
    </div>
  `;
}

// ─── M11: OUTCOME LOOP ──────────────────────────────────────
function setOutcomeHorizon(h, btn) {
  state.outcomeHorizon = h;
  document.querySelectorAll('#outcome-horizon-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderOutcomeLoop();
}

function renderOutcomeLoop() {
  document.getElementById('outcome-stats').innerHTML = statCards([
    { label: 'Consortium Unis', val: '18' },
    { label: 'Tracked Graduates', val: '28,400' },
    { label: 'Horizon', val: state.outcomeHorizon === 'first' ? '1 Year' : state.outcomeHorizon === 'five' ? '5 Year' : '10 Year' },
    { label: 'Data Freshness', val: '2024 Q4' }
  ]);
  const data = {
    first: [
      { label: 'Software Developer', val: 68 },
      { label: 'Data Analyst', val: 52 },
      { label: 'System Admin', val: 35 },
      { label: 'QA Engineer', val: 28 },
      { label: 'IT Support', val: 22 }
    ],
    five: [
      { label: 'Senior Engineer', val: 45 },
      { label: 'Tech Lead', val: 32 },
      { label: 'Product Manager', val: 25 },
      { label: 'Data Scientist', val: 38 },
      { label: 'Consultant', val: 18 }
    ],
    ten: [
      { label: 'Engineering Manager', val: 28 },
      { label: 'Director', val: 15 },
      { label: 'Architect', val: 22 },
      { label: 'Entrepreneur', val: 12 },
      { label: 'Academic', val: 8 }
    ]
  };
  document.getElementById('outcome-bars').innerHTML = renderBars(data[state.outcomeHorizon], '%', 'var(--violet)');
}

// ─── M6: AI COACH (Chat) ────────────────────────────────────
function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendChat('user', msg);
  // Simulate response
  setTimeout(() => {
    let response = findChatResponse(msg);
    appendChat('bot', response);
  }, 800 + Math.random() * 600);
}

function quickChat(msg) {
  document.getElementById('chat-input').value = msg;
  sendChat();
}

function appendChat(role, text) {
  const box = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.className = 'bubble ' + role;
  div.innerHTML = role === 'bot' ? formatMarkdown(text) : escapeHtml(text);
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function findChatResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('pivot') || lower.includes('transition') && lower.includes('product')) return CHAT_RESPONSES.pivot;
  if (lower.includes('salary') || lower.includes('pay') || lower.includes('compensation')) return CHAT_RESPONSES.salary;
  if (lower.includes('skill') || lower.includes('learn') || lower.includes('machine learning')) return CHAT_RESPONSES.skills;
  if (lower.includes('how long') || lower.includes('timeline') || lower.includes('duration')) return CHAT_RESPONSES.timeline;
  if (lower.includes('trade') || lower.includes('compare') || lower.includes('management') || lower.includes('technical')) return CHAT_RESPONSES.tradeoff;
  return `Based on the Career Twin Engine analysis of 2,840 similar trajectories:\n\nYour query touches on an interesting career consideration. The cohort data suggests varied outcomes depending on individual circumstances.\n\nKey insight: Rather than making predictions, I can show you the **range of outcomes** observed in similar cohorts. Would you like to explore specific paths, salary benchmarks, or skill bridges?\n\n⚠️ *Honest note: All insights are cohort-level aggregates, not individual predictions.*`;
}

// ─── M7: FAIR PAY ────────────────────────────────────────────
function renderFairPay() {
  const salary = parseInt(document.getElementById('pay-salary')?.value || 5500);
  const benchmarks = { se: { p10: 3200, p25: 4500, median: 6200, p75: 8500, p90: 12000 }, da: { p10: 2800, p25: 3800, median: 5200, p75: 7200, p90: 10500 }, pm: { p10: 3500, p25: 5000, median: 7000, p75: 9500, p90: 14000 } };
  const code = document.getElementById('pay-masco')?.value || 'se';
  const b = benchmarks[code];
  const pct = Math.min(100, Math.max(0, ((salary - b.p10) / (b.p90 - b.p10)) * 100));
  document.getElementById('pay-stats').innerHTML = statCards([
    { label: 'Your Salary', val: `RM ${salary.toLocaleString()}` },
    { label: 'Percentile', val: `P${Math.round(pct*0.8+10)}` },
    { label: 'Market Median', val: `RM ${b.median.toLocaleString()}` },
    { label: 'Gap to Median', val: `${salary >= b.median ? '+' : ''}RM ${(salary - b.median).toLocaleString()}` }
  ]);
  document.getElementById('pay-title').textContent = `RM ${salary.toLocaleString()} — Percentile Analysis`;
  document.getElementById('pay-fill').style.width = pct + '%';
  document.getElementById('pay-pointer').style.left = pct + '%';
  const fillColor = salary < b.median ? 'var(--rose)' : salary < b.p75 ? 'var(--yellow)' : 'var(--teal)';
  document.getElementById('pay-fill').style.background = `linear-gradient(90deg, ${fillColor}, ${fillColor})`;
  document.getElementById('pay-metrics').innerHTML = `
    <div class="metric"><span class="metric-label">P10</span><span class="metric-val">RM ${b.p10.toLocaleString()}</span></div>
    <div class="metric"><span class="metric-label">P25</span><span class="metric-val">RM ${b.p25.toLocaleString()}</span></div>
    <div class="metric"><span class="metric-label">Median</span><span class="metric-val">RM ${b.median.toLocaleString()}</span></div>
    <div class="metric"><span class="metric-label">P75</span><span class="metric-val">RM ${b.p75.toLocaleString()}</span></div>
    <div class="metric"><span class="metric-label">P90</span><span class="metric-val">RM ${b.p90.toLocaleString()}</span></div>
  `;
  const verdict = salary < b.p25 ? 'Below Market' : salary < b.median ? 'Approaching Median' : salary < b.p75 ? 'At Market Rate' : 'Above Market';
  document.getElementById('pay-summary').innerHTML = `<strong>Verdict: ${verdict}</strong><p style="margin-top:3px;">Your salary of RM ${salary.toLocaleString()} falls at approximately the <strong>P${Math.round(pct*0.8+10)}</strong> mark for this occupation code and experience level. ${salary < b.median ? 'Consider using this data in your next compensation discussion.' : 'You are competitively positioned within your cohort.'}</p>`;
}

// ─── M9: RETENTION SIGNALS ───────────────────────────────────
function renderRetention() {
  document.getElementById('retention-stats').innerHTML = statCards([
    { label: 'Monitored Teams', val: '4' },
    { label: 'High Risk', val: '1' },
    { label: 'Avg Attrition Score', val: '51.5' },
    { label: 'Total At-Risk', val: '82' }
  ]);
  document.getElementById('retention-list').innerHTML = RETENTION_DATA.map(d => {
    const color = d.risk === 'High' ? 'var(--rose)' : d.risk === 'Medium' ? 'var(--yellow)' : 'var(--teal)';
    return `
    <div class="detail">
      <div class="detail-header">
        <div><span class="detail-tag" style="color:${color};">${d.risk} Risk · Score: ${d.score}/100</span><h3 class="detail-heading">${d.name}</h3></div>
        <div style="font-size:20px;font-weight:800;color:${color};">${d.count}</div>
      </div>
      <div class="pct-track" style="margin:8px 0;"><div class="pct-fill" style="width:${d.score}%;background:${color};"></div></div>
      <div><span class="detail-tag">Attrition Drivers</span><div class="pills" style="margin-top:4px;">${d.drivers.map(dr=>`<span class="pill">${dr}</span>`).join('')}</div></div>
    </div>`;
  }).join('');
}

// ─── M10: ONBOARDING PREDICTOR ───────────────────────────────
function renderOnboarding() {
  const idx = parseInt(document.getElementById('onboard-hire-select')?.value || 0);
  const h = ONBOARD_HIRES[idx];
  document.getElementById('onboard-stats').innerHTML = statCards([
    { label: 'Shape Match', val: h.shapeMatch + '%' },
    { label: 'Predicted ETA', val: h.eta },
    { label: 'Risk Level', val: h.risk },
    { label: 'Similar Onboards', val: h.similar.toString() }
  ]);
  document.getElementById('onboard-bars').innerHTML = renderBars(
    h.interventions.map((inv, i) => ({ label: inv, val: [85, 72, 65][i] || 60 })),
    '% effective', 'var(--teal)'
  );
  document.getElementById('onboard-detail').innerHTML = `
    <div class="detail-header"><span class="detail-tag">Onboarding Profile</span><h3 class="detail-heading">${h.name} — ${h.role}</h3></div>
    <div class="metrics">
      <div class="metric"><span class="metric-label">Shape Match</span><span class="metric-val">${h.shapeMatch}%</span></div>
      <div class="metric"><span class="metric-label">Predicted Ramp</span><span class="metric-val">${h.eta}</span></div>
      <div class="metric"><span class="metric-label">Risk</span><span class="metric-val" style="color:${h.risk==='High'?'var(--rose)':h.risk==='Medium'?'var(--yellow)':'var(--teal)'};">${h.risk}</span></div>
    </div>
  `;
  document.getElementById('onboard-callout').innerHTML = `<strong>Cohort Insight:</strong><p style="margin-top:3px;">Based on ${h.similar} similar onboarding trajectories, the recommended intervention set has a ${h.shapeMatch > 80 ? '78%' : '62%'} success rate for reducing ramp-up time by 30%.</p>`;
}

// ─── M12: CURRICULUM ENGINE ──────────────────────────────────
function renderCurriculum() {
  const progInput = document.getElementById('curr-prog-input')?.value || 'BSc Computer Science';
  const skillsInput = document.getElementById('curr-skills-input')?.value || '';

  document.getElementById('curriculum-stats').innerHTML = statCards([
    { label: 'Skill Gaps Found', val: '12' },
    { label: 'Demand Sources', val: '2,840 roles' },
    { label: 'Curriculum Coverage', val: '68%' },
    { label: 'Implementation Lag', val: '1–2 sem' }
  ]);

  const demandTag = document.getElementById('curr-demand-tag');
  if (demandTag) demandTag.textContent = `Demand Signal vs ${progInput}`;

  const gaps = [
    { label: 'Cloud Infrastructure (AWS/GCP)', val: 82 },
    { label: 'MLOps & Model Deployment', val: 75 },
    { label: 'Data Engineering (Spark/Airflow)', val: 68 },
    { label: 'API Design & Microservices', val: 62 },
    { label: 'DevOps / CI-CD Pipelines', val: 58 },
    { label: 'Product Management Basics', val: 45 }
  ];
  document.getElementById('curriculum-bars').innerHTML = renderBars(gaps, '% demand gap', 'var(--violet)');
}

// ─── M13: READINESS PROFILE ─────────────────────────────────
function renderReadiness() {
  document.getElementById('readiness-stats').innerHTML = statCards([
    { label: 'Tracked Students', val: '4,200' },
    { label: 'Avg Readiness', val: '72%' },
    { label: 'ESCO Coverage', val: '85%' },
    { label: 'Last Refresh', val: '12h ago' }
  ]);
  const capabilities = [
    { label: 'Core Algorithms', val: 92 },
    { label: 'Database Design (SQL)', val: 88 },
    { label: 'Web Development', val: 75 },
    { label: 'REST API Design', val: 62 },
    { label: 'Project Management', val: 48 },
    { label: 'Cloud Infrastructure', val: 35 }
  ];
  document.getElementById('readiness-bars').innerHTML = renderBars(capabilities, '% proficiency', 'var(--violet)');
}

// ─── M14: FEEDBACK & REFLECTION ──────────────────────────────
function renderFeedback() {
  document.getElementById('feedback-stats').innerHTML = statCards([
    { label: 'Total Sessions', val: '1,284' },
    { label: 'Feedback Rate', val: '34%' },
    { label: 'Avg Accuracy', val: '4.2/5' },
    { label: 'Corpus Updates', val: '128' }
  ]);
  const sessions = [
    { date: '2024-12-15', module: 'Path Navigator', rating: 4, note: 'Accurate salary ranges' },
    { date: '2024-12-14', module: 'AI Coach', rating: 5, note: 'Great pivot analysis' },
    { date: '2024-12-13', module: 'Fair Pay', rating: 3, note: 'Outdated Penang data' },
    { date: '2024-12-12', module: 'Talent Match', rating: 4, note: 'Good candidate ranking' }
  ];
  document.getElementById('feedback-sessions').innerHTML = sessions.map(s => `
    <div class="detail" style="padding:8px 10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div><span class="detail-tag">${s.date} · ${s.module}</span><p style="font-size:10px;color:var(--text-2);margin-top:2px;">${s.note}</p></div>
        <div style="color:var(--yellow);font-size:12px;">${'★'.repeat(s.rating)}${'☆'.repeat(5-s.rating)}</div>
      </div>
    </div>
  `).join('');
  document.getElementById('feedback-queue-metrics').innerHTML = `
    <div class="metric"><span class="metric-label">Pending Review</span><span class="metric-val">24</span></div>
    <div class="metric"><span class="metric-label">Approved</span><span class="metric-val">104</span></div>
    <div class="metric"><span class="metric-label">Rejected</span><span class="metric-val">12</span></div>
    <div class="metric"><span class="metric-label">Queue Age</span><span class="metric-val">3.2 days</span></div>
  `;
}

// ─── M15: ANALYTICS ──────────────────────────────────────────
function renderAnalytics() {
  document.getElementById('analytics-stats').innerHTML = statCards([
    { label: 'API Calls (24h)', val: '48,200' },
    { label: 'P95 Latency', val: '245ms' },
    { label: 'Error Rate', val: '0.12%' },
    { label: 'Cache Hit Rate', val: '89%' }
  ]);
  document.getElementById('analytics-latency-bars').innerHTML = renderBars([
    { label: 'Shape Embedding', val: 85 },
    { label: 'pgvector Retrieval', val: 120 },
    { label: 'Gemini Narrative', val: 340 },
    { label: 'DOSM Calibration', val: 45 },
    { label: 'Full Pipeline', val: 520 }
  ], 'ms', 'var(--sky)');
  document.getElementById('analytics-quality-bars').innerHTML = renderBars([
    { label: 'Hallucination Rate', val: 2 },
    { label: 'Citation Coverage', val: 94 },
    { label: 'Freshness Score', val: 87 },
    { label: 'User Satisfaction', val: 91 },
    { label: 'k-Anonymity Compliance', val: 100 }
  ], '%', 'var(--teal)');
}

// ─── M16: SECURITY ───────────────────────────────────────────
function renderSecurity() {
  document.getElementById('security-stats').innerHTML = statCards([
    { label: 'Active Policies', val: '14' },
    { label: 'Consent Records', val: '28,400' },
    { label: 'RLS Rules', val: '9' },
    { label: 'k-Anonymity k=', val: '5' }
  ]);
  const rlsRows = [
    { role: 'Candidate', access: 'Own profile + anonymised cohort', level: 'Row-level' },
    { role: 'Employer', access: 'Consented candidate shapes only', level: 'Row-level + consent' },
    { role: 'University', access: 'Own graduates (anonymised)', level: 'Row-level + k-anon' },
    { role: 'Admin', access: 'Full (audit-logged)', level: 'Superuser' }
  ];
  document.getElementById('security-rls-table').innerHTML = `<table class="sec-table"><thead><tr><th>Role</th><th>Access Scope</th><th>Enforcement</th></tr></thead><tbody>${rlsRows.map(r => `<tr><td>${r.role}</td><td>${r.access}</td><td><span class="pill acquired">${r.level}</span></td></tr>`).join('')}</tbody></table>`;
  const consentFlows = [
    { flow: 'Profile Sharing', status: 'Active', revocable: 'Yes', count: '12,400' },
    { flow: 'Trajectory Contribution', status: 'Active', revocable: 'Yes', count: '28,400' },
    { flow: 'Employer Matching', status: 'Opt-in', revocable: 'Yes', count: '8,200' },
    { flow: 'Research (Anonymised)', status: 'Opt-in', revocable: 'Yes', count: '4,100' }
  ];
  document.getElementById('security-consent-table').innerHTML = `<table class="sec-table"><thead><tr><th>Flow</th><th>Status</th><th>Revocable</th><th>Records</th></tr></thead><tbody>${consentFlows.map(c => `<tr><td>${c.flow}</td><td><span class="pill ${c.status==='Active'?'acquired':''}">${c.status}</span></td><td>${c.revocable}</td><td>${c.count}</td></tr>`).join('')}</tbody></table>`;
}

// ─── ARCHITECTURE SECTIONS ───────────────────────────────────
function renderArchSections() {
  // 3x3 Module Grid — Row 1 Navigation, Row 2 Intelligence, Row 3 Valuation
  // Cols: Candidate | Employer | University
  const grid = document.getElementById('arch-grid');
  if (grid) {
    const order = [
      'path_navigator','talent_matching','outcome_loop',     // Navigation
      'ai_coach','retention_signals','curriculum_engine',     // Intelligence
      'fair_pay','onboarding_predictor','readiness_profile'   // Valuation
    ];
    const colors = { candidate: 'var(--yellow)', employer: 'var(--teal)', university: 'var(--violet)' };
    grid.innerHTML = order.map(k => {
      const m = MODULES[k];
      const c = colors[m.persona];
      return `
        <div class="arch-mod-cell" style="border-left-color:${c};" onclick="switchPersona('${m.persona}');selectModule('${k}');">
          <span class="am-abbr" style="color:${c};">${m.abbr}</span>
          <span class="am-title">${m.title}</span>
          <span class="am-aud">${m.persona}</span>
        </div>`;
    }).join('');
  }
  // Tech Stack
  renderTechStack();
  // Data Sources
  renderDataSources();
  // Execution Flow
  renderExecFlow();
  // Criteria
  renderCriteria();
  // Timeline
  renderTimeline();
}

function renderTechStack() {
  const el = document.getElementById('tech-stack-tables');
  if (!el) return;
  const layers = [
    { name: 'Frontend Layer', color: 'var(--yellow)', rows: [
      { tech: 'Next.js (App Router)', role: 'Application framework', why: 'Fast React-based development with SSR, edge deployment, single hosting target for frontend and backend.' },
      { tech: 'React', role: 'UI rendering and component model', why: 'Industry-standard view layer integrating with Next.js for interactive components.' },
      { tech: 'TypeScript', role: 'Type safety across codebase', why: 'Catches errors at build time, provides documentation through types — critical for multi-module platform under time pressure.' },
      { tech: 'Tailwind CSS', role: 'Utility-first styling system', why: 'Rapid construction of consistent visual language across three audience surfaces.' },
      { tech: 'react-force-graph / React Flow', role: 'Trajectory visualisation', why: 'Directed-graph rendering for Career Path Navigator with reasonable defaults and performance.' },
      { tech: 'Lucide React', role: 'Iconography', why: 'Lightweight, consistent icon set integrating with React and Tailwind.' }
    ]},
    { name: 'Backend & API Layer', color: 'var(--teal)', rows: [
      { tech: 'Next.js API Routes', role: 'Backend service hosting', why: 'Co-located with frontend in single Next.js app, reducing latency and operational complexity.' },
      { tech: 'OpenAPI specification', role: 'API contract definition', why: 'Typed, language-agnostic contract making the engine integrable into Talentbank\'s platform regardless of framework.' },
      { tech: 'Zod', role: 'Input and output validation', why: 'Validates request/response shapes at runtime, enforcing schema discipline the platform requires.' },
      { tech: 'Vercel Edge / Node runtime', role: 'Service execution environment', why: 'Scalable, low-latency execution of API routes with simple deployment.' },
      { tech: 'Sentry (or equivalent)', role: 'Error reporting and tracing', why: 'Captures backend exceptions and surfaces them for triage.' }
    ]},
    { name: 'Data Layer', color: 'var(--violet)', rows: [
      { tech: 'Supabase Postgres', role: 'Primary relational data store', why: 'Managed Postgres with authentication, storage, and row-level security in one coherent platform.' },
      { tech: 'pgvector extension', role: 'Vector similarity search', why: 'Dense vector retrieval inside Postgres, removing the need for a separate vector database at hackathon scale.' },
      { tech: 'HNSW index', role: 'Approximate nearest neighbour', why: 'Production-grade similarity search performance within pgvector.' },
      { tech: 'Row-Level Security policies', role: 'Authorisation enforcement', why: 'Access controls at database layer so authorisation cannot be bypassed at application layer.' },
      { tech: 'Supabase Storage', role: 'File asset storage', why: 'Storage for occasional file assets such as exported reports.' }
    ]},
    { name: 'AI Integration Layer', color: 'var(--sky)', rows: [
      { tech: 'Google Gemini (2.5 Pro / Flash)', role: 'Language model for honest explanation', why: 'Strong analytical writing, multilingual support for Asia, competitive pricing via AI Studio and Vertex AI.' },
      { tech: 'Google text-embedding-004', role: 'Dense vector embedding', why: 'Integrates with Gemini family, supports dimensionality required by pgvector for similarity search.' },
      { tech: 'Google AI Studio / Vertex AI', role: 'Gemini access and orchestration', why: 'AI Studio for development, Vertex AI for production with enterprise controls.' },
      { tech: 'HuggingFace Transformers (local)', role: 'Locally hosted model runtime', why: 'Local inference for privacy, cost, or air-gapped scenarios as alternative to hosted API.' },
      { tech: 'HuggingFace sentence-transformers (bge-m3)', role: 'Local embedding alternative', why: 'Open-weight multilingual embedding for sensitive data paths or fallback.' },
      { tech: 'HuggingFace open-weight LLMs', role: 'Local language model alternative', why: 'Llama, Mistral, Qwen family for operations without external API dependencies.' },
      { tech: 'Provider abstraction layer', role: 'AI provider isolation', why: 'Swap between Google hosted and HuggingFace local without changing calling code.' },
      { tech: 'Prompt template registry', role: 'Prompt management', why: 'Centralised templates with versioning, schemas, and validation criteria across providers.' }
    ]},
    { name: 'Operational Layer', color: 'var(--rose)', rows: [
      { tech: 'Vercel', role: 'Application hosting', why: 'Simple, reliable hosting for Next.js with continuous deployment and public live URL.' },
      { tech: 'GitHub', role: 'Source control and CI', why: 'Hosts codebase and triggers Vercel deployments on main branch updates.' },
      { tech: 'Supabase managed environment', role: 'Database hosting', why: 'Managed Postgres environment with built-in observability.' },
      { tech: 'Structured logging', role: 'Operational observability', why: 'Captures structured events across module interactions and AI invocations.' },
      { tech: 'Documentation site', role: 'Architecture & API docs', why: 'Architecture diagrams, API references, and operational runbooks for integration partners.' }
    ]}
  ];
  el.innerHTML = layers.map(l => `
    <div style="margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="width:8px;height:8px;border-radius:50%;background:${l.color};"></span>
        <span style="font-size:13px;font-weight:700;color:${l.color};">${l.name}</span>
      </div>
      <table class="tech-table">
        <thead><tr><th>Technology</th><th>Role in Development</th><th>Justification</th></tr></thead>
        <tbody>${l.rows.map(r => `<tr><td>${r.tech}</td><td>${r.role}</td><td style="font-size:10px;">${r.why}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  `).join('');
}

function renderDataSources() {
  const el = document.getElementById('data-sources-grid');
  if (!el) return;
  const sources = [
    { name: 'O*NET', desc: 'Occupation taxonomy, skill ratings, career changers matrix', license: 'CC-BY-4.0', icon: '📋' },
    { name: 'ESCO', desc: 'European Skills/Competences/Occupations classification', license: 'CC-BY-4.0', icon: '🇪🇺' },
    { name: 'DOSM Malaysia', desc: 'Salaries & Wages Survey, Labour Force Statistics', license: 'Open Data MY', icon: '🇲🇾' },
    { name: 'Recruiter Guides', desc: 'Michael Page, Hays, Robert Walters headline anchors', license: 'Public Reports', icon: '📊' },
    { name: 'Open Trajectory', desc: 'Anonymised career paths from open datasets', license: 'Various OSS', icon: '🔁' },
    { name: 'Synthetic Pipeline', desc: 'Malaysian-calibrated synthetic corpus (disclosed)', license: 'Internal', icon: '🔬' }
  ];
  el.innerHTML = sources.map(s => `
    <div class="arch-mod" style="text-align:left;">
      <span style="font-size:16px;">${s.icon}</span>
      <span class="arch-mod-name" style="font-size:11px;">${s.name}</span>
      <span style="font-size:9px;color:var(--text-3);line-height:1.4;">${s.desc}</span>
      <span class="pill" style="margin-top:4px;font-size:8px;">${s.license}</span>
    </div>
  `).join('');
}

function renderExecFlow() {
  const el = document.getElementById('exec-flow');
  if (!el) return;
  const steps = [
    { num: 1, title: 'Launch', desc: 'User opens PathWiser' },
    { num: 2, title: 'Onboard', desc: 'Role selection + profile intake' },
    { num: 3, title: 'Normalize', desc: 'ESCO/O*NET standardization' },
    { num: 4, title: 'Embed', desc: 'Shape → 768-dim vector' },
    { num: 5, title: 'Retrieve', desc: 'pgvector HNSW cohort search' },
    { num: 6, title: 'Aggregate', desc: 'Salary/timeline/skill statistics' },
    { num: 7, title: 'Narrate', desc: 'Gemini honest narrative generation' },
    { num: 8, title: 'Validate', desc: 'Hallucination & freshness checks' },
    { num: 9, title: 'Deliver', desc: 'Module-specific UI rendering' },
    { num: 10, title: 'Feedback', desc: 'User feedback → corpus queue' }
  ];
  el.innerHTML = steps.map((s, i) => `
    <div class="exec-step">
      <div class="exec-num">${s.num}</div>
      <div class="exec-info"><span class="exec-title">${s.title}</span><span class="exec-desc">${s.desc}</span></div>
    </div>
    ${i < steps.length - 1 ? '<span class="exec-arrow">→</span>' : ''}
  `).join('');
}

function renderCriteria() {
  const el = document.getElementById('criteria-grid');
  if (!el) return;
  // Criteria pulled verbatim from the Talentbank Tech Hackathon 2026 starter kit (Section 05)
  const criteria = [
    { name: 'Product & UX Thinking', weight: '30%', color: 'var(--yellow)',
      desc: 'Solves a real Career OS problem with clear user understanding and product instinct.',
      items: ['Honest navigation framing on every screen','Branching trajectory visualisation (signature UX)','Cohort size, range, and trade-offs always visible','Three-audience product story (Career Signal Loop)','Shape adjustment loop preserves user agency'] },
    { name: 'System Design & Integration', weight: '25%', color: 'var(--teal)',
      desc: 'Architecture is coherent and the module fits alongside the broader Career OS pattern.',
      items: ['One shared engine, three surfaces — Career Signal Loop','Retrieval / aggregation / explanation separated by design','Single Postgres + pgvector (no premature graph DB)','OpenAPI-documented engine for framework-agnostic integration','Provider abstraction across Gemini + HuggingFace local'] },
    { name: 'Completeness', weight: '20%', color: 'var(--violet)',
      desc: 'Works end-to-end. Directly integrable without significant rework. Live demo URL.',
      items: ['Live URL on Vercel from day 3 of the build','All 9 audience modules end-to-end on seeded data','One-command local setup + seed script + .env.example','OpenAPI spec + README + architecture diagram','Aggregation unit tests + retrieval integration tests'] },
    { name: 'AI Craft', weight: '15%', color: 'var(--sky)',
      desc: 'Quality of AI tool choice, prompt design, and output quality.',
      items: ['Hybrid: embeddings retrieve, aggregation computes, LLM only explains','Structured output schemas + validator that rejects predictive verbs','Prompts shipped in repo with versioning and few-shot examples','Gemini default + HuggingFace local fallback behind one interface','AI build tools (Cursor/Claude) declared on submission'] },
    { name: 'Code Quality', weight: '10%', color: 'var(--rose)',
      desc: 'Naming, structure, documentation, security, basic tests. Reads cleanly to someone who didn\'t write it.',
      items: ['TypeScript end-to-end + Zod schemas at every boundary','Clear module boundaries: engine / api / ui / data','Supabase RLS + secrets in env + rate-limited AI endpoints','Conventional commits + thorough README + data-licensing page','Tests focused on the aggregation math — the part that must not lie'] }
  ];
  el.innerHTML = criteria.map(c => `
    <div class="criteria-card" style="border-color:${c.color};">
      <div class="criteria-card-head">
        <span class="criteria-name" style="color:${c.color};">${c.name}</span>
        <span class="criteria-weight" style="color:${c.color};">${c.weight}</span>
      </div>
      <p class="criteria-desc">${c.desc}</p>
      <div class="criteria-items">${c.items.map(it=>`<span class="criteria-item">✓ ${it}</span>`).join('')}</div>
    </div>
  `).join('');
}

function renderTimeline() {
  const el = document.getElementById('timeline-bar');
  if (!el) return;
  const phases = [
    { name: 'Foundation', days: 'D1–5', pct: 18, color: 'var(--yellow)', items: 'Repository, Next.js scaffold, Supabase project, taxonomies loaded, schema migrated, live URL established' },
    { name: 'Engine v1', days: 'D6–10', pct: 18, color: 'var(--teal)', items: 'Synthetic corpus, embeddings, retrieval, aggregation, basic explanation, first checkpoint submitted' },
    { name: 'Candidate Surface', days: 'D11–17', pct: 25, color: 'var(--violet)', items: 'Navigator with branching visualisation, AI Career Coach, Fair Pay Engine' },
    { name: 'Employer & University', days: 'D18–20', pct: 11, color: 'var(--sky)', items: 'All six remaining audience modules, authentication, second checkpoint submitted' },
    { name: 'Hardening', days: 'D21–25', pct: 18, color: 'var(--amber)', items: 'Tests, documentation, OpenAPI, security audit, demo dataset' },
    { name: 'Polish', days: 'D26–28', pct: 10, color: 'var(--rose)', items: 'Performance, edge cases, demo script, final checkpoint submitted' }
  ];
  el.innerHTML = `
    <div style="display:flex;height:32px;border-radius:8px;overflow:hidden;margin-bottom:10px;">
      ${phases.map(p => `<div style="flex:${p.pct};background:${p.color};display:flex;align-items:center;justify-content:center;"><span style="font-size:8px;font-weight:700;color:var(--bg-base);white-space:nowrap;">${p.days}</span></div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
      ${phases.map(p => `<div style="padding:10px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--r-sm);"><span style="font-size:11px;font-weight:700;color:${p.color};">${p.name}</span><span style="display:block;font-family:var(--mono);font-size:8px;color:var(--text-3);margin:2px 0;">${p.days}</span><span style="display:block;font-size:9px;color:var(--text-2);line-height:1.4;">${p.items}</span></div>`).join('')}
    </div>
  `;
}

// ─── MODALS ──────────────────────────────────────────────────
function openModal(type) {
  document.getElementById('modal-overlay').classList.add('active');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  switch(type) {
    case 'onboarding':
      title.textContent = 'Manager Briefing';
      body.innerHTML = `<div class="callout callout-teal"><strong>Generated Briefing</strong><p style="margin-top:4px;">Based on cohort analysis of similar onboarding trajectories, this briefing recommends a structured 6-week ramp plan with weekly check-ins, buddy pairing, and domain immersion sessions.</p></div><div class="detail"><div class="detail-header"><span class="detail-tag">Key Recommendations</span></div><div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;"><span style="font-size:10px;color:var(--text-2);">1. Assign technical buddy from same team for pair programming</span><span style="font-size:10px;color:var(--text-2);">2. Schedule architecture walkthrough in week 1</span><span style="font-size:10px;color:var(--text-2);">3. Set first meaningful contribution target for week 3</span><span style="font-size:10px;color:var(--text-2);">4. Weekly 1:1 with manager focusing on blockers</span><span style="font-size:10px;color:var(--text-2);">5. 30-day retrospective with shape re-assessment</span></div></div>`;
      break;
    case 'curriculum':
      title.textContent = 'Syllabus Recommendations';
      body.innerHTML = `<div class="callout callout-violet"><strong>Demand-Driven Curriculum Update</strong><p style="margin-top:4px;">Based on employer demand signals from 2,840 recent role postings cross-referenced against current university curricula.</p></div><div class="detail"><div class="detail-header"><span class="detail-tag">Proposed New Modules</span></div><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px;"><div style="display:flex;gap:8px;align-items:start;"><span class="pill bridge" style="white-space:nowrap;">Priority 1</span><div><span style="font-size:11px;font-weight:600;color:var(--text-1);">Cloud Infrastructure Fundamentals</span><span style="display:block;font-size:9px;color:var(--text-3);margin-top:1px;">AWS/GCP core services, IaC basics — 82% employer demand</span></div></div><div style="display:flex;gap:8px;align-items:start;"><span class="pill bridge" style="white-space:nowrap;">Priority 2</span><div><span style="font-size:11px;font-weight:600;color:var(--text-1);">MLOps & Model Deployment</span><span style="display:block;font-size:9px;color:var(--text-3);margin-top:1px;">Model serving, monitoring, CI/CD for ML — 75% employer demand</span></div></div><div style="display:flex;gap:8px;align-items:start;"><span class="pill bridge" style="white-space:nowrap;">Priority 3</span><div><span style="font-size:11px;font-weight:600;color:var(--text-1);">Data Engineering Pipelines</span><span style="display:block;font-size:9px;color:var(--text-3);margin-top:1px;">Spark, Airflow, ETL design patterns — 68% employer demand</span></div></div></div></div>`;
      break;
    case 'readiness':
      title.textContent = 'Capability Dossier';
      body.innerHTML = `<div class="callout callout-violet"><strong>Alumni Capability Snapshot</strong><p style="margin-top:4px;">Dynamic, continuously-updated profile replacing the static degree certificate. Shared with employer consent.</p></div><div class="detail"><div class="detail-header"><span class="detail-tag">Ahmad Syamil · BSc Computer Science (AI/DS)</span><h3 class="detail-heading">Capability Vector</h3></div><div class="metrics"><div class="metric"><span class="metric-label">Overall Readiness</span><span class="metric-val">72%</span></div><div class="metric"><span class="metric-label">ESCO Coverage</span><span class="metric-val">85%</span></div><div class="metric"><span class="metric-label">Employer Match</span><span class="metric-val">68%</span></div></div><div style="margin-top:8px;"><span class="detail-tag">Capability Breakdown</span><div class="pills" style="margin-top:4px;"><span class="pill acquired">Algorithms ✓</span><span class="pill acquired">SQL ✓</span><span class="pill acquired">Python ✓</span><span class="pill bridge">APIs ⟶</span><span class="pill bridge">Cloud ⟶</span><span class="pill gap">DevOps ✗</span></div></div></div>`;
      break;
    default:
      title.textContent = 'Detail';
      body.innerHTML = '<p>Detail view</p>';
  }
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }

function openFeedbackModal() {
  document.getElementById('feedback-overlay').classList.add('active');
  renderStarRatings();
}
function closeFeedbackModal() { document.getElementById('feedback-overlay').classList.remove('active'); }

function renderStarRatings() {
  ['fb-accuracy','fb-freshness'].forEach(id => {
    const el = document.getElementById(id);
    if (!el || el.dataset.init) return;
    el.dataset.init = '1';
    let html = '';
    for (let i=1;i<=5;i++) html += `<span class="star" data-rating="${i}" onclick="setRating('${id}',${i})" style="cursor:pointer;font-size:18px;color:var(--text-3);">★</span>`;
    el.innerHTML = html;
  });
}

function setRating(id, val) {
  document.querySelectorAll(`#${id} .star`).forEach(s => {
    s.style.color = parseInt(s.dataset.rating) <= val ? 'var(--yellow)' : 'var(--text-3)';
  });
}

function submitFeedback() {
  closeFeedbackModal();
  // Flash confirmation
  const fab = document.querySelector('.feedback-fab');
  fab.textContent = '✅';
  setTimeout(() => fab.textContent = '📝', 2000);
}

// ─── DEMO TOUR ───────────────────────────────────────────────
const TOUR_STEPS = [
  {
    title: '🎬 Welcome — the 90-second tour',
    body: 'PathWiser is a Career OS navigation platform. One engine. Three audiences. Honest framing — never prediction. This tour shows you the whole picture in 10 stops.',
    persona: null, module: null
  },
  {
    title: '🏗️ The whole vision in one screen',
    body: 'The Architecture & Vision view lays out the Career Signal Loop, the 9-module map, the 10-step pipeline, the competitive differentiation, the tech stack, and the 28-day build plan. This is the screen to land judges on first.',
    persona: 'candidate', module: 'architecture'
  },
  {
    title: '🌐 Career Path Navigator — the signature visualisation',
    body: 'The branching trajectory landscape. Each node is a destination; node size = probability mass, colour = primary vs adjacent. Cohort size and salary range are surfaced on every selection — never a single predicted destination.',
    persona: 'candidate', module: 'path_navigator'
  },
  {
    title: '🔬 Inside the Engine — Retrieval',
    body: 'The pgvector HNSW similarity search runs over the trajectory corpus. Click "Run Vector Search" to see the embedding match top-K nearest neighbours. The numbers in the next step come from this cohort — never from the LLM.',
    persona: 'candidate', module: 'trajectory_retrieval'
  },
  {
    title: '📊 Deterministic Aggregation',
    body: 'Salary percentiles, time-in-role, skill bridges are computed deterministically over the retrieved cohort. This is the part of the system that must not lie. Unit tests cover this math. The LLM never invents a number here.',
    persona: 'candidate', module: 'outcomes_aggregation'
  },
  {
    title: '✍️ Honest Narrative — the LLM only explains',
    body: 'Structured aggregates go in. A hedged narrative comes out, with cohort size and range disclosed in every sentence. A validator rejects predictive verbs ("you will"). The LLM has no mechanism to invent claims about an individual.',
    persona: 'candidate', module: 'ai_explanation'
  },
  {
    title: '🏢 Switching seats — Employer surface',
    body: 'Same engine, different framing. Smart Talent Matching does inverse retrieval — the role becomes the query, candidates whose trajectory shape fits the inflow are surfaced. Adjacent candidates (one bridge away) are explicitly called out.',
    persona: 'employer', module: 'talent_matching'
  },
  {
    title: '🎓 University surface — closing the loop',
    body: 'Lifelong Outcome Loop tracks where programme graduates actually land over years and decades — not just the first job. Outcome signal feeds back into the Future-State Curriculum Engine. This is the loop the brief asks for, structural.',
    persona: 'university', module: 'outcome_loop'
  },
  {
    title: '🛡️ Built for honesty, not just framed as such',
    body: 'Row-level security in Postgres. Consent flows for sensitive operations. k-anonymity enforced before any aggregation surfaces. Every output discloses cohort size. Honest framing is architectural, not a disclaimer slapped on top.',
    persona: 'employer', module: 'security'
  },
  {
    title: '🚀 Production-ready, integrable, alive in 28 days',
    body: 'Next.js + Supabase (pgvector) + Google Gemini + HuggingFace local fallback. Vercel deploy from day 3. OpenAPI surface for direct integration into Talentbank\'s Angular stack. You\'ve seen the prototype — the production build follows the same shape.',
    persona: 'candidate', module: 'architecture'
  }
];

let tourIndex = 0;

function startTour() {
  // Demo tour shows all three audiences — auto-enable judge mode.
  setJudgeMode(true);
  // If still on hero, jump into dashboard first
  if (document.getElementById('hero-section').style.display !== 'none') {
    quickLaunch('candidate');
    setJudgeMode(true); // quickLaunch defaults to locked; re-enable for tour
    setTimeout(() => { tourIndex = 0; showTourStep(); }, 300);
    return;
  }
  tourIndex = 0;
  showTourStep();
}

function showTourStep() {
  const step = TOUR_STEPS[tourIndex];
  if (!step) { endTour(); return; }
  // Apply persona + module navigation if specified
  if (step.persona && step.persona !== state.persona) switchPersona(step.persona);
  if (step.module) selectModule(step.module);
  // Update card content
  document.getElementById('tour-step-label').textContent = `Step ${tourIndex + 1} of ${TOUR_STEPS.length}`;
  document.getElementById('tour-step-title').textContent = step.title;
  document.getElementById('tour-step-body').textContent = step.body;
  // Progress dots
  let dots = '';
  for (let i = 0; i < TOUR_STEPS.length; i++) {
    const cls = i === tourIndex ? 'active' : (i < tourIndex ? 'done' : '');
    dots += `<span class="tour-progress-dot ${cls}"></span>`;
  }
  document.getElementById('tour-progress').innerHTML = dots;
  // Button labels
  document.getElementById('tour-prev-btn').style.display = tourIndex === 0 ? 'none' : 'inline-flex';
  const nextBtn = document.getElementById('tour-next-btn');
  if (tourIndex === 0) nextBtn.textContent = 'Begin →';
  else if (tourIndex === TOUR_STEPS.length - 1) nextBtn.textContent = 'Finish ✓';
  else nextBtn.textContent = 'Next →';
  // Show overlay
  document.getElementById('tour-spotlight').classList.add('active');
}

function tourNext() {
  if (tourIndex >= TOUR_STEPS.length - 1) { endTour(); return; }
  tourIndex++;
  showTourStep();
}

function tourPrev() {
  if (tourIndex <= 0) return;
  tourIndex--;
  showTourStep();
}

function endTour() {
  document.getElementById('tour-spotlight').classList.remove('active');
  tourIndex = 0;
}

// Tour keyboard shortcuts (← / →)
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('tour-spotlight')?.classList.contains('active')) return;
  if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); tourNext(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); tourPrev(); }
  else if (e.key === 'Escape') { e.preventDefault(); endTour(); }
});

// ─── UTILITIES ───────────────────────────────────────────────
function statCards(items) {
  return items.map(i => `<div class="stat-card"><span class="stat-label">${i.label}</span><span class="stat-val">${i.val}</span></div>`).join('');
}

function renderBars(data, unit, color) {
  const max = Math.max(...data.map(d => d.val), 1);
  return data.map(d => `
    <div class="bar-row">
      <span class="bar-label">${d.label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(d.val/max)*100}%;background:${color};"></div></div>
      <span class="bar-val">${d.val}${unit ? ' ' + unit : ''}</span>
    </div>
  `).join('');
}

function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      return '<div style="display:flex;gap:12px;font-size:10px;color:var(--text-2);">' + cells.map(c => `<span style="flex:1;">${c.trim()}</span>`).join('') + '</div>';
    });
}

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
});
