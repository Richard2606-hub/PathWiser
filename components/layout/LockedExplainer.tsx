'use client';

import { useAppStore } from '@/store/useAppStore';
import { ClosableOverlay, CloseButton } from '@/components/common/ClosableOverlay';
import { Button } from '@/components/common/Button';

const ROLE_LABEL: Record<string, string> = {
  candidate: 'Candidate',
  employer: 'Employer',
  university: 'University',
};

export function LockedExplainer() {
  const open = useAppStore((s) => s.lockedExplainerOpen);
  const target = useAppStore((s) => s.lockedExplainerTarget);
  const close = useAppStore((s) => s.closeLockedExplainer);
  const persona = useAppStore((s) => s.persona);
  const setJudgeMode = useAppStore((s) => s.setJudgeMode);

  const youAre = ROLE_LABEL[persona] || persona;
  const body = target
    ? (
      <>
        In production, the <strong>{ROLE_LABEL[target]}</strong> surface is a separate account —
        you cannot see it as a {youAre}. The Signal Loop here shows how <em>data</em> flows between
        audiences in the backend (the Career Twin Engine learns from all three), not how users navigate.
      </>
    )
    : (
      <>
        You&apos;re signed in as a <strong>{youAre}</strong>. In production, that&apos;s the only surface you see.
        The other audiences have their own accounts and dashboards.
      </>
    );

  return (
    <ClosableOverlay
      open={open}
      onClose={close}
      ariaLabel="Production view explainer"
      contentClassName="max-w-md p-6 gap-3"
    >
      <CloseButton onClick={close} />
      <div className="flex flex-col gap-3 pr-8">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[color:var(--amber)]">
          🔒 Production view · single audience
        </span>
        <p className="text-sm text-[color:var(--text-2)] leading-relaxed">{body}</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            variant="primary"
            onClick={() => {
              setJudgeMode(true);
              close();
            }}
          >
            🎬 Switch to Judge view
          </Button>
          <Button variant="ghost" onClick={close}>
            Stay in production view
          </Button>
        </div>
      </div>
    </ClosableOverlay>
  );
}
