'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Callout } from '@/components/common/Callout';
import { CloseButton, ClosableOverlay } from '@/components/common/ClosableOverlay';
import { Pill } from '@/components/common/Pill';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { SDG_META } from '@/lib/corpus/sdgs';
import { loadSavedItems, updateSavedItem } from '@/lib/marketplace/saved';
import { useAppStore } from '@/store/useAppStore';

interface MarketplaceCompany {
  id: string;
  name: string;
  logo: string;
  sector: string;
  headcount: string;
  hires: string;
  retention: number;
  culture: string;
  hiringShape: string;
  mycolRoles: number;
  nextDestinations: string[];
  sdgs: number[];
  description: string;
}

interface CompaniesResponse {
  companies: MarketplaceCompany[];
  data_scope: 'community-marketplace' | 'modelled-marketplace';
  label: string;
}

export function CompanyDirectoryView() {
  const showToast = useAppStore((state) => state.showToast);
  const [companies, setCompanies] = useState<MarketplaceCompany[]>([]);
  const [scope, setScope] = useState<CompaniesResponse['data_scope']>('modelled-marketplace');
  const [scopeLabel, setScopeLabel] = useState('Loading employer evidence...');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [hiringOnly, setHiringOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [persistence, setPersistence] = useState<'account' | 'device'>('device');
  const [selected, setSelected] = useState<MarketplaceCompany | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetch('/api/marketplace/companies', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Directory request failed (${response.status})`);
        const payload = await response.json() as CompaniesResponse;
        const savedItems = await loadSavedItems('company');
        if (!cancelled) {
          setCompanies(payload.companies);
          setScope(payload.data_scope);
          setScopeLabel(payload.label);
          setSaved(savedItems.ids);
          setPersistence(savedItems.persistence);
        }
      } catch (error) {
        if (!cancelled) setScopeLabel(error instanceof Error ? error.message : 'Employer directory is unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const sectors = useMemo(() => Array.from(new Set(companies.map((company) => company.sector.split(' · ')[0]))), [companies]);
  const filtered = useMemo(() => companies.filter((company) => {
    const query = search.trim().toLowerCase();
    if (query && !`${company.name} ${company.sector} ${company.culture}`.toLowerCase().includes(query)) return false;
    if (sector !== 'all' && !company.sector.startsWith(sector)) return false;
    if (hiringOnly && company.hires.toLowerCase().includes('not published')) return false;
    if (savedOnly && !saved.has(company.id)) return false;
    return true;
  }), [companies, hiringOnly, saved, savedOnly, search, sector]);

  async function toggleSaved(company: MarketplaceCompany) {
    const next = !saved.has(company.id);
    setSaved((current) => {
      const updated = new Set(current);
      if (next) updated.add(company.id);
      else updated.delete(company.id);
      return updated;
    });
    const storedIn = await updateSavedItem('company', company.id, next, {
      name: company.name,
      sector: company.sector,
    });
    setPersistence(storedIn);
    showToast(next ? `Saved ${company.name}` : `Removed ${company.name}`, 'success');
  }

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Employers available" value={companies.length} />
        <StatBox label="Profiles with hiring context" value={companies.filter((company) => !company.hires.toLowerCase().includes('not published')).length} color="var(--emerald)" />
        <StatBox label="MyCOL roles represented" value={companies.reduce((sum, company) => sum + company.mycolRoles, 0)} color="var(--yellow)" />
        <StatBox label={`Saved on ${persistence}`} value={saved.size} color="var(--sky)" />
      </StatGrid>

      <Callout tone={scope === 'community-marketplace' ? 'emerald' : 'amber'}>
        <strong>{scope === 'community-marketplace' ? 'Community employer directory' : 'Modelled evaluation directory'}</strong>
        <p className="mt-1">{scopeLabel}. Employer-provided or modelled values must be verified before a candidate makes a decision.</p>
      </Callout>

      <div className="p-3 rounded-xl border border-[color:var(--border)] bg-white flex flex-wrap gap-2 items-end">
        <label className="flex-1 min-w-[220px]">
          <span className="block text-[10px] font-semibold text-[color:var(--text-3)] mb-1">Search employer, sector, or culture</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. fintech, research, flexible" className="w-full px-3 py-2 rounded-lg bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--accent)]" />
        </label>
        <label className="text-[11px]">
          <span className="block text-[10px] font-semibold text-[color:var(--text-3)] mb-1">Sector</span>
          <select value={sector} onChange={(event) => setSector(event.target.value)} className="px-2.5 py-2 rounded-lg bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-xs outline-none focus:border-[color:var(--accent)]">
            <option value="all">All sectors</option>
            {sectors.map((value) => <option value={value} key={value}>{value}</option>)}
          </select>
        </label>
        <Button size="sm" variant={hiringOnly ? 'teal' : 'outline'} onClick={() => setHiringOnly((value) => !value)} aria-pressed={hiringOnly}>Hiring data</Button>
        <Button size="sm" variant={savedOnly ? 'teal' : 'outline'} onClick={() => setSavedOnly((value) => !value)} aria-pressed={savedOnly}>Saved only</Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-[color:var(--text-3)]" role="status">Loading employer profiles...</div>
      ) : filtered.length === 0 ? (
        <Callout tone="amber"><strong>No employers match these filters.</strong><p className="mt-1">Clear a filter or search more broadly.</p></Callout>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((company) => (
            <article key={company.id} className="p-4 rounded-xl border border-[color:var(--border)] bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex gap-3">
                <div className="text-3xl w-12 h-12 rounded-xl bg-[color:var(--bg-elevated)] flex items-center justify-center flex-shrink-0" aria-hidden="true">{company.logo}</div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold">{company.name}</h3>
                  <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-3)]">{company.sector}</p>
                  <p className="text-xs text-[color:var(--text-2)] mt-1">{company.culture}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                <Meta label="Headcount" value={company.headcount} />
                <Meta label="Hiring signal" value={company.hires} />
                <Meta label="Retention" value={company.retention ? `${company.retention}%` : 'Not published'} />
                <Meta label="MyCOL roles" value={String(company.mycolRoles)} />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" onClick={() => setSelected(company)}>View employer</Button>
                <Button size="sm" variant="outline" onClick={() => void toggleSaved(company)} aria-pressed={saved.has(company.id)}>{saved.has(company.id) ? 'Saved' : 'Save employer'}</Button>
                <Link href={`/dashboard/marketplace/jobs?company=${encodeURIComponent(company.name)}`} className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-[10px] border border-[color:var(--border)] hover:border-[color:var(--accent)]">View roles</Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <ClosableOverlay open={Boolean(selected)} onClose={() => setSelected(null)} ariaLabel={selected ? `${selected.name} employer profile` : 'Employer profile'}>
        {selected && (
          <div className="p-5 sm:p-7">
            <CloseButton onClick={() => setSelected(null)} />
            <div className="flex items-center gap-3 pr-10">
              <span className="text-4xl" aria-hidden="true">{selected.logo}</span>
              <div><h2 className="text-2xl font-extrabold">{selected.name}</h2><p className="text-xs text-[color:var(--text-3)]">{selected.sector}</p></div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-2)]">{selected.description || 'No long-form employer description has been published.'}</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              <Detail label="Culture signal" value={selected.culture} />
              <Detail label="Hiring shape" value={selected.hiringShape} />
            </div>
            <section className="mt-5 p-4 rounded-xl bg-[color:var(--bg-elevated)]">
              <h3 className="font-bold">Observed next destinations</h3>
              <div className="flex flex-wrap gap-1 mt-2">{selected.nextDestinations.length ? selected.nextDestinations.map((destination) => <Pill key={destination}>{destination}</Pill>) : <span className="text-xs text-[color:var(--text-3)]">No destination data published.</span>}</div>
            </section>
            {selected.sdgs.length > 0 && <div className="flex flex-wrap gap-2 mt-5">{selected.sdgs.map((number) => { const sdg = SDG_META[number]; return sdg ? <span key={number} className="px-2 py-1 rounded-md text-xs text-white" style={{ background: sdg.color }}>SDG {sdg.num}: {sdg.name}</span> : null; })}</div>}
            <Callout tone="amber" className="mt-5">Culture, retention, and destination signals describe evidence available to PathWiser; they do not guarantee an individual experience.</Callout>
            <div className="flex flex-wrap gap-2 mt-5">
              <Link href={`/dashboard/marketplace/jobs?company=${encodeURIComponent(selected.name)}`} className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-[10px] bg-[color:var(--yellow)] text-white">Explore roles</Link>
              <Button variant="outline" onClick={() => void toggleSaved(selected)}>{saved.has(selected.id) ? 'Remove saved employer' : 'Save employer'}</Button>
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-[color:var(--bg-elevated)]">
      <span className="block text-[9px] uppercase tracking-wide text-[color:var(--text-3)]">{label}</span>
      <span className="text-xs font-bold break-words">{value}</span>
    </div>
  );
}
