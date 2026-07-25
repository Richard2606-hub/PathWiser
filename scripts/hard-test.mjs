import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const baseUrl = (process.env.PATHWISER_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const configuredIterations = Number.parseInt(process.env.HARD_TEST_ITERATIONS || '', 10);
const configuredMinutes = Number.parseFloat(process.env.HARD_TEST_MINUTES || '');
const a11yEvery = Math.max(1, Number.parseInt(process.env.HARD_TEST_A11Y_EVERY || '1', 10) || 1);
const maxIterations = Number.isFinite(configuredIterations) && configuredIterations > 0 ? configuredIterations : 3;
const deadline = Number.isFinite(configuredMinutes) && configuredMinutes > 0
  ? Date.now() + configuredMinutes * 60_000
  : null;

const results = [];

function runCheck(label, script) {
  const started = Date.now();
  const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : npmCommand;
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `${npmCommand} run ${script}`]
    : ['run', script];
  const child = spawnSync(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, PATHWISER_BASE_URL: baseUrl },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const result = {
    label,
    script,
    status: child.status,
    duration_ms: Date.now() - started,
  };
  results.push(result);

  if (child.error) {
    throw child.error;
  }
  if (child.status !== 0) {
    process.stderr.write(child.stdout || '');
    process.stderr.write(child.stderr || '');
    throw new Error(`${label} failed with exit code ${child.status ?? 'unknown'}`);
  }
  return result;
}

let iteration = 0;
try {
  do {
    iteration += 1;
    console.info(`hard-test iteration ${iteration} against ${baseUrl}`);
    runCheck(`iteration ${iteration} smoke`, 'test:smoke');
    if (iteration % a11yEvery === 0) {
      runCheck(`iteration ${iteration} accessibility`, 'test:a11y');
    }
  } while (deadline ? Date.now() < deadline : iteration < maxIterations);

  console.log(JSON.stringify({
    passed: true,
    base_url: baseUrl,
    iterations: iteration,
    checks: results.length,
    total_duration_ms: results.reduce((sum, item) => sum + item.duration_ms, 0),
    note: 'For the requested two-hour soak, run with HARD_TEST_MINUTES=120 against the target deployment.',
    results,
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    passed: false,
    base_url: baseUrl,
    iterations: iteration,
    checks_completed: results.length,
    error: error instanceof Error ? error.message : String(error),
    results,
  }, null, 2));
  process.exit(1);
}
