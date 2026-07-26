/**
 * Seed three ready-to-demo accounts (candidate / employer / university), each
 * with a complete profile so login lands directly in a working workspace — no
 * onboarding, no empty-profile error.
 *
 * Idempotent: re-running updates the password + profile instead of failing.
 *
 * Requires (read from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run:  npx tsx scripts/seed-demo-accounts.ts
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// ── Load .env.local without adding a dependency ─────────────────────────────
function loadEnvLocal() {
  try {
    const raw = readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local optional if the vars are already exported
  }
}
loadEnvLocal();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD || 'PathWiserDemo!2026';

if (!URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (checked env + .env.local).');
  process.exit(1);
}

const admin = createClient(URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

interface DemoAccount {
  email: string;
  persona: 'candidate' | 'employer' | 'university';
  display_name: string;
  profile: {
    role_title: string;
    education: string;
    years_experience: number;
    state: string;
    skills: string[];
    life_stage: 'student' | 'young_adult' | 'early_career' | 'mid_career' | 'senior_career' | 'executive';
  };
}

const ACCOUNTS: DemoAccount[] = [
  {
    email: 'demo.candidate@pathwiser.app',
    persona: 'candidate',
    display_name: 'Aisyah binti Rahman',
    profile: {
      role_title: 'Junior Data Analyst',
      education: "Bachelor's in Computer Science",
      years_experience: 3,
      state: 'Kuala Lumpur',
      skills: ['SQL', 'Excel', 'Python basics', 'Tableau'],
      life_stage: 'early_career',
    },
  },
  {
    email: 'demo.employer@pathwiser.app',
    persona: 'employer',
    display_name: 'BoldRise Sdn Bhd',
    profile: {
      role_title: 'Data Scientist',
      education: 'N/A',
      years_experience: 5,
      state: 'Kuala Lumpur',
      skills: ['Python', 'ML', 'SQL', 'A/B Testing'],
      life_stage: 'mid_career',
    },
  },
  {
    email: 'demo.university@pathwiser.app',
    persona: 'university',
    display_name: 'Universiti Teknologi Malaysia',
    profile: {
      role_title: 'BSc Computer Science (AI/DS)',
      education: 'N/A',
      years_experience: 3,
      state: 'Kuala Lumpur',
      skills: ['Python', 'SQL', 'Algorithms'],
      life_stage: 'early_career',
    },
  },
];

async function findUserByEmail(email: string): Promise<string | undefined> {
  // listUsers is paginated; the demo project is small so one page suffices.
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return undefined;
}

async function upsertAccount(acc: DemoAccount) {
  const metadata = { display_name: acc.display_name, persona: acc.persona, role_title: acc.profile.role_title };
  let userId = await findUserByEmail(acc.email);

  if (userId) {
    await admin.auth.admin.updateUserById(userId, { password: PASSWORD, email_confirm: true, user_metadata: metadata });
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: acc.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) throw error;
    userId = data.user.id;
  }

  const { error: profileError } = await admin.from('user_shapes').upsert({
    user_id: userId,
    persona: acc.persona,
    role_title: acc.profile.role_title,
    education: acc.profile.education,
    years_experience: acc.profile.years_experience,
    state: acc.profile.state,
    skills: acc.profile.skills,
    life_stage: acc.profile.life_stage,
    display_name: acc.display_name,
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw profileError;

  return userId;
}

async function main() {
  console.log('Seeding demo accounts…\n');
  for (const acc of ACCOUNTS) {
    try {
      const id = await upsertAccount(acc);
      console.log(`  ✓ ${acc.persona.padEnd(10)} ${acc.email}  (${id.slice(0, 8)}…)`);
    } catch (e) {
      console.error(`  ✗ ${acc.email}: ${e instanceof Error ? e.message : e}`);
      process.exitCode = 1;
    }
  }
  console.log(`\nDemo password for all three accounts: ${PASSWORD}`);
  console.log('Sign in at /auth with each email above.');
}

main();
