'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { MODULES, modulesForPersona, engineModules, supportModules, marketplaceModules } from '@/lib/corpus/modules';
import { cn } from '@/lib/utils';
import type { Persona } from '@/types';

const PERSONA_META: Record<Persona, { emoji: string; title: string; tagline: string; color: string }> = {
  candidate:  { emoji: '👤', title: 'FOR CANDIDATES', tagline: '— decide your next move',       color: 'var(--yellow)' },
  employer:   { emoji: '🏢', title: 'FOR EMPLOYERS',  tagline: '— find, keep, ramp talent',      color: 'var(--teal)' },
  university: { emoji: '🎓', title: 'FOR UNIVERSITIES', tagline: '— close the curriculum loop',  color: 'var(--violet)' },
};

const CAP_LABELS: Record<string, string> = {
  Navigation: 'NAVIGATION',
  Intelligence: 'INTELLIGENCE',
  Valuation: 'VALUATION',
};

const CAP_HINTS: Record<string, string> = {
  path_navigator: 'your realistic next moves',
  ai_coach: "the questions you can't ask",
  fair_pay: 'compare disclosed salary ranges',
  talent_matching: 'trajectory fit, not keywords',
  retention_signals: 'before the letter arrives',
  onboarding_predictor: 'plan evidence-based onboarding support',
  outcome_loop: 'where graduates actually land',
  curriculum_engine: 'teach what the market wants',
  readiness_profile: 'a credential that stays alive',
};

/**
 * Sidebar — filters modules by active persona in locked mode.
 * In judge mode, all three persona surfaces are collapsible.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const judgeEnabled = process.env.NEXT_PUBLIC_ENABLE_JUDGE_MODE === 'true';
  const persona = useAppStore((s) => s.persona);
  const judgeMode = useAppStore((s) => s.judgeMode);
  const setPersona = useAppStore((s) => s.setPersona);
  const openLockedExplainer = useAppStore((s) => s.openLockedExplainer);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="flex h-full flex-col gap-5 p-4">
      {/* Persona surfaces */}
      {(['candidate', 'employer', 'university'] as const).map((p) => {
        const meta = PERSONA_META[p];
        const isActivePersona = persona === p;
        const showBody = judgeEnabled && judgeMode ? true : isActivePersona;
        const showCard = judgeEnabled && judgeMode ? true : isActivePersona;

        if (!showCard) return null;

        return (
          <SidebarCard
            key={p}
            title={
              <div
                className={cn(
                  'flex items-center gap-2 cursor-pointer',
                  !isActivePersona && 'opacity-70 hover:opacity-100'
                )}
                onClick={() => {
                  if (!(judgeEnabled && judgeMode) && !isActivePersona) {
                    openLockedExplainer(p);
                    return;
                  }
                  setPersona(p);
                }}
              >
                <span className="text-base">{meta.emoji}</span>
                <span style={{ color: isActivePersona ? meta.color : 'var(--text-2)' }}>
                  {meta.title}
                </span>
                <span className="font-normal text-[10px] italic text-[color:var(--text-3)]">
                  {meta.tagline}
                </span>
              </div>
            }
          >
            {showBody && (
              <div className="flex flex-col gap-1.5">
                {modulesForPersona(p).map((m) => (
                  <CapRow
                    key={m.key}
                    module={m}
                    isActive={isActive}
                    onNavigate={onNavigate}
                    accentColor={meta.color}
                  />
                ))}
              </div>
            )}
          </SidebarCard>
        );
      })}

      {/* Shared tools follow the audience's primary tasks. */}
      <SidebarCard title="MARKETPLACE">
        <div className="grid grid-cols-2 gap-1.5">
          {marketplaceModules().map((m) => (
            <ModuleTile key={m.key} module={m} isActive={isActive} onNavigate={onNavigate} />
          ))}
        </div>
      </SidebarCard>

      <details className="rounded-xl bg-[color:var(--bg-elevated)]">
        <summary className="cursor-pointer px-3 py-2.5 text-[11px] font-semibold text-[color:var(--text-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--yellow)]">
          Technical details
        </summary>
        <div className="flex flex-col gap-3 border-t border-[color:var(--border)] p-3">
          <ModuleTile module={MODULES.architecture} isActive={isActive} onNavigate={onNavigate} wide gradient />
          <div className="flex flex-col gap-1">
            {engineModules().map((m) => (
              <ModuleTile key={m.key} module={m} isActive={isActive} onNavigate={onNavigate} row />
            ))}
          </div>
        </div>
      </details>

      {/* Support Layer */}
      <SidebarCard title="SUPPORT LAYER">
        <div className="grid grid-cols-3 gap-1.5">
          {supportModules().filter((m) => m.key !== 'analytics' || (judgeEnabled && judgeMode)).map((m) => (
            <ModuleTile key={m.key} module={m} isActive={isActive} onNavigate={onNavigate} />
          ))}
        </div>
      </SidebarCard>

      {/* Neutral sponsored slot */}
      <div
        title="Reserved advertising space. No campaign is active."
        className="flex flex-col gap-2 rounded-xl bg-[color:var(--bg-elevated)] p-3"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 6px, transparent 6px 12px)',
        }}
      >
        <span className="font-mono text-[8px] uppercase tracking-widest text-[color:var(--text-3)] self-start px-1.5 py-0.5 rounded bg-[color:var(--bg-elevated)]">
          Sponsored
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📢</span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-bold">Sponsored opportunity</span>
            <span className="text-[10px] text-[color:var(--text-2)]">No reviewed campaign is currently active</span>
          </div>
        </div>
        <span className="font-mono text-[9px] italic text-[color:var(--text-3)]">
          Reserved · clearly separated from evidence
        </span>
      </div>
    </aside>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-2"
      style={{
        background: 'transparent',
      }}
    >
      <div className="px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--text-3)]">
        {title}
      </div>
      {children}
    </div>
  );
}

function ModuleTile({
  module: m,
  isActive,
  onNavigate,
  row,
  wide,
  gradient,
}: {
  module: (typeof MODULES)[string];
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  row?: boolean;
  wide?: boolean;
  gradient?: boolean;
}) {
  const active = isActive(m.href);
  return (
    <Link
      href={m.href}
      onClick={onNavigate}
      className={cn(
        'block rounded-xl p-2.5 transition-all',
        row
          ? 'flex items-center gap-2 py-2 px-2.5'
          : 'flex flex-col items-center text-center gap-1 py-2.5',
        wide && 'p-3.5 items-start',
        active
          ? 'bg-[color:var(--accent-glow)] text-[color:var(--yellow)]'
          : 'bg-transparent hover:bg-[color:var(--bg-elevated)]',
        gradient &&
          'bg-[linear-gradient(135deg,rgba(250,204,21,0.06),rgba(45,212,191,0.06))] border-[color:var(--border-strong)] hover:border-[color:var(--accent)]'
      )}
    >
      <span className={cn('font-mono font-extrabold', wide ? 'text-lg' : 'text-xs', active && 'text-[color:var(--accent)]')}>
        {m.abbr}
      </span>
      <span className={cn(row ? 'flex-1 text-left' : '', 'text-[10px] font-semibold text-[color:var(--text-2)]', wide && 'text-xs text-[color:var(--text-1)]')}>
        {m.title}
      </span>
    </Link>
  );
}

function CapRow({
  module: m,
  isActive,
  onNavigate,
  accentColor,
}: {
  module: (typeof MODULES)[string];
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  accentColor: string;
}) {
  const active = isActive(m.href);
  const capLabel = CAP_LABELS[m.cap] || m.cap.toUpperCase();
  const hint = CAP_HINTS[m.key] || '';

  return (
    <Link
      href={m.href}
      onClick={onNavigate}
      className={cn(
        'group grid gap-2 rounded-xl px-3 py-2.5 transition-all',
        'grid-cols-[70px_1fr] items-baseline',
        active
          ? 'bg-[color:var(--accent-glow)] shadow-[inset_0_0_0_1px_rgba(79,70,229,0.08)]'
          : 'bg-transparent hover:bg-[color:var(--bg-elevated)] hover:translate-x-[2px]'
      )}
      style={active ? { boxShadow: `inset 3px 0 0 ${accentColor}` } : undefined}
    >
      <span
        className="font-mono text-[8px] font-extrabold uppercase tracking-widest"
        style={{ color: active ? accentColor : 'var(--text-3)' }}
      >
        {capLabel}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-bold text-[color:var(--text-1)]">{m.title}</span>
        {hint && (
          <span className="text-[9px] italic text-[color:var(--text-3)] mt-0.5">
            {hint}
          </span>
        )}
      </div>
    </Link>
  );
}
