'use client';

import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

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
  const persona = useAppStore((s) => s.persona);
  const judgeMode = useAppStore((s) => s.judgeMode);
  const identity = useAppStore((s) => s.identity);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleJudgeMode = useAppStore((s) => s.toggleJudgeMode);
  const setPersona = useAppStore((s) => s.setPersona);
  const openLockedExplainer = useAppStore((s) => s.openLockedExplainer);

  return (
    <header className="sticky top-2.5 z-30 mx-2.5 mb-3.5 flex items-center justify-between gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-surface)] backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-3.5">
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
        <a href="/" className="flex items-center gap-1.5">
          <span className="font-mono text-lg font-extrabold text-[color:var(--yellow)]">[</span>
          <span className="text-sm sm:text-base font-extrabold tracking-tight">
            Path<span className="text-[color:var(--yellow)]">Wiser</span>
          </span>
          <span className="font-mono text-lg font-extrabold text-[color:var(--yellow)]">]</span>
        </a>
      </div>

      {/* Center · engine status */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--yellow)] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--yellow)]" />
        </span>
        <span className="font-mono text-[10px] text-[color:var(--text-2)]">
          Engine calibrated · 1,500 trajectories
        </span>
      </div>

      {/* Right · identity + judge toggle */}
      <div className="flex items-center gap-2">
        {!judgeMode ? (
          <button
            type="button"
            onClick={() => openLockedExplainer(null)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full',
              'border border-[color:var(--border-strong)] bg-[color:var(--bg-elevated)]',
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
                onClick={() => setPersona(p)}
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

        <button
          type="button"
          onClick={toggleJudgeMode}
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
        </button>
      </div>
    </header>
  );
}
