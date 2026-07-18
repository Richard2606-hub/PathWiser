'use client';

import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { MODULES, modulesForPersona } from '@/lib/corpus/modules';
import { SDG_META } from '@/lib/corpus/sdgs';

const AUDIENCE_META = {
  candidate:  { emoji: '👤', color: 'var(--yellow)', label: 'CANDIDATE' },
  employer:   { emoji: '🏢', color: 'var(--teal)',   label: 'EMPLOYER' },
  university: { emoji: '🎓', color: 'var(--violet)', label: 'UNIVERSITY' },
};

const CAPABILITIES = ['Navigation', 'Intelligence', 'Valuation'] as const;

export function ArchitectureView() {
  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <div
        className="rounded-lg border border-[color:var(--border-strong)] p-5 sm:p-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(250,204,21,0.04), rgba(45,212,191,0.04), rgba(167,139,250,0.04))',
        }}
      >
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          PathWiser · Career OS Navigation Platform
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 leading-tight">
          Navigate your career, <span className="text-[color:var(--yellow)]">wiser</span>.
        </h2>
        <p className="text-sm text-[color:var(--text-2)] mt-2 max-w-3xl leading-relaxed">
          Three audiences. One shared engine. Honest navigation, never prediction. Built for Asia,
          calibrated to Malaysian labour realities, designed for direct integration into Talentbank&apos;s Career OS.
        </p>
      </div>

      {/* Compulsory brief alignment */}
      <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          Brief Alignment
        </span>
        <h3 className="text-base font-extrabold mt-1">
          How PathWiser maps to Talentbank&apos;s Career OS pillars
        </h3>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 mt-3">
          {[
            { num: '01', name: 'Navigation, not prediction', how: 'Retrieval + deterministic aggregation produce numbers; the LLM only explains, never predicts.' },
            { num: '02', name: 'The 40-year arc', how: 'Six life stages from Student (13–17) to Executive (55+); cohorts filtered by stage at every retrieval.' },
            { num: '03', name: 'Both sides honestly', how: 'One engine serves Candidate, Employer, and University surfaces — the Career Signal Loop is structural, not bolted on.' },
            { num: '04', name: 'Human language to humans', how: 'Every output discloses cohort size, range, and trade-offs; no black-box scores, no false precision.' },
            { num: '05', name: 'Compulsory Career OS module', how: 'Smart Talent Matching + Career Path Navigator + shared engine = the marketplace the brief requires.' },
          ].map((p) => (
            <div key={p.num} className="p-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--yellow)]">{p.num}</span>
              <div className="text-sm font-bold mt-0.5">{p.name}</div>
              <div className="text-[10px] text-[color:var(--text-2)] leading-relaxed mt-1">{p.how}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3x3 module grid */}
      <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          The 9-Module Map
        </span>
        <h3 className="text-base font-extrabold mt-1">
          Three capabilities × three audiences, one engine underneath
        </h3>
        <p className="text-xs text-[color:var(--text-2)] mt-1.5">
          Every module is drawn directly from Talentbank&apos;s Challenge Module library. Each calls the
          same Career Twin Engine — only the framing of the user shape and the aggregation target differ.
        </p>

        <div className="mt-3 grid gap-1.5 md:grid-cols-[100px_1fr]">
          <div className="hidden md:flex flex-col justify-around py-2">
            {CAPABILITIES.map((c) => (
              <span key={c} className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-2)] text-right pr-2">
                {c}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {CAPABILITIES.flatMap((cap) =>
              (['candidate', 'employer', 'university'] as const).map((aud) => {
                const m = modulesForPersona(aud).find((x) => x.cap === cap);
                if (!m) return null;
                const meta = AUDIENCE_META[aud];
                return (
                  <a
                    key={m.key}
                    href={m.href}
                    className="p-2.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] hover:bg-[color:var(--bg-glass-strong)] hover:-translate-y-0.5 transition-all"
                    style={{ borderLeftColor: meta.color, borderLeftWidth: 3 }}
                  >
                    <span className="font-mono text-[10px] font-extrabold" style={{ color: meta.color }}>
                      {m.abbr}
                    </span>
                    <div className="text-xs font-bold leading-tight mt-0.5">{m.title}</div>
                    <div className="font-mono text-[8px] uppercase text-[color:var(--text-3)] mt-0.5">
                      {meta.label}
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatGrid cols={4}>
        <StatBox label="Trajectory corpus" value="1,500" />
        <StatBox label="Audience surfaces" value="3" color="var(--teal)" />
        <StatBox label="Total modules" value="16" color="var(--violet)" />
        <StatBox label="SDGs addressed" value={Object.keys(SDG_META).length} color="var(--sky)" />
      </StatGrid>

      {/* Signal Loop diagram */}
      <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          Career Signal Loop
        </span>
        <h3 className="text-base font-extrabold mt-1">The three-audience data flow</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 justify-center">
          {(['candidate', 'employer', 'university'] as const).map((aud, i) => {
            const meta = AUDIENCE_META[aud];
            return (
              <div key={aud} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-md border"
                  style={{ borderColor: meta.color, background: `${meta.color}10` }}
                >
                  <span className="text-lg">{meta.emoji}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</span>
                    <span className="text-[9px] font-mono uppercase text-[color:var(--text-3)]">
                      {aud === 'candidate' ? 'Navigate paths' : aud === 'employer' ? 'Demand signals' : 'Outcome loop'}
                    </span>
                  </div>
                </div>
                {i < 2 && <span className="font-mono text-lg text-[color:var(--text-3)] hidden sm:inline">⟶</span>}
                {i < 2 && <span className="font-mono text-lg text-[color:var(--text-3)] sm:hidden">↓</span>}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[11px] text-center italic text-[color:var(--amber)]">
          ⟲ feedback closes the loop
        </p>
      </div>

      {/* Data sources */}
      <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          Data Strategy
        </span>
        <h3 className="text-base font-extrabold mt-1">Open, licensed, Malaysian-calibrated</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mt-3">
          {[
            { name: 'O*NET', icon: '📋', license: 'CC-BY-4.0', desc: 'Occupation taxonomy · skill ratings' },
            { name: 'ESCO', icon: '🇪🇺', license: 'EU Decision 2011/833', desc: 'European Skills / Occupations classification' },
            { name: 'DOSM Malaysia', icon: '🇲🇾', license: 'Open Data MY', desc: 'Salaries & Wages Survey · Labour Force Statistics' },
            { name: 'Recruiter Guides', icon: '📊', license: 'Public Reports', desc: 'Michael Page · Hays · Robert Walters headline anchors' },
            { name: 'Open Trajectory', icon: '🔁', license: 'Various OSS', desc: 'Anonymised career paths' },
            { name: 'Synthetic Pipeline', icon: '🔬', license: 'Internal', desc: 'Malaysian-calibrated synthetic corpus (disclosed)' },
          ].map((s) => (
            <div key={s.name} className="p-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
              <div className="text-xl">{s.icon}</div>
              <div className="text-sm font-bold mt-0.5">{s.name}</div>
              <div className="text-[10px] text-[color:var(--text-2)] mt-0.5">{s.desc}</div>
              <div className="mt-1 inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-[color:var(--bg-elevated)] border border-[color:var(--border)]">
                {s.license}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Callout tone="amber">
        <strong>🛡️ Honest framing as a continuous discipline.</strong>
        <p className="mt-1.5">
          Three risks are acknowledged in the proposal and reflected in the product: (1) no large
          Malaysian trajectory dataset exists publicly — our corpus is synthetic-but-calibrated, disclosed;
          (2) recruiter salary guides are copyrighted — we use headline figures as calibration constants only;
          (3) maintaining &ldquo;navigation, not prediction&rdquo; is a discipline, not a setting — prompt validation
          rejects predictive verbs at the gate.
        </p>
      </Callout>
    </div>
  );
}
