import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JOB_LISTINGS } from '@/lib/corpus/jobs';
import { rateLimit } from '@/lib/security/rateLimit';
import { hasSupabaseConfig } from '@/lib/utils';

interface CommunityJobRow {
  id: string | number;
  title: string;
  location: string;
  sector: string | null;
  salary_min: number;
  salary_max: number;
  experience: string | null;
  remote_mode: string | null;
  skills: string[] | null;
  mycol_critical: boolean | null;
  posted_at: string;
  description: string | null;
  company: { name: string } | Array<{ name: string }> | null;
}

function relativeDate(value: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 14) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'marketplace-jobs-read', 100);
  if (limited) return limited;

  if (hasSupabaseConfig() && process.env.ALLOW_FULL_MODE === 'true') {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('job_listings')
        .select('id,title,location,sector,salary_min,salary_max,experience,remote_mode,skills,mycol_critical,posted_at,description,company:companies(name)')
        .eq('active', true)
        .order('posted_at', { ascending: false })
        .limit(250);
      if (!error && data?.length) {
        const jobs = (data as CommunityJobRow[]).map((row) => ({
          id: String(row.id),
          title: row.title,
          company: Array.isArray(row.company) ? row.company[0]?.name || 'Employer' : row.company?.name || 'Employer',
          location: row.location,
          sector: row.sector || 'Other',
          salaryMin: row.salary_min,
          salaryMax: row.salary_max,
          exp: row.experience || 'Not specified',
          mycol: Boolean(row.mycol_critical),
          remote: row.remote_mode || 'Onsite',
          skills: row.skills || [],
          posted: relativeDate(row.posted_at),
          description: row.description || '',
        }));
        return NextResponse.json({
          jobs,
          data_scope: 'community-marketplace',
          label: 'Active roles from the configured PathWiser marketplace',
        });
      }
    } catch {
      // Use the disclosed modelled marketplace below.
    }
  }

  return NextResponse.json({
    jobs: JOB_LISTINGS.map(({ fit, bridge, ...job }) => {
      void fit;
      void bridge;
      return { ...job, id: String(job.id) };
    }),
    data_scope: 'modelled-marketplace',
    label: 'Modelled Malaysian openings for workflow evaluation',
  });
}
