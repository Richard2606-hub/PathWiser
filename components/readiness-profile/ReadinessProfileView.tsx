'use client';

import { useState, useEffect } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { Button } from '@/components/common/Button';
import { navigate } from '@/lib/engine/client';
import { useAppStore } from '@/store/useAppStore';

const FALLBACK_CAPABILITIES = [
  { skill: 'Core Algorithms', pct: 92, status: 'acquired' },
  { skill: 'Database Design (SQL)', pct: 88, status: 'acquired' },
  { skill: 'Web Development', pct: 75, status: 'acquired' },
  { skill: 'REST API Design', pct: 62, status: 'bridge' },
  { skill: 'Project Management', pct: 48, status: 'bridge' },
  { skill: 'Cloud Infrastructure', pct: 35, status: 'gap' },
] as const;

export function ReadinessProfileView() {
  const showToast = useAppStore((s) => s.showToast);
  const [capabilities, setCapabilities] = useState<{ skill: string; pct: number; status: 'acquired' | 'bridge' | 'gap' }[]>([...FALLBACK_CAPABILITIES]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await navigate({
          userId: 'anon',
          persona: 'university',
          role: 'Junior Data Scientist',
          education: "Bachelor's",
          years_experience: 0,
          state: 'Kuala Lumpur',
          skills: ['Python', 'SQL', 'Core Algorithms'],
          life_stage: 'student',
        });

        const bridges = 'aggregate' in res && res.aggregate?.common_skill_bridges ? res.aggregate.common_skill_bridges : [];
        
        const newCaps: { skill: string; pct: number; status: 'acquired' | 'bridge' | 'gap' }[] = [
          { skill: 'Core Algorithms', pct: 92, status: 'acquired' },
          { skill: 'Database Design (SQL)', pct: 88, status: 'acquired' },
          { skill: 'Python', pct: 85, status: 'acquired' },
        ];
        
        bridges.slice(0, 3).forEach((b) => {
          const freq = Math.round(b.frequency * 100);
          newCaps.push({
            skill: b.skill,
            pct: freq,
            status: freq > 30 ? 'bridge' : 'gap',
          });
        });

        setCapabilities(newCaps);
      } catch (err: any) {
        console.error(err);
        showToast(`Engine API Error: ${err.message || 'Failed to fetch capability profile.'}`, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Tracked Students" value="4,200" />
        <StatBox label="Avg Readiness" value="72%" color="var(--teal)" />
        <StatBox label="ESCO Coverage" value="85%" color="var(--violet)" />
        <StatBox label="Last Refresh" value={loading ? '...' : 'Just now'} color="var(--sky)" />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            ESCO Capability Benchmark · Student Vector
          </span>
          <h3 className="text-base font-extrabold mt-0.5 mb-3">Ahmad Syamil · BSc CS (AI/DS)</h3>
          <div className="flex flex-col gap-2.5">
            {capabilities.map((c) => (
              <div key={c.skill} className="grid grid-cols-[180px_1fr_55px] items-center gap-3">
                <span className="text-xs">{c.skill}</span>
                <div className="h-2 rounded-full bg-[color:var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full transition-[width] duration-700"
                    style={{
                      width: `${c.pct}%`,
                      background:
                        c.status === 'acquired' ? 'var(--emerald)' :
                        c.status === 'bridge' ? 'var(--yellow)' :
                        'var(--rose)',
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-[color:var(--text-3)] text-right tabular-nums">
                  {c.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-3.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Graduating Vector Profile
            </span>
            <h4 className="text-base font-extrabold mt-0.5">Ahmad Syamil</h4>
            <p className="text-xs text-[color:var(--text-2)] mt-1 leading-relaxed">
              A dynamic, continuously-updated capability profile replacing the static degree certificate.
              Mapped against ESCO and O*NET taxonomies.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {capabilities.map(c => (
                <Pill key={c.skill} variant={c.status}>
                  {c.skill} {c.status === 'acquired' ? '✓' : c.status === 'bridge' ? '⟶' : '✗'}
                </Pill>
              ))}
            </div>
            <p className="text-[9px] font-mono text-[color:var(--text-3)] mt-2">
              Last updated {loading ? '...' : 'Just now'} · Auto-refresh enabled
            </p>
          </div>
          <Callout tone="violet">
            <strong>Employer Sharing</strong>
            <p className="mt-1">
              Students can share a capability snapshot with prospective employers under explicit consent.
              Consent is revocable.
            </p>
          </Callout>
          <Button variant="violet">Generate Capability Dossier</Button>
        </div>
      </div>
    </div>
  );
}
