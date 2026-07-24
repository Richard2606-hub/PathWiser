'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Callout } from '@/components/common/Callout';
import { CloseButton, ClosableOverlay } from '@/components/common/ClosableOverlay';
import { Pill } from '@/components/common/Pill';
import { StatBox, StatGrid } from '@/components/common/StatBox';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import { navigate } from '@/lib/engine/client';
import { loadSavedItems, updateSavedItem } from '@/lib/marketplace/saved';
import { type MarketplaceJob, type RankedMarketplaceJob, rankMarketplaceJobs } from '@/lib/marketplace/rank';
import { formatMYR } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface JobsResponse {
  jobs: MarketplaceJob[];
  data_scope: 'community-marketplace' | 'modelled-marketplace';
  label: string;
}

export function JobListingsView() {
  const shape = useAppStore((state) => state.shape) || DEMO_PERSONAS.aisyah.shape;
  const showToast = useAppStore((state) => state.showToast);
  const [jobs, setJobs] = useState<RankedMarketplaceJob[]>([]);
  const [scope, setScope] = useState<JobsResponse['data_scope']>('modelled-marketplace');
  const [scopeLabel, setScopeLabel] = useState('Loading marketplace evidence...');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [location, setLocation] = useState('all');
  const [remote, setRemote] = useState('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [persistence, setPersistence] = useState<'account' | 'device'>('device');
  const [selected, setSelected] = useState<RankedMarketplaceJob | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetch('/api/marketplace/jobs', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Marketplace request failed (${response.status})`);
        const payload = await response.json() as JobsResponse;
        const engine = await navigate(shape, { currentStepIndex: 0 }).catch(() => undefined);
        const aggregate = engine && !('cohort_too_small' in engine) ? engine.aggregate : undefined;
        const savedItems = await loadSavedItems('job');
        if (!cancelled) {
          setJobs(rankMarketplaceJobs(payload.jobs, shape, aggregate));
          setScope(payload.data_scope);
          setScopeLabel(payload.label);
          setSaved(savedItems.ids);
          setPersistence(savedItems.persistence);
        }
      } catch (error) {
        if (!cancelled) setScopeLabel(error instanceof Error ? error.message : 'Marketplace is unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [shape]);

  useEffect(() => {
    const company = new URLSearchParams(window.location.search).get('company');
    if (company) setSearch(company);
  }, []);

  const sectors = useMemo(() => Array.from(new Set(jobs.map((job) => job.sector.split(' · ')[0]))), [jobs]);
  const locations = useMemo(() => Array.from(new Set(jobs.map((job) => job.location))), [jobs]);
  const filtered = useMemo(() => jobs.filter((job) => {
    const query = search.trim().toLowerCase();
    if (query && !`${job.title} ${job.company} ${job.skills.join(' ')}`.toLowerCase().includes(query)) return false;
    if (sector !== 'all' && !job.sector.startsWith(sector)) return false;
    if (location !== 'all' && job.location !== location) return false;
    if (remote !== 'all' && job.remote !== remote) return false;
    if (savedOnly && !saved.has(job.id)) return false;
    return true;
  }), [jobs, location, remote, saved, savedOnly, search, sector]);

  async function toggleSaved(job: RankedMarketplaceJob) {
    const next = !saved.has(job.id);
    setSaved((current) => {
      const updated = new Set(current);
      if (next) updated.add(job.id);
      else updated.delete(job.id);
      return updated;
    });
    const storedIn = await updateSavedItem('job', job.id, next, {
      title: job.title,
      company: job.company,
      location: job.location,
    });
    setPersistence(storedIn);
    showToast(next ? `Saved ${job.title}` : `Removed ${job.title} from saved roles`, 'success');
  }

  function exportBrief(job: RankedMarketplaceJob) {
    const content = [
      'PathWiser application brief',
      `${job.title} at ${job.company}`,
      '',
      `Evidence scope: ${scopeLabel}`,
      `Direction: ${job.alignment}`,
      `Why it appears: ${job.rationale}`,
      `Declared skills already present: ${job.alignedSkills.join(', ') || 'None yet'}`,
      `Skills to verify or build: ${job.skillBridges.join(', ') || 'None identified'}`,
      '',
      'Preparation checklist',
      '- Verify the vacancy and requirements with the employer.',
      '- Tailor examples to the listed skills; do not claim unverified experience.',
      '- Confirm salary, location, work mode, and application closing date.',
      '- Ask for reasonable adjustments if needed.',
    ].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    link.download = `pathwiser-${job.id}-application-brief.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Application brief downloaded', 'success');
  }

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Available roles" value={jobs.length} />
        <StatBox label="Strong or adjacent" value={jobs.filter((job) => job.alignment !== 'Exploratory').length} color="var(--yellow)" />
        <StatBox label="MyCOL critical" value={jobs.filter((job) => job.mycol).length} color="var(--sky)" />
        <StatBox label={`Saved on ${persistence}`} value={saved.size} color="var(--teal)" />
      </StatGrid>

      <Callout tone={scope === 'community-marketplace' ? 'emerald' : 'amber'}>
        <strong>{scope === 'community-marketplace' ? 'Community marketplace' : 'Modelled evaluation marketplace'}</strong>
        <p className="mt-1">{scopeLabel}. Direction labels explain cohort and skill signals; they are not hiring probabilities or employer decisions.</p>
      </Callout>

      <div className="p-3 rounded-xl border border-[color:var(--border)] bg-white flex flex-wrap gap-2 items-end">
        <label className="flex-1 min-w-[210px]">
          <span className="block text-[10px] font-semibold text-[color:var(--text-3)] mb-1">Search role, employer, or skill</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. data, Grab, SQL" className="w-full px-3 py-2 rounded-lg bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--accent)]" />
        </label>
        <FilterSelect label="Sector" value={sector} onChange={setSector} options={[{ v: 'all', l: 'All sectors' }, ...sectors.map((value) => ({ v: value, l: value }))]} />
        <FilterSelect label="Location" value={location} onChange={setLocation} options={[{ v: 'all', l: 'All locations' }, ...locations.map((value) => ({ v: value, l: value }))]} />
        <FilterSelect label="Work mode" value={remote} onChange={setRemote} options={[{ v: 'all', l: 'Any mode' }, { v: 'Onsite', l: 'Onsite' }, { v: 'Hybrid', l: 'Hybrid' }, { v: 'Remote', l: 'Remote' }]} />
        <Button variant={savedOnly ? 'teal' : 'outline'} size="sm" onClick={() => setSavedOnly((value) => !value)} aria-pressed={savedOnly}>Saved only</Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-[color:var(--text-3)]" role="status">Ranking available roles against your current Career Twin...</div>
      ) : filtered.length === 0 ? (
        <Callout tone="amber"><strong>No roles match these filters.</strong><p className="mt-1">Clear a filter or search more broadly. No results have been invented.</p></Callout>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((job) => (
            <article key={job.id} className="p-4 rounded-xl border border-[color:var(--border)] bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold">{job.title}</h3>
                  <p className="text-xs text-[color:var(--text-2)] mt-0.5">{job.company} · {job.location} · {job.remote}</p>
                  <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-3)] mt-1">{job.sector}</p>
                </div>
                <Pill variant={job.alignment === 'Strong direction' ? 'acquired' : job.alignment === 'Adjacent direction' ? 'bridge' : 'default'}>{job.alignment}</Pill>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3 text-[11px] text-[color:var(--text-2)]">
                <span className="px-2 py-1 rounded-md bg-[color:var(--bg-elevated)]">{formatMYR(job.salaryMin, false)}–{formatMYR(job.salaryMax, false)}/month</span>
                <span className="px-2 py-1 rounded-md bg-[color:var(--bg-elevated)]">{job.exp}</span>
                {job.mycol && <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-800">MyCOL critical</span>}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[color:var(--text-2)]">{job.rationale}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {job.skills.map((skill) => <Pill key={skill} variant={job.alignedSkills.includes(skill) ? 'acquired' : 'bridge'}>{skill}</Pill>)}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" onClick={() => setSelected(job)}>View role details</Button>
                <Button size="sm" variant="outline" onClick={() => void toggleSaved(job)} aria-pressed={saved.has(job.id)}>{saved.has(job.id) ? 'Saved' : 'Save role'}</Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ClosableOverlay open={Boolean(selected)} onClose={() => setSelected(null)} ariaLabel={selected ? `${selected.title} details` : 'Role details'}>
        {selected && (
          <div className="p-5 sm:p-7">
            <CloseButton onClick={() => setSelected(null)} />
            <p className="text-[10px] uppercase tracking-widest text-[color:var(--text-3)] pr-10">{selected.sector}</p>
            <h2 className="text-2xl font-extrabold mt-1 pr-10">{selected.title}</h2>
            <p className="text-sm text-[color:var(--text-2)]">{selected.company} · {selected.location} · {selected.remote}</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              <Detail label="Salary range" value={`${formatMYR(selected.salaryMin, false)}–${formatMYR(selected.salaryMax, false)} per month`} />
              <Detail label="Experience guidance" value={selected.exp} />
            </div>
            <section className="mt-5"><h3 className="font-bold">Role description</h3><p className="mt-1 text-sm leading-relaxed text-[color:var(--text-2)]">{selected.description || 'The employer has not published a description yet.'}</p></section>
            <section className="mt-5 p-4 rounded-xl bg-[color:var(--bg-elevated)]">
              <h3 className="font-bold">Why this direction appears</h3>
              <p className="mt-1 text-sm text-[color:var(--text-2)]">{selected.rationale}</p>
              <p className="mt-3 text-xs font-semibold">Skills to verify or build</p>
              <div className="flex flex-wrap gap-1 mt-1">{selected.skillBridges.length ? selected.skillBridges.map((skill) => <Pill variant="bridge" key={skill}>{skill}</Pill>) : <span className="text-xs text-[color:var(--text-3)]">No additional skills identified from the published list.</span>}</div>
            </section>
            <Callout tone="amber" className="mt-5">PathWiser does not submit an application or guarantee selection. Verify the live vacancy and employer requirements before sharing personal information.</Callout>
            <div className="flex flex-wrap gap-2 mt-5">
              <Button onClick={() => exportBrief(selected)}>Export application brief</Button>
              <Button variant="outline" onClick={() => void toggleSaved(selected)}>{saved.has(selected.id) ? 'Remove saved role' : 'Save role'}</Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </ClosableOverlay>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="p-3 rounded-xl border border-[color:var(--border)]"><span className="block text-[10px] uppercase text-[color:var(--text-3)]">{label}</span><span className="text-sm font-semibold">{value}</span></div>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ v: string; l: string }> }) {
  return (
    <label className="text-[11px]">
      <span className="block text-[10px] font-semibold text-[color:var(--text-3)] mb-1">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="px-2.5 py-2 rounded-lg bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-xs outline-none focus:border-[color:var(--accent)]">
        {options.map((option) => <option key={option.v} value={option.v}>{option.l}</option>)}
      </select>
    </label>
  );
}
