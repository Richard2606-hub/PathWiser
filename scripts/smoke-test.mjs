const baseUrl = (process.env.PATHWISER_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const testClient = `smoke-${crypto.randomUUID()}`;

const pageRoutes = [
  '/',
  '/auth',
  '/auth/update-password',
  '/dashboard',
  '/dashboard/architecture',
  '/dashboard/candidate/path-navigator',
  '/dashboard/candidate/ai-coach',
  '/dashboard/candidate/fair-pay',
  '/dashboard/employer/talent-matching',
  '/dashboard/employer/retention-signals',
  '/dashboard/employer/onboarding-predictor',
  '/dashboard/university/outcome-loop',
  '/dashboard/university/curriculum-engine',
  '/dashboard/university/readiness-profile',
  '/dashboard/engine/user-profile',
  '/dashboard/engine/trajectory-retrieval',
  '/dashboard/engine/outcomes-aggregation',
  '/dashboard/engine/ai-explanation',
  '/dashboard/marketplace/jobs',
  '/dashboard/marketplace/companies',
  '/dashboard/support/feedback',
  '/dashboard/support/analytics',
  '/dashboard/support/security',
];

const shape = {
  userId: 'smoke-test',
  persona: 'candidate',
  role: 'Junior Data Analyst',
  education: 'BSc Computer Science',
  years_experience: 3,
  state: 'Kuala Lumpur',
  skills: ['SQL', 'Python', 'Tableau'],
  life_stage: 'early_career',
};

const results = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const started = Date.now();
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: 'follow',
    ...options,
    headers: { 'X-Forwarded-For': testClient, ...(options.headers || {}) },
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();
  results.push({ path, status: response.status, duration_ms: Date.now() - started });
  return { response, body };
}

for (const path of pageRoutes) {
  const { response, body } = await request(path);
  assert(response.ok, `${path} returned ${response.status}`);
  assert(typeof body === 'string' && body.includes('PathWiser'), `${path} did not render the PathWiser shell`);
  assert(response.headers.get('x-content-type-options') === 'nosniff', `${path} omitted nosniff protection`);
  assert(response.headers.get('x-frame-options') === 'DENY', `${path} omitted clickjacking protection`);
  const csp = response.headers.get('content-security-policy') || '';
  assert(csp.includes("frame-ancestors 'none'"), `${path} CSP did not deny framing`);
  assert(!csp.includes("'unsafe-eval'"), `${path} production CSP allowed unsafe-eval`);
}

const health = await request('/api/health');
assert([200, 503].includes(health.response.status), 'Health endpoint returned an unexpected status');
assert(health.body.services?.application === true, 'Health endpoint did not report the application service');

const callbackSafety = await request('/auth/callback?next=https://attacker.invalid');
assert(new URL(callbackSafety.response.url).origin === baseUrl, 'Authentication callback allowed an external redirect');
assert(callbackSafety.response.url.includes('/auth?error='), 'Authentication callback did not reject a missing confirmation code');

const jobs = await request('/api/marketplace/jobs');
assert(jobs.response.ok && Array.isArray(jobs.body.jobs) && jobs.body.jobs.length > 0, 'Job marketplace did not return usable listings');
assert(['community-marketplace', 'modelled-marketplace'].includes(jobs.body.data_scope), 'Job marketplace omitted its data scope');

const companies = await request('/api/marketplace/companies');
assert(companies.response.ok && Array.isArray(companies.body.companies) && companies.body.companies.length > 0, 'Company directory did not return usable profiles');
assert(['community-marketplace', 'modelled-marketplace'].includes(companies.body.data_scope), 'Company directory omitted its data scope');

const navigate = await request('/api/engine/navigate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: baseUrl },
  body: JSON.stringify({ shape, currentStepIndex: 0 }),
});
assert(navigate.response.ok, `Engine navigation returned ${navigate.response.status}`);
assert(navigate.body.cohort_too_small || navigate.body.aggregate?.cohort_size >= 50, 'Engine returned neither a safe cohort gate nor an aggregate');
if (navigate.body.explanation) {
  assert(navigate.body.explanation.passed_validation === true, 'Engine delivered an unvalidated explanation');
  assert(navigate.body.explanation.narrative.includes('cohort'), 'Explanation omitted cohort framing');
}

const coach = await request('/api/engine/coach', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: baseUrl },
  body: JSON.stringify({ shape, message: 'What evidence should I review before choosing a data science path?' }),
});
assert(coach.response.ok && typeof coach.body.reply === 'string', 'AI coach did not return a usable response');
assert(coach.body.evidence?.mode, 'AI coach omitted evidence provenance');

const talent = await request('/api/talent/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: baseUrl },
  body: JSON.stringify({ role: 'Data Scientist', skills: ['Python', 'SQL'], state: 'Kuala Lumpur', include_adjacent: true }),
});
assert(talent.response.ok && Array.isArray(talent.body.candidates), 'Talent matching did not return an explainable candidate list');
assert(talent.body.data_scope, 'Talent matching omitted its consent/data scope');

for (const audienceShape of [
  { ...shape, userId: 'smoke-employer', persona: 'employer', role: 'Hiring Lead', skills: ['Talent Strategy', 'People Operations'], years_experience: 10, life_stage: 'mid_career' },
  { ...shape, userId: 'smoke-university', persona: 'university', role: 'Programme Director', skills: ['Curriculum Design', 'Programme Governance'], years_experience: 18, life_stage: 'senior_career' },
]) {
  const audienceEngine = await request('/api/engine/navigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl },
    body: JSON.stringify({ shape: audienceShape, currentStepIndex: 0 }),
  });
  assert(audienceEngine.response.ok, `${audienceShape.persona} engine call failed`);
  assert(audienceEngine.body.cohort_too_small || audienceEngine.body.explanation?.passed_validation === true, `${audienceShape.persona} engine output was not safely gated`);
}

const feedback = await request('/api/feedback');
assert(feedback.response.ok && Array.isArray(feedback.body.feedback), 'Feedback history did not return a safe account-or-device response');

const invalidNavigate = await request('/api/engine/navigate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: baseUrl },
  body: JSON.stringify({ shape: { ...shape, role: '' } }),
});
assert(invalidNavigate.response.status === 400, 'Invalid engine input was not rejected');

const crossOrigin = await request('/api/engine/navigate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.invalid' },
  body: JSON.stringify({ shape }),
});
assert(crossOrigin.response.status === 403, 'Cross-origin mutation was not rejected');

const malformedOrigin = await request('/api/engine/navigate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'not a url' },
  body: JSON.stringify({ shape }),
});
assert(malformedOrigin.response.status === 403, 'Malformed Origin header was not rejected');

for (const path of ['/api/profile', '/api/consent', '/api/records', '/api/marketplace/saved', '/api/account']) {
  const result = await request(path);
  assert([401, 503].includes(result.response.status), `${path} exposed account data without a session`);
}

const unconfirmedDeletion = await request('/api/account', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json', Origin: baseUrl },
  body: JSON.stringify({ confirmation: 'delete' }),
});
assert(unconfirmedDeletion.response.status === 400, 'Account deletion accepted an invalid confirmation phrase');

const crossOriginDeletion = await request('/api/account', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.invalid' },
  body: JSON.stringify({ confirmation: 'DELETE MY PATHWISER ACCOUNT' }),
});
assert(crossOriginDeletion.response.status === 403, 'Cross-origin account deletion was not rejected');

const retention = await request('/api/operations/retention', { method: 'POST' });
assert([401, 503].includes(retention.response.status), 'Retention operation ran without scheduler authentication');

const slowest = [...results].sort((a, b) => b.duration_ms - a.duration_ms).slice(0, 5);
console.log(JSON.stringify({
  passed: results.length,
  base_url: baseUrl,
  slowest,
  evidence_scope: {
    jobs: jobs.body.data_scope,
    companies: companies.body.data_scope,
    engine: navigate.body.evidence?.mode,
  },
}, null, 2));
