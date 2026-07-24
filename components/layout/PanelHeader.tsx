'use client';

import { MODULES } from '@/lib/corpus/modules';
import { SdgStrip } from '@/components/common/SdgChip';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

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
    <div className="relative overflow-hidden flex items-start justify-between gap-5 border-b border-[color:var(--border)] bg-white px-5 py-6 sm:px-7 sm:py-8">
      <div aria-hidden="true" className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[color:var(--accent-glow)] blur-2xl" />
      <div className="relative flex flex-col gap-1.5 flex-1 min-w-0">
        <span className={cn(
          'inline-flex self-start text-[11px] font-semibold text-[color:var(--yellow)]'
        )}>
          {m.badge}
        </span>
        <h1 className="mt-1 text-2xl sm:text-[32px] font-extrabold tracking-[-0.03em] leading-tight">
          {m.title}
        </h1>
        <p className="text-sm sm:text-base font-semibold text-[color:var(--text-1)]">{m.purpose}</p>
        <p className="max-w-3xl text-sm text-[color:var(--text-2)] leading-relaxed">{m.desc}</p>
        <div className="mt-2"><SdgStrip moduleKey={moduleKey} /></div>
        <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
          {actions}
          <FeedbackButton moduleTitle={m.title} />
        </div>
      </div>
      <div className="relative hidden sm:flex flex-col gap-2 items-end flex-shrink-0">
        {actions}
        <FeedbackButton moduleTitle={m.title} />
      </div>
    </div>
  );
}

function FeedbackButton({ moduleTitle }: { moduleTitle: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const params = new URLSearchParams({ module: moduleTitle, source: pathname });
        router.push(`/dashboard/support/feedback?${params.toString()}`);
      }}
    >
      Share feedback
    </Button>
  );
}
