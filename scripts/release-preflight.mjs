import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const targetUrl = (process.env.PATHWISER_BASE_URL || '').replace(/\/$/, '');
const strict = process.env.RELEASE_PREFLIGHT_STRICT === 'true';
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
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

function checksumFor(filename) {
  const migrationPath = path.join(migrationsDirectory, filename);
  return crypto.createHash('sha256').update(fs.readFileSync(migrationPath, 'utf8')).digest('hex');
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
  Boolean(dbUrl),
  { accepts: ['DATABASE_URL', 'SUPABASE_DB_URL'], present: ['DATABASE_URL', 'SUPABASE_DB_URL'].filter(envPresent) },
  'warning'
);

if (dbUrl) {
  const { default: postgres } = await import('postgres');
  const sql = postgres(dbUrl, {
    ssl: 'require',
    max: 1,
    idle_timeout: 10,
    connect_timeout: 20,
  });
  try {
    const appliedRows = await sql`
      select filename, checksum
      from public.pathwiser_schema_migrations
    `;
    const applied = new Map(appliedRows.map((row) => [row.filename, row.checksum]));
    const missing = expectedMigrations.filter((filename) => !applied.has(filename));
    const changed = expectedMigrations.filter((filename) => applied.has(filename) && applied.get(filename) !== checksumFor(filename));

    addCheck('database migration table is reachable', true, { checked: true });
    addCheck('all expected migrations are applied', missing.length === 0, { missing }, 'warning');
    addCheck('applied migration checksums match source', changed.length === 0, { changed }, 'error');
    addCheck('Final Kit migration 0007 is applied', applied.has('0007_final_kit_workspace_records.sql'), { applied: applied.has('0007_final_kit_workspace_records.sql') }, 'warning');
  } catch (error) {
    addCheck('database migration table is reachable', false, { error: error instanceof Error ? error.message : String(error) }, 'warning');
  } finally {
    await sql.end();
  }
} else {
  addCheck('database migration application is verified', false, { reason: 'No DATABASE_URL or SUPABASE_DB_URL available for non-secret checksum verification.' }, 'warning');
}

for (const name of requiredForFullLaunch) {
  addCheck(`env ${name} is configured`, envPresent(name), { present: envPresent(name) }, 'warning');
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
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    let body = null;
    let parseError = null;
    if (contentType.includes('application/json')) {
      try {
        body = JSON.parse(text);
      } catch (error) {
        parseError = error instanceof Error ? error.message : String(error);
      }
    }
    addCheck(
      'target health endpoint responds with JSON',
      Boolean(body),
      {
        status: response.status,
        target: `${targetUrl}/api/health`,
        content_type: contentType || null,
        parse_error: parseError,
        non_json_excerpt: body ? null : text.slice(0, 120),
      }
    );
    addCheck('target health status is ready', response.ok, { status: response.status }, 'warning');
    addCheck('target application service is alive', body?.services?.application === true, { application: body?.services?.application ?? null });
    addCheck(
      'target full-mode launch flags are active',
      body?.authentication === 'required' && body?.services?.full_mode_requested === true && body?.evidence?.mode === 'community',
      {
        authentication: body?.authentication ?? null,
        full_mode_requested: body?.services?.full_mode_requested ?? null,
        evidence_mode: body?.evidence?.mode ?? null,
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
