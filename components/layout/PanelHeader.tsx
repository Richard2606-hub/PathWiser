'use client';

import { useAppStore } from '@/store/useAppStore';
import { MODULES } from '@/lib/corpus/modules';
import { SdgStrip } from '@/components/common/SdgChip';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

/**
 * Panel header — the top strip of every module page.
 * Renders the badge · title · purpose line · SDG chips · feedback button.
 */
export function PanelHeader({
  moduleKey,
  actions,
}: {
  moduleKey: string;
  actions?: React.ReactNode;
}) {
  const m = MODULES[moduleKey];
  if (!m) return null;

  return (
    <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-[color:var(--border)]">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className={cn(
          'inline-flex self-start px-2.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-widest',
          'bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-[color:var(--text-2)]'
        )}>
          {m.badge}
        </span>
        <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight mt-1.5">
          {m.title}
        </h1>
        <p className="text-sm font-semibold text-[color:var(--text-1)]">{m.purpose}</p>
        <p className="text-xs text-[color:var(--text-3)] leading-relaxed max-w-3xl">{m.desc}</p>
        <SdgStrip moduleKey={moduleKey} />
      </div>
      <div className="flex flex-col gap-2 items-end flex-shrink-0">
        {actions}
        <FeedbackButton />
      </div>
    </div>
  );
}

function FeedbackButton() {
  const showToast = useAppStore((s) => s.showToast);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => showToast('Feedback captured — thank you. This feeds the corpus curation queue.', 'success')}
    >
      📝 Feedback
    </Button>
  );
}
