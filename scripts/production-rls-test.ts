import { randomBytes } from 'node:crypto';
import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { getAIProvider } from '../lib/ai';

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey || !process.env.GEMINI_API_KEY) {
  throw new Error('Production RLS testing requires Supabase URL/anon/service keys and GEMINI_API_KEY.');
}

const suffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
const password = `Pw!${randomBytes(18).toString('base64url')}`;
const candidateEmail = `pathwiser-qa-candidate-${suffix}@example.invalid`;
const employerEmail = `pathwiser-qa-employer-${suffix}@example.invalid`;
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
let candidateId: string | undefined;
let employerId: string | undefined;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function userClient() {
  return createClient(url!, anonKey!, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function createTestUser(email: string, persona: 'candidate' | 'employer', displayName: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      persona,
      display_name: displayName,
      role_title: persona === 'candidate' ? 'Production QA Analyst' : 'Production QA Hiring Lead',
      organisation_name: persona === 'employer' ? 'PathWiser Production QA Organisation' : undefined,
    },
  });
  if (error || !data.user) throw error || new Error(`Unable to create ${persona} QA user.`);
  return data.user.id;
}

async function signIn(email: string) {
  const client = userClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

async function main() {
  candidateId = await createTestUser(candidateEmail, 'candidate', 'PathWiser QA Candidate');
  employerId = await createTestUser(employerEmail, 'employer', 'PathWiser QA Employer');

  const candidate = await signIn(candidateEmail);
  const employer = await signIn(employerEmail);

  const candidateShapes = await candidate.from('user_shapes').select('user_id, persona, display_name');
  assert(!candidateShapes.error, `Candidate shape read failed: ${candidateShapes.error?.message}`);
  assert(candidateShapes.data?.length === 1 && candidateShapes.data[0].user_id === candidateId, 'Candidate did not receive exactly their own profile.');

  const employerShapes = await employer.from('user_shapes').select('user_id, persona, display_name');
  assert(!employerShapes.error, `Employer shape read failed: ${employerShapes.error?.message}`);
  assert(employerShapes.data?.length === 1 && employerShapes.data[0].user_id === employerId, 'Employer could see a profile outside their own account.');

  const crossAccountUpdate = await employer
    .from('user_shapes')
    .update({ display_name: 'RLS bypassed' })
    .eq('user_id', candidateId)
    .select('user_id');
  assert(!crossAccountUpdate.error, `Cross-account update produced an unexpected database error: ${crossAccountUpdate.error?.message}`);
  assert(crossAccountUpdate.data?.length === 0, 'Employer was able to update the candidate profile.');

  const embedding = await getAIProvider().getEmbedding(
    'task: search result | query: Production QA analyst with SQL, Python and Tableau'
  );
  const profileUpdate = await candidate
    .from('user_shapes')
    .update({
      role_title: 'Production QA Analyst',
      state: 'Kuala Lumpur',
      skills: ['SQL', 'Python', 'Tableau'],
      discoverable: true,
      shape_vector: embedding,
    })
    .eq('user_id', candidateId);
  assert(!profileUpdate.error, `Candidate profile preparation failed: ${profileUpdate.error?.message}`);

  const consentInsert = await candidate
    .from('consent_records')
    .insert({ user_id: candidateId, consent_type: 'employer_discovery' })
    .select('id')
    .single();
  assert(!consentInsert.error && consentInsert.data?.id, `Consent creation failed: ${consentInsert.error?.message}`);

  const candidateRpc = await candidate.rpc('match_consented_candidates', {
    query_embedding: embedding,
    match_count: 10,
  });
  assert(candidateRpc.error?.message.includes('Employer organisation membership required'), 'A candidate account could invoke employer-only discovery.');

  const employerRpc = await employer.rpc('match_consented_candidates', {
    query_embedding: embedding,
    match_count: 10,
  });
  assert(!employerRpc.error, `Employer discovery failed: ${employerRpc.error?.message}`);
  const match = employerRpc.data?.find((row: { display_name?: string }) => row.display_name === 'PathWiser QA Candidate');
  assert(match, 'An opted-in, discoverable candidate was not returned to the employer.');
  assert(match.candidate_key !== candidateId && !JSON.stringify(match).includes(candidateEmail), 'Employer discovery exposed a raw account identifier or email.');

  const revoke = await candidate
    .from('consent_records')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', consentInsert.data.id);
  assert(!revoke.error, `Consent revocation failed: ${revoke.error?.message}`);

  const afterRevoke = await employer.rpc('match_consented_candidates', {
    query_embedding: embedding,
    match_count: 10,
  });
  assert(!afterRevoke.error, `Post-revocation discovery failed: ${afterRevoke.error?.message}`);
  assert(!afterRevoke.data?.some((row: { display_name?: string }) => row.display_name === 'PathWiser QA Candidate'), 'Revoked candidate remained discoverable.');

  const memberships = await employer.from('organisation_members').select('user_id, member_role');
  assert(!memberships.error && memberships.data?.some((row) => row.user_id === employerId && row.member_role === 'owner'), 'Employer organisation membership was not provisioned or isolated.');

  return {
    passed: 9,
    candidate_profile_isolated: true,
    cross_account_update_blocked: true,
    employer_rpc_role_gated: true,
    consented_candidate_discoverable: true,
    raw_identity_hidden: true,
    revocation_immediate: true,
  };
}

async function cleanup() {
  if (employerId) {
    const { error } = await admin.from('organisations').delete().eq('created_by', employerId);
    if (error) throw new Error(`QA organisation cleanup failed: ${error.message}`);
  }
  for (const id of [candidateId, employerId]) {
    if (id) {
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw new Error(`QA user cleanup failed: ${error.message}`);
    }
  }
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`QA cleanup verification failed: ${error.message}`);
  const leaked = data.users.some((user) => user.email === candidateEmail || user.email === employerEmail);
  if (leaked) throw new Error('Temporary QA accounts remain after cleanup.');
}

async function run() {
  let report: Awaited<ReturnType<typeof main>> | undefined;
  try {
    report = await main();
  } finally {
    await cleanup();
  }
  console.log(JSON.stringify({ ...report, cleanup: 'complete' }));
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
