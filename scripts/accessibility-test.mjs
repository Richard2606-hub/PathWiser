import axe from 'axe-core';
import { JSDOM } from 'jsdom';

const baseUrl = (process.env.PATHWISER_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const routes = [
  '/',
  '/auth',
  '/auth/update-password',
  '/dashboard/candidate/path-navigator',
  '/dashboard/candidate/ai-coach',
  '/dashboard/candidate/fair-pay',
  '/dashboard/employer/talent-matching',
  '/dashboard/employer/retention-signals',
  '/dashboard/employer/onboarding-predictor',
  '/dashboard/university/outcome-loop',
  '/dashboard/university/curriculum-engine',
  '/dashboard/university/readiness-profile',
  '/dashboard/marketplace/jobs',
  '/dashboard/marketplace/companies',
  '/dashboard/support/feedback',
  '/dashboard/support/security',
];

const failures = [];
let rulesChecked = 0;

for (const route of routes) {
  const response = await fetch(`${baseUrl}${route}`);
  if (!response.ok) {
    failures.push({ route, rule: 'http-status', impact: 'critical', summary: `HTTP ${response.status}` });
    continue;
  }

  const html = await response.text();
  const dom = new JSDOM(html, {
    url: `${baseUrl}${route}`,
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  dom.window.eval(axe.source);
  const result = await dom.window.axe.run(dom.window.document, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    },
    rules: {
      // JSDOM has no layout/paint engine, so contrast requires the separate
      // rendered visual review rather than this semantic automation.
      'color-contrast': { enabled: false },
    },
  });
  rulesChecked = Math.max(rulesChecked, result.passes.length + result.violations.length + result.incomplete.length);

  for (const violation of result.violations) {
    failures.push({
      route,
      rule: violation.id,
      impact: violation.impact,
      summary: violation.help,
      targets: violation.nodes.map((node) => node.target.join(' ')).slice(0, 5),
    });
  }
  dom.window.close();
}

if (failures.length > 0) {
  console.error(JSON.stringify({ passed: false, routes: routes.length, rules_checked: rulesChecked, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  passed: true,
  routes: routes.length,
  rules_checked: rulesChecked,
  standard: 'WCAG 2.0/2.1/2.2 A and AA semantic rules',
  note: 'Colour contrast and responsive touch behaviour are covered by rendered-browser review.',
}, null, 2));
