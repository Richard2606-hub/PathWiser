import fs from 'node:fs';
import path from 'node:path';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const targetUrl = (process.env.PATHWISER_BASE_URL || '').replace(/\/$/, '');
const strict = process.env.RELEASE_PREFLIGHT_STRICT === 'true';
const expectedMigrations = [
  '0001_init.sql',
  '0002_community_production.sql',
  '0003_durable_workflows.sql',
  '0004_production_controls.sql',
  '0005_api_privileges.sql',
  '0006_pgcrypto_digest_schema.sql',
  '0007_final_kit_workspace_records.sql',
];
const requiredForFullLaunch = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'AUTH_MODE',
  'ALLOW_FULL_MODE',
];
const checks = [];

function addCheck(name, passed, details, severity = 'error') {
  checks.push({ name, passed: Boolean(passed), severity, details });
}

function envPresent(name) {
  return Boolean(process.env[name]);
}

const migrationsDirectory = path.join(process.cwd(), 'supabase', 'migrations');
const migrationFiles = fs.existsSync(migrationsDirectory)
  ? fs.readdirSync(migrationsDirectory).filter((filename) => /^\d{4}_.+\.sql$/.test(filename)).sort()
  : [];

addCheck(
  'all expected migrations exist',
  expectedMigrations.every((filename) => migrationFiles.includes(filename)),
  { expected: expectedMigrations, found: migrationFiles }
);
addCheck(
  'latest Final Kit migration is present',
  migrationFiles.at(-1) === '0007_final_kit_workspace_records.sql',
  { latest: migrationFiles.at(-1) || null }
);
addCheck(
  'database migration URL is configured',
  envPresent('DATABASE_URL') || envPresent('SUPABASE_DB_URL'),
  { accepts: ['DATABASE_URL', 'SUPABASE_DB_URL'], present: ['DATABASE_URL', 'SUPABASE_DB_URL'].filter(envPresent) },
  'warning'
);

for (const name of requiredForFullLaunch) {
  addCheck(`env ${name} is configured`, envPresent(name), { present: envPresent(name) }, name.startsWith('NEXT_PUBLIC_') ? 'error' : 'warning');
}

addCheck('production auth is required', process.env.AUTH_MODE === 'required', { AUTH_MODE: process.env.AUTH_MODE || null }, 'warning');
addCheck('full mode is explicitly requested', process.env.ALLOW_FULL_MODE === 'true', { ALLOW_FULL_MODE: process.env.ALLOW_FULL_MODE || null }, 'warning');
addCheck(
  'judge mode is disabled unless explicitly needed',
  process.env.NEXT_PUBLIC_ENABLE_JUDGE_MODE !== 'true',
  { NEXT_PUBLIC_ENABLE_JUDGE_MODE: process.env.NEXT_PUBLIC_ENABLE_JUDGE_MODE || null },
  'warning'
);

if (targetUrl) {
  try {
    const response = await fetch(`${targetUrl}/api/health`, { headers: { 'Cache-Control': 'no-store' } });
    const body = await response.json();
    addCheck('target health endpoint responds', response.ok, { status: response.status, target: `${targetUrl}/api/health` });
    addCheck('target application service is alive', body.services?.application === true, { application: body.services?.application ?? null });
    addCheck(
      'target full-mode launch flags are active',
      body.authentication === 'required' && body.services?.full_mode_requested === true && body.evidence?.mode === 'community',
      {
        authentication: body.authentication,
        full_mode_requested: body.services?.full_mode_requested ?? null,
        evidence_mode: body.evidence?.mode ?? null,
      },
      'warning'
    );
  } catch (error) {
    addCheck('target health endpoint responds', false, { target: `${targetUrl}/api/health`, error: error instanceof Error ? error.message : String(error) });
  }
} else {
  addCheck('target URL provided for remote health preflight', false, { expected_env: 'PATHWISER_BASE_URL' }, 'warning');
}

const errors = checks.filter((check) => !check.passed && check.severity === 'error');
const warnings = checks.filter((check) => !check.passed && check.severity === 'warning');

console.log(JSON.stringify({
  passed: errors.length === 0 && (!strict || warnings.length === 0),
  ready_for_real_community_launch: errors.length === 0 && warnings.length === 0,
  strict,
  errors: errors.length,
  warnings: warnings.length,
  note: warnings.length
    ? strict
      ? 'Strict mode treats warnings as release-blocking go/no-go failures.'
      : 'Warnings identify owner-controlled launch gates that may be acceptable for preview but not for real community launch.'
    : 'No preflight warnings detected.',
  checks,
}, null, 2));

if (errors.length || (strict && warnings.length)) process.exit(1);
