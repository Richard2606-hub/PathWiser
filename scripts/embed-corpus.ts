import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { getAIProvider } from '../lib/ai';
import { generateCorpus } from '../lib/corpus/generate';
import { COMPANIES } from '../lib/corpus/companies';
import { JOB_LISTINGS } from '../lib/corpus/jobs';

// Load env vars
loadEnvConfig(process.cwd());

function trajectoryToText(traj: any): string {
  const roles = traj.path.map((n: any) => n.role).join(' -> ');
  const allSkills = Array.from(new Set(traj.path.flatMap((n: any) => n.skills_added || [])));

  return [
    `Persona: ${traj.persona}`,
    `Life stage: ${traj.life_stage}`,
    `Career path: ${roles}`,
    `Location: ${traj.state}, Malaysia`,
    `Sector: ${traj.sector}`,
    `Skills: ${allSkills.join(', ')}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function jobToText(job: any): string {
  return [
    `Role: ${job.title}`,
    `Location: ${job.location}`,
    `Sector: ${job.sector}`,
    `Skills: ${job.skills.join(', ')}`,
    `Description: ${job.description}`,
  ].join('\n');
}

function parseHires(hires: string): number {
  const match = hires.match(/~(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Supabase config missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.');
    process.exit(1);
  }

  if (!geminiKey) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: GEMINI_API_KEY missing. Embedding trajectories requires a valid Gemini API key.');
    process.exit(1);
  }

  console.log('Initializing Supabase client and AI provider...');
  const supabase = createClient(supabaseUrl, serviceKey);
  const ai = getAIProvider();

  // 1. Clean existing records (in order of foreign key dependency)
  console.log('\nCleaning existing database records...');
  
  const { error: delFeedbackError } = await supabase.from('feedback_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delFeedbackError) console.warn('Warning deleting feedback sessions:', delFeedbackError.message);

  const { error: delSessionError } = await supabase.from('engine_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delSessionError) console.warn('Warning deleting engine sessions:', delSessionError.message);

  const { error: delJobsError } = await supabase.from('job_listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delJobsError) console.warn('Warning deleting job listings:', delJobsError.message);

  const { error: delCompaniesError } = await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delCompaniesError) console.warn('Warning deleting companies:', delCompaniesError.message);

  const { error: delTrajError } = await supabase.from('trajectories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delTrajError) console.warn('Warning deleting trajectories:', delTrajError.message);

  console.log('\x1b[32m✓ Database cleaned.\x1b[0m');

  // 2. Insert Companies
  console.log('\nInserting company directory...');
  const companyIdMap = new Map<string, string>();

  for (const company of COMPANIES) {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: company.name,
        logo_emoji: company.logo,
        sector: company.sector,
        headcount_band: company.headcount,
        hires_per_year: parseHires(company.hires),
        retention_pct: company.retention,
        culture: company.culture,
        hiring_shape: company.hiringShape,
        mycol_roles_count: company.mycolRoles,
        next_destinations: company.nextDestinations,
        sdgs: company.sdgs,
      })
      .select('id, name')
      .single();

    if (error) {
      console.error(`Failed to insert company ${company.name}:`, error.message);
      process.exit(1);
    }
    companyIdMap.set(company.name, data.id);
  }
  console.log(`\x1b[32m✓ Inserted ${COMPANIES.length} companies.\x1b[0m`);

  // 3. Embed and Insert Job Listings
  console.log('\nEmbedding and inserting job listings...');
  const jobTexts = JOB_LISTINGS.map(job => jobToText(job));
  
  console.log(`Requesting ${jobTexts.length} embeddings from Gemini...`);
  const jobEmbeddings = await ai.getEmbeddings(jobTexts);
  
  const jobsToInsert = JOB_LISTINGS.map((job, idx) => ({
    title: job.title,
    company_id: companyIdMap.get(job.company) || null,
    location: job.location,
    sector: job.sector,
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    experience: job.exp,
    remote_mode: job.remote,
    skills: job.skills,
    mycol_critical: job.mycol,
    description: job.description,
    active: true,
    role_shape_vector: jobEmbeddings[idx],
  }));

  const { error: jobInsError } = await supabase.from('job_listings').insert(jobsToInsert);
  if (jobInsError) {
    console.error('Failed to insert job listings:', jobInsError.message);
    process.exit(1);
  }
  console.log(`\x1b[32m✓ Embedded and inserted ${JOB_LISTINGS.length} job listings.\x1b[0m`);

  // 4. Generate, Embed and Insert Trajectories
  console.log('\nGenerating synthetic trajectories...');
  const trajectories = generateCorpus(1500, 42);
  console.log(`Generated ${trajectories.length} trajectories.`);

  console.log('Generating embedding texts...');
  const trajTexts = trajectories.map(t => trajectoryToText(t));

  console.log(`Requesting ${trajTexts.length} embeddings from Gemini (this will batch and take ~35s)...`);
  const startEmbed = Date.now();
  const trajEmbeddings = await ai.getEmbeddings(trajTexts);
  console.log(`\x1b[32m✓ Received all embeddings in ${((Date.now() - startEmbed) / 1000).toFixed(1)}s\x1b[0m`);

  console.log('Inserting trajectories into Supabase in batches...');
  const batchSize = 100;
  for (let i = 0; i < trajectories.length; i += batchSize) {
    const chunk = trajectories.slice(i, i + batchSize);
    const chunkToInsert = chunk.map((t, idx) => {
      const globalIdx = i + idx;
      return {
        persona: t.persona,
        life_stage: t.life_stage,
        state: t.state,
        sector: t.sector,
        path: t.path,
        esco_codes: t.esco_codes,
        synthetic: true,
        calibration_source: t.calibration_source,
        embedding: trajEmbeddings[globalIdx],
      };
    });

    const { error: trajInsError } = await supabase.from('trajectories').insert(chunkToInsert);
    if (trajInsError) {
      console.error(`Failed to insert trajectory batch starting at index ${i}:`, trajInsError.message);
      process.exit(1);
    }
    console.log(`  - Inserted records ${i + 1} to ${Math.min(i + batchSize, trajectories.length)}`);
  }

  console.log('\n\x1b[32m%s\x1b[0m', '✓ Supabase database successfully seeded with trajectories, jobs, and companies!');
}

main().catch(err => {
  console.error('\x1b[31m%s\x1b[0m', 'Unexpected seeding error:');
  console.error(err);
  process.exit(1);
});
