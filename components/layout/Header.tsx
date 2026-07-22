'use client';

import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { AccountActions } from './AccountActions';
import { useRouter } from 'next/navigation';

const PERSONA_ICON: Record<string, string> = {
  candidate: '👤',
  employer: '🏢',
  university: '🎓',
};
const PERSONA_LABEL: Record<string, string> = {
  candidate: 'CANDIDATE',
  employer: 'EMPLOYER',
  university: 'UNIVERSITY',
};

export function Header() {
  const judgeEnabled = process.env.NEXT_PUBLIC_ENABLE_JUDGE_MODE === 'true';
  const router = useRouter();
  const persona = useAppStore((s) => s.persona);
  const judgeMode = useAppStore((s) => s.judgeMode);
  const identity = useAppStore((s) => s.identity);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleJudgeMode = useAppStore((s) => s.toggleJudgeMode);
  const setPersona = useAppStore((s) => s.setPersona);
  const openLockedExplainer = useAppStore((s) => s.openLockedExplainer);

  return (
    <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between gap-3 border-b border-[color:var(--border)] bg-white/95 px-4 py-3 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:px-7">
      {/* Left · hamburger + brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="lg:hidden w-9 h-9 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] hover:border-[color:var(--accent)] flex flex-col items-center justify-center gap-[3px]"
        >
          <span className="block w-4 h-0.5 rounded bg-[color:var(--text-1)]" />
          <span className="block w-4 h-0.5 rounded bg-[color:var(--text-1)]" />
          <span className="block w-4 h-0.5 rounded bg-[color:var(--text-1)]" />
        </button>
        <a href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--yellow)] text-xs font-extrabold text-white shadow-[0_6px_16px_rgba(79,70,229,0.2)]">PW</span>
          <span className="text-base sm:text-lg font-extrabold tracking-tight">
            Path<span className="text-[color:var(--yellow)]">Wiser</span>
          </span>
        </a>
      </div>

      {/* Center · engine status */}
      <div className="hidden md:flex items-center gap-2 rounded-full bg-[color:var(--bg-elevated)] px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--emerald)] opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--emerald)]" />
        </span>
        <span className="text-[11px] font-medium text-[color:var(--text-2)]">
          Evidence service online
        </span>
      </div>

      {/* Right · identity + judge toggle */}
      <div className="flex items-center gap-2">
        <AccountActions />
        {!(judgeEnabled && judgeMode) ? (
          <button
            type="button"
            onClick={() => openLockedExplainer(null)}
            aria-label={`${PERSONA_LABEL[persona].toLowerCase()} workspace for ${identity.name}. Open persona information`}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl',
              'border border-[color:var(--border)] bg-white shadow-sm',
              'hover:border-[color:var(--accent)] transition-colors'
            )}
          >
            <span className="text-base leading-none">{PERSONA_ICON[persona]}</span>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-[11px] font-bold">{identity.name}</span>
              <span
                className="font-mono text-[8px] tracking-widest"
                style={{
                  color:
                    persona === 'candidate' ? 'var(--yellow)' :
                    persona === 'employer' ? 'var(--teal)' : 'var(--violet)',
                }}
              >
                {PERSONA_LABEL[persona]}
              </span>
            </div>
          </button>
        ) : (
          <div className="flex gap-1">
            {(['candidate', 'employer', 'university'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setPersona(p); router.push(p === 'candidate' ? '/dashboard/candidate/path-navigator' : p === 'employer' ? '/dashboard/employer/talent-matching' : '/dashboard/university/outcome-loop'); }}
                aria-label={`Switch to ${p} workspace`}
                aria-pressed={persona === p}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-all',
                  persona === p
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent-glow)] text-[color:var(--text-1)]'
                    : 'border-[color:var(--border)] text-[color:var(--text-2)] hover:border-[color:var(--border-strong)]'
                )}
              >
                <span className="mr-1">{PERSONA_ICON[p]}</span>
                <span className="hidden sm:inline">{PERSONA_LABEL[p].charAt(0) + PERSONA_LABEL[p].slice(1).toLowerCase()}</span>
              </button>
            ))}
          </div>
        )}

        {judgeEnabled && <button
          type="button"
          onClick={toggleJudgeMode}
          aria-label={judgeMode ? 'Exit judge view and lock to one audience' : 'Enter judge view to compare all audiences'}
          aria-pressed={judgeMode}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold border transition-all',
            judgeMode
              ? 'border-[color:var(--accent)] bg-[color:var(--accent-glow)] text-[color:var(--text-1)]'
              : 'border-[color:var(--border)] text-[color:var(--text-2)] hover:border-[color:var(--accent)]'
          )}
          title={
            judgeMode
              ? 'Currently in judge view. Click to lock back to one persona.'
              : 'Currently in production view. Click to see all three audiences.'
          }
        >
          <span className="text-sm">🎬</span>
          <span className="hidden sm:inline">
            {judgeMode ? 'Lock to one view' : 'Judge view'}
          </span>
        </button>}
      </div>
    </header>
  );
}
