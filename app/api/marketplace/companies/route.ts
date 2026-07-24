import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { COMPANIES } from '@/lib/corpus/companies';
import { rateLimit } from '@/lib/security/rateLimit';
import { hasSupabaseConfig } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'marketplace-companies-read', 100);
  if (limited) return limited;

  if (hasSupabaseConfig() && process.env.ALLOW_FULL_MODE === 'true') {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('companies')
        .select('id,name,logo_emoji,sector,headcount_band,hires_per_year,retention_pct,culture,hiring_shape,mycol_roles_count,next_destinations,sdgs')
        .order('name')
        .limit(250);
      if (!error && data?.length) {
        return NextResponse.json({
          companies: data.map((row) => ({
            id: String(row.id),
            name: row.name,
            logo: row.logo_emoji || '🏢',
            sector: row.sector || 'Other',
            headcount: row.headcount_band || 'Not published',
            hires: row.hires_per_year == null ? 'Not published' : `${row.hires_per_year}/yr`,
            retention: Number(row.retention_pct || 0),
            culture: row.culture || 'Not published',
            hiringShape: row.hiring_shape || 'Not published',
            mycolRoles: row.mycol_roles_count || 0,
            nextDestinations: row.next_destinations || [],
            sdgs: row.sdgs || [],
            description: '',
          })),
          data_scope: 'community-marketplace',
          label: 'Employers from the configured PathWiser marketplace',
        });
      }
    } catch {
      // Use the disclosed modelled marketplace below.
    }
  }

  return NextResponse.json({
    companies: COMPANIES.map((company) => ({ ...company, id: String(company.id) })),
    data_scope: 'modelled-marketplace',
    label: 'Modelled Malaysian employer profiles for workflow evaluation',
  });
}
